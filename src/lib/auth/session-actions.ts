// Starting and ending a session. Screens call these; they never touch the store directly.
//
//   signIn(await api.post("/user/auth/login", sessionResponseSchema, values, { auth: false }))
//   await signOut()
//   await refreshAfterMembershipChange()   approved, left, invite accepted
import { z } from "zod";
import { isApiError } from "@/lib/api/api-error";
import { queryClient } from "@/lib/api/query-client";
import { send } from "@/lib/api/transport";
import { logger } from "@/lib/logger";
import { readStored, removeStored, writeStored } from "@/lib/storage";
import { AUTH_PATHS, refreshSession } from "./refresh";
import type { SessionResponse } from "./session-schemas";
import { clearSession, getAccessToken, setSession } from "./session-store";
import { announceSession } from "./session-sync";

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
    await send("POST", AUTH_PATHS.logout, z.unknown(), { accessToken });
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
    await send("POST", AUTH_PATHS.logout, z.unknown());
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
  const ok = await refreshSession();
  if (!ok) endSession();
}

/** Offline, network trouble or a server error: the server never heard the sign-out. */
function needsRetry(error: unknown): boolean {
  if (!isApiError(error)) return true;
  if (error.kind === "http") return error.status >= 500;
  if (error.kind === "invalid-response") return false;
  logger.info("Sign-out will be retried when back online");
  return true;
}
