// Google sign-in without any Google script in the app (core-rules #8): a plain redirect.
//
//   1. "Continue with Google" is a link to Google's sign-in page. Clicking it first keeps a random
//      `state` and `nonce` (and where to go afterwards) in this tab only.
//   2. Google sends the person back to /auth/google/callback#id_token=…&state=…
//   3. The callback page checks `state` and `nonce`, removes the token from the address bar and
//      sends the ID token to POST /user/auth/google, which answers with the session and sets the
//      refresh cookie. The first sign-in also creates the account.
//
//   const request = createGoogleSignInRequest(searchParams.get("redirect"));
//   <a href={request.url} onClick={request.remember}>…</a>
//
//   const response = readGoogleSignInResponse(location.hash);   on the callback page, once
import { z } from "zod";
import { env } from "@/config/env";
import { logger } from "@/utils/logger";
import { getSafeRedirectPath } from "@/utils/safe-redirect";
import {
  readFromStorage,
  removeFromStorage,
  writeToStorage,
} from "@/utils/storage";

export const GOOGLE_CALLBACK_PATH = "/auth/google/callback";

const GOOGLE_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";

/** Shown on /login?error=…: the person closed Google's page, or anything else went wrong. */
export type GoogleSignInError = "google-cancelled" | "google-failed";

export interface GoogleSignInRequest {
  /** Google's sign-in page, or /login?error=google-failed when no client ID is set up. */
  url: string;
  /** Keeps `state`, `nonce` and the redirect in this tab. Call it as the person leaves. */
  remember: () => void;
}

export type GoogleSignInResponse =
  { idToken: string; redirect: string | null } | { error: GoogleSignInError };

const pendingSignInSchema = z.object({
  state: z.string().min(1),
  nonce: z.string().min(1),
  redirect: z.string().nullable(),
});

const idTokenClaimsSchema = z.object({ nonce: z.string() });

/** The link for "Continue with Google". Only a same-site `redirect` path is kept. */
export function createGoogleSignInRequest(
  redirect: string | null,
  clientId: string | null = env.googleClientId
): GoogleSignInRequest {
  if (!clientId) {
    return {
      url: `/login?error=google-failed`,
      remember: () => {
        logger.warn("VITE_GOOGLE_CLIENT_ID is not set: Google sign-in is off");
      },
    };
  }

  const pending = {
    state: crypto.randomUUID(),
    nonce: crypto.randomUUID(),
    redirect: getSafeRedirectPath(redirect, "") || null,
  };
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${window.location.origin}${GOOGLE_CALLBACK_PATH}`,
    response_type: "id_token",
    scope: "openid email profile",
    state: pending.state,
    nonce: pending.nonce,
    prompt: "select_account",
  });

  return {
    url: `${GOOGLE_AUTHORIZE_URL}?${params.toString()}`,
    remember: () => {
      writeToStorage("googleSignIn", JSON.stringify(pending));
    },
  };
}

/**
 * Reads what Google put after "#" and forgets the pending sign-in, so a response is used once.
 * An answer this tab did not ask for (wrong `state` or `nonce`) counts as a failure.
 */
export function readGoogleSignInResponse(hash: string): GoogleSignInResponse {
  const pending = readPendingSignIn();
  removeFromStorage("googleSignIn");

  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const googleError = params.get("error");
  if (googleError) {
    return {
      error:
        googleError === "access_denied" ? "google-cancelled" : "google-failed",
    };
  }

  const idToken = params.get("id_token");
  if (!pending || !idToken || params.get("state") !== pending.state) {
    return { error: "google-failed" };
  }
  if (readNonce(idToken) !== pending.nonce) return { error: "google-failed" };

  return { idToken, redirect: pending.redirect };
}

/** The `?error=` on /login, or null. An unknown value counts as "google-failed". */
export function readGoogleSignInError(
  value: string | null
): GoogleSignInError | null {
  if (!value) return null;
  return value === "google-cancelled" ? "google-cancelled" : "google-failed";
}

function readPendingSignIn() {
  const saved = readFromStorage("googleSignIn");
  if (!saved) return null;
  try {
    const parsed = pendingSignInSchema.safeParse(JSON.parse(saved));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/**
 * The `nonce` claim of the ID token. The token's signature is checked by the backend; this only
 * makes sure the token was issued for the sign-in this tab started.
 */
function readNonce(idToken: string): string | null {
  const payload = idToken.split(".")[1];
  if (!payload) return null;
  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const claims = idTokenClaimsSchema.safeParse(JSON.parse(atob(base64)));
    return claims.success ? claims.data.nonce : null;
  } catch {
    return null;
  }
}
