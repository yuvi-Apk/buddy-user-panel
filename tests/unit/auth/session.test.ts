import { http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { queryClient } from "@/api/query-client";
import { readStored, writeStored } from "@/utils/storage";
import {
  apiPath,
  errorResponse,
  makeUser,
  successResponse,
} from "@tests/helpers/mock-server/backend";
import { server } from "@tests/helpers/mock-server/server";
import { signIn, signOut } from "@/auth/session";
import { getSession, setSession, waitForSession } from "@/auth/session-store";
import { restoreSession } from "@/auth/session";

const session = { accessToken: "token-1", user: makeUser({ role: "STUDENT" }) };

describe("restoring the session at start", () => {
  it("signs in with the refresh cookie", async () => {
    server.use(
      http.post(apiPath("/user/auth/refresh"), () => successResponse(session))
    );
    const waiting = waitForSession();
    await restoreSession();
    expect((await waiting).status).toBe("signed-in");
    expect(getSession().user?.role).toBe("STUDENT");
  });

  it("is signed out when the server refuses", async () => {
    await restoreSession();
    expect(getSession().status).toBe("signed-out");
  });

  it("is signed out when the server can't be reached", async () => {
    server.use(
      http.post(apiPath("/user/auth/refresh"), () => errorResponse(503, "Down"))
    );
    await restoreSession();
    expect(getSession().status).toBe("signed-out");
  });

  it("never restores after a sign-out that happened offline, and finishes it", async () => {
    writeStored("signedOut", "1");
    let refreshed = false;
    server.use(
      http.post(apiPath("/user/auth/refresh"), () => {
        refreshed = true;
        return successResponse(session);
      })
    );
    await restoreSession();
    expect(refreshed).toBe(false);
    expect(getSession().status).toBe("signed-out");
    expect(readStored("signedOut")).toBeNull();
  });
});

describe("signing in and out", () => {
  it("keeps the token in memory only", () => {
    signIn(session);
    expect(getSession().accessToken).toBe("token-1");
    expect(JSON.stringify({ ...window.localStorage })).not.toContain("token-1");
  });

  it("forgets the session and the cached data at once", async () => {
    setSession("token-1", makeUser());
    queryClient.setQueryData(["study-plan"], { secret: true });
    const done = signOut();
    expect(getSession().status).toBe("signed-out");
    expect(queryClient.getQueryData(["study-plan"])).toBeUndefined();
    await done;
    expect(readStored("signedOut")).toBeNull();
  });

  it("remembers to finish signing out when offline", async () => {
    setSession("token-1", makeUser());
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    await signOut();
    expect(getSession().status).toBe("signed-out");
    expect(readStored("signedOut")).toBe("1");
  });

  it("clears the offline sign-out flag on the next sign-in", () => {
    writeStored("signedOut", "1");
    signIn(session);
    expect(readStored("signedOut")).toBeNull();
  });
});
