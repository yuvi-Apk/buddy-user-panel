// Gets a new access token with the refresh cookie: at app start, and after a 401.
//
// Every refresh goes through one shared promise in this tab and one browser lock across tabs.
// The backend rotates the refresh cookie on every refresh, and reusing an old one revokes the
// whole session, so two refreshes at the same time would sign the person out.
import { isApiError } from "@/api/api-error";
import { sendHttpRequest } from "@/api/http-request";
import {
  markSignedIn,
  type SessionResponse,
  sessionResponseSchema,
} from "./session-store";

export const AUTH_API_PATHS = {
  googleSignIn: "/user/auth/google",
  refresh: "/user/auth/refresh",
  logout: "/user/auth/logout",
  logoutAllDevices: "/user/auth/logout-all",
} as const;

const LOCK_NAME = "buddy.session-refresh";

let refreshInProgress: Promise<SessionResponse | null> | null = null;

/**
 * True when the server gave a new token (the session store now holds it); false when it refused
 * (the session is over). Network trouble throws an ApiError instead: nothing is known yet.
 * Calls made while a refresh is running share it.
 */
export async function refreshAccessToken(): Promise<boolean> {
  const session = await requestFreshSession();
  if (!session) return false;
  markSignedIn(session.accessToken, session.user);
  return true;
}

/**
 * A new access token from the refresh cookie, without signing in with it (sign-out uses it to
 * reach the server once more). null when the server refused: there is no session.
 */
export function requestFreshSession(): Promise<SessionResponse | null> {
  refreshInProgress ??= runWithCrossTabLock(sendRefreshRequest).finally(() => {
    refreshInProgress = null;
  });
  return refreshInProgress;
}

async function sendRefreshRequest(): Promise<SessionResponse | null> {
  try {
    return await sendHttpRequest(
      "POST",
      AUTH_API_PATHS.refresh,
      sessionResponseSchema
    );
  } catch (error) {
    if (isApiError(error) && error.isClientError) return null;
    throw error;
  }
}

/** Runs `task` while holding the cross-tab lock (Web Locks). Older browsers just run it. */
function runWithCrossTabLock<T>(task: () => Promise<T>): Promise<T> {
  const locks = typeof navigator === "undefined" ? undefined : navigator.locks;
  if (!locks) return task();
  return locks.request(LOCK_NAME, task);
}
