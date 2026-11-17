import { http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { queryClient } from "@/api/query-client";
import { readFromStorage, writeToStorage } from "@/utils/storage";
import {
  apiPath,
  errorResponse,
  makeUser,
  successResponse,
} from "@tests/helpers/mock-server/backend";
import { server } from "@tests/helpers/mock-server/server";
import { signIn, signOut, signOutEverywhere } from "@/auth/session";
import {
  getCurrentSession,
  markSignedIn,
  waitUntilSessionIsKnown,
} from "@/auth/session-store";
import { restoreSessionFromCookie } from "@/auth/session";

const session = { accessToken: "token-1", user: makeUser({ role: "STUDENT" }) };

describe("restoring the session at start", () => {
  it("signs in with the refresh cookie", async () => {
    server.use(
      http.post(apiPath("/user/auth/refresh"), () => successResponse(session))
    );
    const waiting = waitUntilSessionIsKnown();
    await restoreSessionFromCookie();
    expect((await waiting).status).toBe("signed-in");
    expect(getCurrentSession().user?.role).toBe("STUDENT");
  });

  it("is signed out when the server refuses", async () => {
    await restoreSessionFromCookie();
    expect(getCurrentSession().status).toBe("signed-out");
  });

  it("is signed out when the server can't be reached", async () => {
    server.use(
      http.post(apiPath("/user/auth/refresh"), () => errorResponse(503, "Down"))
    );
    await restoreSessionFromCookie();
    expect(getCurrentSession().status).toBe("signed-out");
  });

  it("never restores after a sign-out that happened offline, and finishes it", async () => {
    writeToStorage("signedOut", "1");
    let logoutToken: string | null = null;
    server.use(
      http.post(apiPath("/user/auth/refresh"), () => successResponse(session)),
      http.post(apiPath("/user/auth/logout"), ({ request }) => {
        logoutToken = request.headers.get("Authorization");
        return successResponse(null);
      })
    );
    await restoreSessionFromCookie();
    // The cookie's fresh token is used only to end the session on the server.
    expect(logoutToken).toBe("Bearer token-1");
    expect(getCurrentSession().status).toBe("signed-out");
    expect(readFromStorage("signedOut")).toBeNull();
  });
});

describe("signing in and out", () => {
  it("keeps the token in memory only", () => {
    signIn(session);
    expect(getCurrentSession().accessToken).toBe("token-1");
    expect(JSON.stringify({ ...window.localStorage })).not.toContain("token-1");
  });

  it("forgets the session and the cached data at once", async () => {
    markSignedIn("token-1", makeUser());
    queryClient.setQueryData(["study-plan"], { secret: true });
    const done = signOut();
    expect(getCurrentSession().status).toBe("signed-out");
    expect(queryClient.getQueryData(["study-plan"])).toBeUndefined();
    await done;
    expect(readFromStorage("signedOut")).toBeNull();
  });

  it("ends the server session with a fresh token when the access token has expired", async () => {
    markSignedIn("expired", makeUser());
    const logoutTokens: Array<string | null> = [];
    server.use(
      http.post(apiPath("/user/auth/refresh"), () => successResponse(session)),
      http.post(apiPath("/user/auth/logout"), ({ request }) => {
        const token = request.headers.get("Authorization");
        logoutTokens.push(token);
        return token === "Bearer token-1"
          ? successResponse(null)
          : errorResponse(401, "Unauthorized");
      })
    );
    await signOut();
    expect(logoutTokens).toEqual(["Bearer expired", "Bearer token-1"]);
    expect(getCurrentSession().status).toBe("signed-out");
    expect(readFromStorage("signedOut")).toBeNull();
  });

  it("is done when the server says there is no session left", async () => {
    markSignedIn("expired", makeUser());
    server.use(
      http.post(apiPath("/user/auth/logout"), () =>
        errorResponse(401, "Unauthorized")
      )
    );
    await signOut();
    expect(getCurrentSession().status).toBe("signed-out");
    expect(readFromStorage("signedOut")).toBeNull();
  });

  it("remembers to finish signing out when offline", async () => {
    markSignedIn("token-1", makeUser());
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    await signOut();
    expect(getCurrentSession().status).toBe("signed-out");
    expect(readFromStorage("signedOut")).toBe("1");
  });

  it("clears the offline sign-out flag on the next sign-in", () => {
    writeToStorage("signedOut", "1");
    signIn(session);
    expect(readFromStorage("signedOut")).toBeNull();
  });
});

describe("signing out of every device", () => {
  it("ends every session on the server, then here", async () => {
    markSignedIn("token-1", makeUser());
    let called = false;
    server.use(
      http.post(apiPath("/user/auth/logout-all"), ({ request }) => {
        called = request.headers.get("Authorization") === "Bearer token-1";
        return successResponse(null);
      })
    );
    await signOutEverywhere();
    expect(called).toBe(true);
    expect(getCurrentSession().status).toBe("signed-out");
  });

  it("stays signed in here when the server can't be reached", async () => {
    markSignedIn("token-1", makeUser());
    server.use(
      http.post(apiPath("/user/auth/logout-all"), () =>
        errorResponse(503, "Down")
      )
    );
    await expect(signOutEverywhere()).rejects.toThrow();
    expect(getCurrentSession().status).toBe("signed-in");
  });
});
