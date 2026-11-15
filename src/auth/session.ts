// Starting and ending a session. Screens call these; they never touch the store directly.
//
//   signIn(await api.post("/user/auth/login", sessionResponseSchema, values, { requiresAuth: false }))
//   await signOut()
//   await refreshAfterMembershipChange()   request approved, Organization left, invite accepted
//   initializeSession()                         once, in main.tsx
//
// Three things happen behind these calls:
//   - the person's other tabs follow a sign-in or sign-out (BroadcastChannel; only the event
//     travels, never a token or a name)
//   - a sign-out made while offline is finished once the device is back online, and the next
//     launch does not restore the session: phones and school computers are shared
//   - at app start one silent refresh restores the session from the refresh cookie
import { z } from "zod";
import { isApiError } from "@/api/api-error";
import { sendHttpRequest } from "@/api/http-request";
import { queryClient } from "@/api/query-client";
import { logger } from "@/utils/logger";
import {
  readFromStorage,
  removeFromStorage,
  writeToStorage,
} from "@/utils/storage";
import { AUTH_API_PATHS, refreshAccessToken } from "./session-refresh";
import {
  markSignedOut,
  getAccessToken,
  getCurrentSession,
  type SessionResponse,
  markSignedIn,
} from "./session-store";

// ---- Other tabs: tell them about a sign-in or sign-out, and listen to theirs ----

const CHANNEL_NAME = "buddy.session";

const messageSchema = z.object({ type: z.enum(["signed-in", "signed-out"]) });

export type SessionEvent = z.output<typeof messageSchema>["type"];

let tabChannel: BroadcastChannel | null | undefined;

function getTabChannel(): BroadcastChannel | null {
  if (tabChannel === undefined) {
    tabChannel =
      typeof BroadcastChannel === "undefined"
        ? null
        : new BroadcastChannel(CHANNEL_NAME);
  }
  return tabChannel;
}

export function notifyOtherTabs(type: SessionEvent): void {
  getTabChannel()?.postMessage({ type });
}

/** Calls `onEvent` when another tab signs in or out. Returns a function that stops listening. */
export function listenToOtherTabs(
  onEvent: (type: SessionEvent) => void
): () => void {
  const channel = getTabChannel();
  if (!channel) return () => {};

  const onMessage = (event: MessageEvent) => {
    const message = messageSchema.safeParse(event.data);
    if (message.success) onEvent(message.data.type);
  };
  channel.addEventListener("message", onMessage);
  return () => {
    channel.removeEventListener("message", onMessage);
  };
}

// ---- Sign in and sign out ----

/** After a successful login or sign-up: keep the token in memory and tell the other tabs. */
export function signIn(session: SessionResponse): void {
  removeFromStorage("signedOut");
  queryClient.clear();
  markSignedIn(session.accessToken, session.user);
  notifyOtherTabs("signed-in");
}

/**
 * Forgets the person in this tab at once (token and every cached answer), then tells the server.
 * When the server can't be reached, the device remembers to finish signing out once it is back
 * online, and the next launch does not restore the session: phones and school computers are shared.
 */
export async function signOut(): Promise<void> {
  const accessToken = getAccessToken();
  endLocalSession();
  try {
    await sendHttpRequest("POST", AUTH_API_PATHS.logout, z.unknown(), {
      accessToken,
    });
    removeFromStorage("signedOut");
  } catch (error) {
    if (shouldRetrySignOutLater(error)) writeToStorage("signedOut", "1");
    else removeFromStorage("signedOut");
  }
}

/** Ends the session in this tab only: memory token, query cache, and (by default) the other tabs. */
export function endLocalSession({
  shouldNotifyOtherTabs = true,
}: { shouldNotifyOtherTabs?: boolean } = {}): void {
  markSignedOut();
  queryClient.clear();
  if (shouldNotifyOtherTabs) notifyOtherTabs("signed-out");
}

export function hasPendingSignOut(): boolean {
  return readFromStorage("signedOut") === "1";
}

/** Finishes a sign-out that happened offline. Safe to call any time; does nothing otherwise. */
export async function finishPendingSignOut(): Promise<void> {
  if (!hasPendingSignOut()) return;
  try {
    await sendHttpRequest("POST", AUTH_API_PATHS.logout, z.unknown());
    removeFromStorage("signedOut");
  } catch (error) {
    if (!shouldRetrySignOutLater(error)) removeFromStorage("signedOut");
  }
}

/**
 * Membership changed (request approved, Organization left, invite accepted): the new token carries
 * the new Organization, and nothing cached for the old one may stay on screen.
 */
export async function refreshAfterMembershipChange(): Promise<void> {
  queryClient.clear();
  const refreshed = await refreshAccessToken();
  if (!refreshed) endLocalSession();
}

/** Offline, network trouble or a server error: the server never heard the sign-out. */
function shouldRetrySignOutLater(error: unknown): boolean {
  if (!isApiError(error)) return true;
  if (error.kind === "http") return error.status >= 500;
  if (error.kind === "invalid-response") return false;
  logger.info("Sign-out will be retried when back online");
  return true;
}

// ---- App start ----

/** Called once in main.tsx. Returns a function that stops the listeners (for tests). */
export function initializeSession(): () => void {
  void restoreSessionFromCookie();

  const stopListening = listenToOtherTabs((type) => {
    if (type === "signed-out") {
      endLocalSession({ shouldNotifyOtherTabs: false });
      return;
    }
    if (getCurrentSession().status === "signed-in") return;
    refreshAccessToken()
      .then((refreshed) => {
        if (!refreshed) markSignedOut();
      })
      .catch(() => {
        markSignedOut();
      });
  });

  const onOnline = () => {
    void finishPendingSignOut();
  };
  window.addEventListener("online", onOnline);

  return () => {
    stopListening();
    window.removeEventListener("online", onOnline);
  };
}

/** Signed in with the refresh cookie, or signed out. Never leaves the app "restoring". */
export async function restoreSessionFromCookie(): Promise<void> {
  if (hasPendingSignOut()) {
    // The person signed out while offline: never bring the session back on its own.
    markSignedOut();
    await finishPendingSignOut();
    return;
  }
  try {
    const refreshed = await refreshAccessToken();
    if (!refreshed) markSignedOut();
  } catch {
    // Offline or the server is down: show the login screen; it explains what's wrong.
    logger.info("The session could not be restored");
    markSignedOut();
  }
}
