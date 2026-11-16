// Google sign-in goes through the backend, so no Google script runs in the app:
//
//   1. The login button is a link to GET {api}/user/auth/google?redirect=/plan
//   2. The backend sends the person to Google, and Google back to the backend.
//   3. The backend sets the refresh cookie and sends the person to /login?redirect=/plan.
//      At start the app restores the session from that cookie, and /login (a guest page) moves a
//      signed-in person on to `redirect`, or to their home.
//   4. When it fails, the backend sends the person to /login?error=google-cancelled|google-failed.
//
//   <a href={getGoogleSignInUrl(searchParams.get("redirect"))}>…</a>
import { env } from "@/config/env";
import { getSafeRedirectPath } from "@/utils/safe-redirect";

export const GOOGLE_SIGN_IN_PATH = "/user/auth/google";

export type GoogleSignInError = "google-cancelled" | "google-failed";

/** The backend's Google sign-in address. Only a same-site `redirect` path is passed on. */
export function getGoogleSignInUrl(redirect: string | null): string {
  const url = `${env.apiBaseUrl}${GOOGLE_SIGN_IN_PATH}`;
  const redirectPath = getSafeRedirectPath(redirect, "");
  if (!redirectPath) return url;
  return `${url}?${new URLSearchParams({ redirect: redirectPath }).toString()}`;
}

/** The `?error=` the backend sent back, or null. An unknown value counts as "google-failed". */
export function readGoogleSignInError(
  value: string | null
): GoogleSignInError | null {
  if (!value) return null;
  return value === "google-cancelled" ? "google-cancelled" : "google-failed";
}
