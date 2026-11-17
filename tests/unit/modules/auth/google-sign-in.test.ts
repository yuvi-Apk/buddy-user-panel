import { describe, expect, it } from "vitest";
import {
  createGoogleSignInRequest,
  readGoogleSignInError,
  readGoogleSignInResponse,
} from "@/modules/auth/google-sign-in";
import { readFromStorage } from "@/utils/storage";

/** A fake ID token: only its payload is read in the browser (the backend checks the signature). */
function idTokenWithNonce(nonce: string): string {
  const payload = btoa(JSON.stringify({ nonce, sub: "1" }))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `header.${payload}.signature`;
}

/** Starts a sign-in as the login page does and returns what Google would get. */
function startSignIn(redirect: string | null = null) {
  const request = createGoogleSignInRequest(redirect, "client-1");
  request.remember();
  const params = new URL(request.url).searchParams;
  return {
    params,
    state: params.get("state") ?? "",
    nonce: params.get("nonce") ?? "",
  };
}

describe("createGoogleSignInRequest", () => {
  it("asks Google for an ID token for this app's callback", () => {
    const { params } = startSignIn();
    expect(params.get("client_id")).toBe("client-1");
    expect(params.get("response_type")).toBe("id_token");
    expect(params.get("scope")).toBe("openid email profile");
    expect(params.get("redirect_uri")).toBe(
      `${window.location.origin}/auth/google/callback`
    );
  });

  it("uses new random state and nonce each time", () => {
    const first = startSignIn();
    const second = startSignIn();
    expect(first.state).not.toBe(second.state);
    expect(first.nonce).not.toBe(first.state);
  });

  it("keeps nothing until the person leaves, and then in this tab only", () => {
    const request = createGoogleSignInRequest(null, "client-1");
    expect(readFromStorage("googleSignIn")).toBeNull();
    request.remember();
    expect(
      window.sessionStorage.getItem("buddy.google-sign-in")
    ).not.toBeNull();
    expect(window.localStorage.getItem("buddy.google-sign-in")).toBeNull();
  });

  it("points back to the login error when no client ID is set up", () => {
    expect(createGoogleSignInRequest(null, null).url).toBe(
      "/login?error=google-failed"
    );
  });
});

describe("readGoogleSignInResponse", () => {
  it("gives the ID token and the same-site redirect, once", () => {
    const { state, nonce } = startSignIn("/plan?week=2");
    const idToken = idTokenWithNonce(nonce);
    const hash = `#id_token=${idToken}&state=${state}`;

    expect(readGoogleSignInResponse(hash)).toEqual({
      idToken,
      redirect: "/plan?week=2",
    });
    expect(readGoogleSignInResponse(hash)).toEqual({ error: "google-failed" });
  });

  it("drops a redirect to another site", () => {
    const { state, nonce } = startSignIn("https://evil.example");
    const response = readGoogleSignInResponse(
      `#id_token=${idTokenWithNonce(nonce)}&state=${state}`
    );
    expect(response).toMatchObject({ redirect: null });
  });

  it("refuses an answer with another state", () => {
    const { nonce } = startSignIn();
    expect(
      readGoogleSignInResponse(
        `#id_token=${idTokenWithNonce(nonce)}&state=someone-elses`
      )
    ).toEqual({ error: "google-failed" });
  });

  it("refuses a token issued for another sign-in (nonce)", () => {
    const { state } = startSignIn();
    expect(
      readGoogleSignInResponse(
        `#id_token=${idTokenWithNonce("other")}&state=${state}`
      )
    ).toEqual({ error: "google-failed" });
  });

  it("refuses an answer this tab never asked for", () => {
    expect(
      readGoogleSignInResponse(`#id_token=${idTokenWithNonce("x")}&state=x`)
    ).toEqual({ error: "google-failed" });
  });

  it("tells a closed Google page from a failure", () => {
    startSignIn();
    expect(readGoogleSignInResponse("#error=access_denied")).toEqual({
      error: "google-cancelled",
    });
    expect(readGoogleSignInResponse("#error=server_error")).toEqual({
      error: "google-failed",
    });
  });
});

describe("readGoogleSignInError", () => {
  it("reads the login page's ?error=", () => {
    expect(readGoogleSignInError(null)).toBeNull();
    expect(readGoogleSignInError("google-cancelled")).toBe("google-cancelled");
    expect(readGoogleSignInError("anything")).toBe("google-failed");
  });
});
