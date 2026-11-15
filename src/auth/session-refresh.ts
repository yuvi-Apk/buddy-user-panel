// Gets a new access token with the refresh cookie: at app start, and after a 401.
//
// Every refresh goes through one shared promise in this tab and one browser lock across tabs.
// The backend rotates the refresh cookie on every refresh, and reusing an old one revokes the
// whole session, so two refreshes at the same time would sign the person out.
import { isApiError } from "@/api/api-error";
import { sendHttpRequest } from "@/api/http-request";
import { sessionResponseSchema, markSignedIn } from "./session-store";

export const AUTH_API_PATHS = {
  refresh: "/user/auth/refresh",
  logout: "/user/auth/logout",
} as const;

const LOCK_NAME = "buddy.session-refresh";

let refreshInProgress: Promise<boolean> | null = null;

/**
 * True when the server gave a new token (the session store now holds it); false when it refused
 * (the session is over). Network trouble throws an ApiError instead: nothing is known yet.
 * Calls made while a refresh is running share it.
 */
export function refreshAccessToken(): Promise<boolean> {
  refreshInProgress ??= runWithCrossTabLock(requestNewAccessToken).finally(
    () => {
      refreshInProgress = null;
    }
  );
  return refreshInProgress;
}

async function requestNewAccessToken(): Promise<boolean> {
  try {
    const session = await sendHttpRequest(
      "POST",
      AUTH_API_PATHS.refresh,
      sessionResponseSchema
    );
    markSignedIn(session.accessToken, session.user);
    return true;
  } catch (error) {
    if (isApiError(error) && error.isClientError) return false;
    throw error;
  }
}

/** Runs `task` while holding the cross-tab lock (Web Locks). Older browsers just run it. */
function runWithCrossTabLock<T>(task: () => Promise<T>): Promise<T> {
  const locks = typeof navigator === "undefined" ? undefined : navigator.locks;
  if (!locks) return task();
  return locks.request(LOCK_NAME, task);
}
