import { delay, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { getLang } from "@/lang";
import {
  getAccessToken,
  getSession,
  setSession,
} from "@/lib/auth/session-store";
import {
  apiPath,
  fail,
  makeUser,
  ok,
  validationFailed,
} from "@/test/msw/backend";
import { server } from "@/test/msw/server";
import { ApiError } from "./api-error";
import { api } from "./client";
import { pageSchema } from "./envelope";

const lang = getLang();
const topicSchema = z.object({ id: z.string(), name: z.string() });

async function caught(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof ApiError) return error;
    throw error;
  }
  throw new Error("Expected the call to fail.");
}

describe("api client: responses", () => {
  it("unwraps the envelope and checks data with the schema", async () => {
    server.use(
      http.get(apiPath("/user/topics/t1"), () =>
        ok({ id: "t1", name: "Algebra", extra: 1 })
      )
    );
    await expect(api.get("/user/topics/t1", topicSchema)).resolves.toEqual({
      id: "t1",
      name: "Algebra",
    });
  });

  it("sends query values and reads a page of a list", async () => {
    let search = "";
    server.use(
      http.get(apiPath("/user/topics"), ({ request }) => {
        search = new URL(request.url).search;
        return ok({
          items: [],
          meta: { page: 2, limit: 20, total: 0, totalPages: 0 },
        });
      })
    );
    const page = await api.get("/user/topics", pageSchema(topicSchema), {
      query: { page: 2, limit: 20, filter: undefined },
    });
    expect(search).toBe("?page=2&limit=20");
    expect(page.meta.page).toBe(2);
  });

  it("refuses data that does not match the schema", async () => {
    server.use(http.get(apiPath("/user/topics/t1"), () => ok({ id: 1 })));
    const error = await caught(api.get("/user/topics/t1", topicSchema));
    expect(error.kind).toBe("invalid-response");
    expect(error.message).toBe(lang.errors.unexpected);
  });

  it("turns validation errors into field errors, with the request id", async () => {
    server.use(
      http.post(apiPath("/user/profile"), () =>
        validationFailed({ name: "Name is required" })
      )
    );
    const error = await caught(
      api.post("/user/profile", z.unknown(), { name: "" })
    );
    expect(error.status).toBe(400);
    expect(error.message).toBe("Validation failed");
    expect(error.fieldErrors).toEqual({ name: "Name is required" });
    expect(error.requestId).toMatch(/^test-request-/);
  });

  it("shows the server's sentence for a 4xx, and our own for 5xx and 429", async () => {
    server.use(
      http.get(apiPath("/a"), () => fail(404, "This class no longer exists"))
    );
    expect((await caught(api.get("/a", z.unknown()))).message).toBe(
      "This class no longer exists"
    );

    server.use(
      http.get(apiPath("/b"), () => fail(500, "TypeError: x is undefined"))
    );
    expect((await caught(api.get("/b", z.unknown()))).message).toBe(
      lang.errors.server
    );

    server.use(http.get(apiPath("/c"), () => fail(429, "Too many requests")));
    expect((await caught(api.get("/c", z.unknown()))).message).toBe(
      lang.errors.tooManyAttempts
    );
  });

  it("fails calmly while offline, without sending anything", async () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    const error = await caught(api.get("/user/topics", z.unknown()));
    expect(error.kind).toBe("offline");
    expect(error.message).toBe(lang.errors.offline);
  });

  it("gives up after the timeout", async () => {
    server.use(
      http.get(apiPath("/slow"), async () => {
        await delay(200);
        return ok(null);
      })
    );
    const error = await caught(
      api.get("/slow", z.unknown(), { timeoutMs: 20 })
    );
    expect(error.kind).toBe("timeout");
  });
});

describe("api client: the session", () => {
  it("sends the access token from memory", async () => {
    setSession("token-1", makeUser());
    let authorization: string | null = null;
    server.use(
      http.get(apiPath("/me"), ({ request }) => {
        authorization = request.headers.get("Authorization");
        return ok(null);
      })
    );
    await api.get("/me", z.null());
    expect(authorization).toBe("Bearer token-1");
  });

  it("sends no token for calls made while signed out (auth: false)", async () => {
    setSession("token-1", makeUser());
    let authorization: string | null = "unset";
    server.use(
      http.post(apiPath("/user/auth/login"), ({ request }) => {
        authorization = request.headers.get("Authorization");
        return fail(401, "Invalid email or password");
      })
    );
    const error = await caught(
      api.post("/user/auth/login", z.unknown(), {}, { auth: false })
    );
    expect(authorization).toBeNull();
    expect(error.status).toBe(401);
    // A wrong password is just an answer: the session is untouched.
    expect(getAccessToken()).toBe("token-1");
  });

  it("refreshes once on a 401 and tries again, shared by every request at that moment", async () => {
    setSession("old-token", makeUser());
    let refreshes = 0;
    server.use(
      http.post(apiPath("/user/auth/refresh"), async () => {
        refreshes++;
        await delay(10);
        return ok({ accessToken: "new-token", user: makeUser() });
      }),
      http.get(apiPath("/user/topics/:id"), ({ request, params }) =>
        request.headers.get("Authorization") === "Bearer new-token"
          ? ok({ id: String(params.id), name: "Topic" })
          : fail(401, "Token expired")
      )
    );

    const results = await Promise.all(
      ["a", "b", "c"].map((id) => api.get(`/user/topics/${id}`, topicSchema))
    );

    expect(results.map((topic) => topic.id)).toEqual(["a", "b", "c"]);
    expect(refreshes).toBe(1);
    expect(getAccessToken()).toBe("new-token");
  });

  it("signs out when the refresh is refused, and keeps the 401", async () => {
    setSession("old-token", makeUser());
    server.use(
      http.get(apiPath("/user/topics"), () => fail(401, "Token expired"))
    );

    const error = await caught(api.get("/user/topics", z.unknown()));

    expect(error.status).toBe(401);
    expect(getSession()).toEqual({
      status: "signed-out",
      user: null,
      accessToken: null,
    });
  });

  it("does not loop when the retry gets a 401 too", async () => {
    setSession("old-token", makeUser());
    let calls = 0;
    server.use(
      http.post(apiPath("/user/auth/refresh"), () =>
        ok({ accessToken: "new-token", user: makeUser() })
      ),
      http.get(apiPath("/user/topics"), () => {
        calls++;
        return fail(401, "Not allowed");
      })
    );
    const error = await caught(api.get("/user/topics", z.unknown()));
    expect(error.status).toBe(401);
    expect(calls).toBe(2);
  });
});
