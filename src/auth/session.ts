// Starting and ending a session. Screens call these; they never touch the store directly.
//
//   signIn(await api.post("/user/auth/login", sessionResponseSchema, values, { auth: false }))
//   await signOut()
//   await refreshAfterMembershipChange()   request approved, Organization left, invite accepted
//   startSession()                         once, in main.tsx
//
// Three things happen behind these calls:
//   - the person's other tabs follow a sign-in or sign-out (BroadcastChannel; only the event
//     travels, never a token or a name)
//   - a sign-out made while offline is finished once the device is back online, and the next
//     launch does not restore the session: phones and school computers are shared
//   - at app start one silent refresh restores the session from the refresh cookie
import { z } from "zod";
import { isApiError } from "@/api/api-error";
import { sendRequest } from "@/api/http-request";
import { queryClient } from "@/api/query-client";
import { logger } from "@/utils/logger";
import { readStored, removeStored, writeStored } from "@/utils/storage";
import { AUTH_PATHS, refreshSession } from "./session-refresh";
import {
  clearSession,
  getAccessToken,
  getSession,
  type SessionResponse,
  setSession,
} from "./session-store";

const CHANNEL_NAME = "buddy.session";

const messageSchema = z.object({ type: z.enum(["signed-in", "signed-out"]) });

export type SessionEvent = z.output<typeof messageSchema>["type"];

let channel: BroadcastChannel | null | undefined;

function getChannel(): BroadcastChannel | null {
  if (channel === undefined) {
    channel =
      typeof BroadcastChannel === "undefined"
        ? null
        : new BroadcastChannel(CHANNEL_NAME);
  }
  return channel;
}

export function announceSession(type: SessionEvent): void {
  getChannel()?.postMessage({ type });
}

/** Calls `onEvent` when another tab signs in or out. Returns a function that stops listening. */
export function listenForSessionEvents(
  onEvent: (type: SessionEvent) => void
): () => void {
  const current = getChannel();
  if (!current) return () => {};

  const onMessage = (event: MessageEvent) => {
    const message = messageSchema.safeParse(event.data);
    if (message.success) onEvent(message.data.type);
  };
  current.addEventListener("message", onMessage);
  return () => {
    current.removeEventListener("message", onMessage);
  };
}

/** After a successful login or sign-up: keep the token in memory and tell the other tabs. */
export function signIn(session: SessionResponse): void {
  removeStored("signedOut");
  queryClient.clear();
  setSession(session.accessToken, session.user);
  announceSession("signed-in");
}

/**
 * Forgets the person in this tab at once (token and every cached answer), then tells the server.
 * When the server can't be reached, the device remembers to finish signing out once it is back
 * online, and the next launch does not restore the session: phones and school computers are shared.
 */
export async function signOut(): Promise<void> {
  const accessToken = getAccessToken();
  endSession();
  try {
    await sendRequest("POST", AUTH_PATHS.logout, z.unknown(), { accessToken });
    removeStored("signedOut");
  } catch (error) {
    if (needsRetry(error)) writeStored("signedOut", "1");
    else removeStored("signedOut");
  }
}

/** Ends the session in this tab only: memory token, query cache, and (by default) the other tabs. */
export function endSession({
  announce = true,
}: { announce?: boolean } = {}): void {
  clearSession();
  queryClient.clear();
  if (announce) announceSession("signed-out");
}

export function hasPendingSignOut(): boolean {
  return readStored("signedOut") === "1";
}

/** Finishes a sign-out that happened offline. Safe to call any time; does nothing otherwise. */
export async function retryPendingSignOut(): Promise<void> {
  if (!hasPendingSignOut()) return;
  try {
    await sendRequest("POST", AUTH_PATHS.logout, z.unknown());
    removeStored("signedOut");
  } catch (error) {
    if (!needsRetry(error)) removeStored("signedOut");
  }
}

/**
 * Membership changed (request approved, Organization left, invite accepted): the new token carries
 * the new Organization, and nothing cached for the old one may stay on screen.
 */
export async function refreshAfterMembershipChange(): Promise<void> {
  queryClient.clear();
  const refreshed = await refreshSession();
  if (!refreshed) endSession();
}

/** Offline, network trouble or a server error: the server never heard the sign-out. */
function needsRetry(error: unknown): boolean {
  if (!isApiError(error)) return true;
  if (error.kind === "http") return error.status >= 500;
  if (error.kind === "invalid-response") return false;
  logger.info("Sign-out will be retried when back online");
  return true;
}

/** Returns a function that stops the listeners (for tests). */
export function startSession(): () => void {
  void restoreSession();

  const stopListening = listenForSessionEvents((type) => {
    if (type === "signed-out") {
      endSession({ announce: false });
      return;
    }
    if (getSession().status === "signed-in") return;
    refreshSession()
      .then((refreshed) => {
        if (!refreshed) clearSession();
      })
      .catch(() => {
        clearSession();
      });
  });

  const onOnline = () => {
    void retryPendingSignOut();
  };
  window.addEventListener("online", onOnline);

  return () => {
    stopListening();
    window.removeEventListener("online", onOnline);
  };
}

/** Signed in with the refresh cookie, or signed out. Never leaves the app "restoring". */
export async function restoreSession(): Promise<void> {
  if (hasPendingSignOut()) {
    // The person signed out while offline: never bring the session back on its own.
    clearSession();
    await retryPendingSignOut();
    return;
  }
  try {
    const refreshed = await refreshSession();
    if (!refreshed) clearSession();
  } catch {
    // Offline or the server is down: show the login screen; it explains what's wrong.
    logger.info("The session could not be restored");
    clearSession();
  }
}
