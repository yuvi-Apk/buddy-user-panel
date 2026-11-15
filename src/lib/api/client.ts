// The API client: the one way features talk to the backend (core-rules #9). Only a feature's
// api/ folder calls it.
//
//   api.get("/user/study-plan/today", todayPlanSchema, { signal })
//   api.post("/user/memberships/requests", requestSchema, { code })
//   api.get("/user/topics", pageSchema(topicSchema), { query: { page, limit: 20 } })
//
// It sends the access token from memory, unwraps the backend's envelope, checks `data` with the
// schema, and throws ApiError for everything else (see transport.ts). On a 401 it refreshes the
// session once (shared by every request that got a 401 at the same time) and tries again once.
// If the refresh is refused, the person is signed out and the router sends them to /login.
import type { z } from "zod";
import { refreshSession } from "@/lib/auth/refresh";
import { endSession } from "@/lib/auth/session-actions";
import { getAccessToken } from "@/lib/auth/session-store";
import { isApiError } from "./api-error";
import { type HttpMethod, type QueryValue, send } from "./transport";

export interface RequestOptions {
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
  timeoutMs?: number;
  /**
   * false for calls made while signed out (login, sign-up, password reset): no token is sent and
   * a 401 is just an answer, not a reason to refresh.
   */
  auth?: boolean;
}

async function request<Schema extends z.ZodType>(
  method: HttpMethod,
  path: string,
  schema: Schema,
  body: unknown,
  options: RequestOptions = {}
): Promise<z.output<Schema>> {
  const { auth = true, ...sendOptions } = options;
  const call = (accessToken: string | null) =>
    send(method, path, schema, { ...sendOptions, body, accessToken });

  if (!auth) return call(null);

  const accessToken = getAccessToken();
  try {
    return await call(accessToken);
  } catch (error) {
    if (!isApiError(error) || error.status !== 401) throw error;

    // Another request may already have refreshed while this one was on its way.
    const current = getAccessToken();
    if (current && current !== accessToken) return call(current);

    const refreshed = await refreshSession();
    if (!refreshed) {
      endSession();
      throw error;
    }
    return call(getAccessToken());
  }
}

export const api = {
  get: <Schema extends z.ZodType>(
    path: string,
    schema: Schema,
    options?: RequestOptions
  ) => request("GET", path, schema, undefined, options),
  post: <Schema extends z.ZodType>(
    path: string,
    schema: Schema,
    body?: unknown,
    options?: RequestOptions
  ) => request("POST", path, schema, body, options),
  put: <Schema extends z.ZodType>(
    path: string,
    schema: Schema,
    body?: unknown,
    options?: RequestOptions
  ) => request("PUT", path, schema, body, options),
  patch: <Schema extends z.ZodType>(
    path: string,
    schema: Schema,
    body?: unknown,
    options?: RequestOptions
  ) => request("PATCH", path, schema, body, options),
  delete: <Schema extends z.ZodType>(
    path: string,
    schema: Schema,
    options?: RequestOptions
  ) => request("DELETE", path, schema, undefined, options),
};
