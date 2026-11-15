import { delay, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { getLang } from "@/lang";
import {
  getAccessToken,
  getCurrentSession,
  markSignedIn,
} from "@/auth/session-store";
import {
  apiPath,
  errorResponse,
  makeUser,
  successResponse,
  validationFailed,
} from "@tests/helpers/mock-server/backend";
import { server } from "@tests/helpers/mock-server/server";
import { ApiError } from "@/api/api-error";
import { api } from "@/api/api-client";
import { paginatedListSchema } from "@/api/response-schemas";

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
        successResponse({ id: "t1", name: "Algebra", extra: 1 })
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
        return successResponse({
          items: [],
          meta: { page: 2, limit: 20, total: 0, totalPages: 0 },
        });
      })
    );
    const page = await api.get(
      "/user/topics",
      paginatedListSchema(topicSchema),
      {
        query: { page: 2, limit: 20, filter: undefined },
      }
    );
    expect(search).toBe("?page=2&limit=20");
    expect(page.meta.page).toBe(2);
  });

  it("refuses data that does not match the schema", async () => {
    server.use(
      http.get(apiPath("/user/topics/t1"), () => successResponse({ id: 1 }))
    );
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
      http.get(apiPath("/a"), () =>
        errorResponse(404, "This class no longer exists")
      )
    );
    expect((await caught(api.get("/a", z.unknown()))).message).toBe(
      "This class no longer exists"
    );

    server.use(
      http.get(apiPath("/b"), () =>
        errorResponse(500, "TypeError: x is undefined")
      )
    );
    expect((await caught(api.get("/b", z.unknown()))).message).toBe(
      lang.errors.server
    );

    server.use(
      http.get(apiPath("/c"), () => errorResponse(429, "Too many requests"))
    );
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
        return successResponse(null);
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
    markSignedIn("token-1", makeUser());
    let authorization: string | null = null;
    server.use(
      http.get(apiPath("/me"), ({ request }) => {
        authorization = request.headers.get("Authorization");
        return successResponse(null);
      })
    );
    await api.get("/me", z.null());
    expect(authorization).toBe("Bearer token-1");
  });

  it("sends no token for calls made while signed out (requiresAuth: false)", async () => {
    markSignedIn("token-1", makeUser());
    let authorization: string | null = "unset";
    server.use(
      http.post(apiPath("/user/auth/login"), ({ request }) => {
        authorization = request.headers.get("Authorization");
        return errorResponse(401, "Invalid email or password");
      })
    );
    const error = await caught(
      api.post("/user/auth/login", z.unknown(), {}, { requiresAuth: false })
    );
    expect(authorization).toBeNull();
    expect(error.status).toBe(401);
    // A wrong password is just an answer: the session is untouched.
    expect(getAccessToken()).toBe("token-1");
  });

  it("refreshes once on a 401 and tries again, shared by every request at that moment", async () => {
    markSignedIn("old-token", makeUser());
    let refreshes = 0;
    server.use(
      http.post(apiPath("/user/auth/refresh"), async () => {
        refreshes++;
        await delay(10);
        return successResponse({ accessToken: "new-token", user: makeUser() });
      }),
      http.get(apiPath("/user/topics/:id"), ({ request, params }) =>
        request.headers.get("Authorization") === "Bearer new-token"
          ? successResponse({ id: String(params.id), name: "Topic" })
          : errorResponse(401, "Token expired")
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
    markSignedIn("old-token", makeUser());
    server.use(
      http.get(apiPath("/user/topics"), () =>
        errorResponse(401, "Token expired")
      )
    );

    const error = await caught(api.get("/user/topics", z.unknown()));

    expect(error.status).toBe(401);
    expect(getCurrentSession()).toEqual({
      status: "signed-out",
      user: null,
      accessToken: null,
    });
  });

  it("does not loop when the retry gets a 401 too", async () => {
    markSignedIn("old-token", makeUser());
    let calls = 0;
    server.use(
      http.post(apiPath("/user/auth/refresh"), () =>
        successResponse({ accessToken: "new-token", user: makeUser() })
      ),
      http.get(apiPath("/user/topics"), () => {
        calls++;
        return errorResponse(401, "Not allowed");
      })
    );
    const error = await caught(api.get("/user/topics", z.unknown()));
    expect(error.status).toBe(401);
    expect(calls).toBe(2);
  });
});
