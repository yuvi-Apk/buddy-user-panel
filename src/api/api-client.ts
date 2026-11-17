// The API client: the one way modules talk to the backend. Only a module's
// api/ folder calls it.
//
//   api.get("/user/study-plan/today", todayPlanSchema, { signal })
//   api.post("/user/memberships/requests", requestSchema, { code })
//   api.get("/user/topics", paginatedListSchema(topicSchema), { query: { page, limit: 20 } })
//
// It sends the access token from memory, unwraps the backend's envelope, checks `data` with the
// schema, and throws ApiError for everything else (see http-request.ts). On a 401 it refreshes the
// session once (shared by every request that got a 401 at the same time) and tries again once.
// If the refresh is refused, the person is signed out and the router sends them to /login.
import type { z } from "zod";
import { refreshAccessToken } from "@/auth/session-refresh";
import { endLocalSession } from "@/auth/session";
import { getAccessToken } from "@/auth/session-store";
import { isApiError } from "./api-error";
import {
  type HttpMethod,
  type QueryParamValue,
  sendHttpRequest,
} from "./http-request";

export interface ApiRequestOptions {
  query?: Record<string, QueryParamValue>;
  signal?: AbortSignal;
  timeoutMs?: number;
  /**
   * false for calls made while signed out (Google sign-in): no token is sent and
   * a 401 is just an answer, not a reason to refresh.
   */
  requiresAuth?: boolean;
}

async function requestWithAuth<Schema extends z.ZodType>(
  method: HttpMethod,
  path: string,
  schema: Schema,
  body: unknown,
  options: ApiRequestOptions = {}
): Promise<z.output<Schema>> {
  const { requiresAuth = true, ...requestOptions } = options;
  const sendWithToken = (accessToken: string | null) =>
    sendHttpRequest(method, path, schema, {
      ...requestOptions,
      body,
      accessToken,
    });

  if (!requiresAuth) return sendWithToken(null);

  const accessToken = getAccessToken();
  try {
    return await sendWithToken(accessToken);
  } catch (error) {
    if (!isApiError(error) || error.status !== 401) throw error;

    // Another request may already have refreshed while this one was on its way.
    const latestAccessToken = getAccessToken();
    if (latestAccessToken && latestAccessToken !== accessToken)
      return sendWithToken(latestAccessToken);

    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      endLocalSession();
      throw error;
    }
    return sendWithToken(getAccessToken());
  }
}

export const api = {
  get: <Schema extends z.ZodType>(
    path: string,
    schema: Schema,
    options?: ApiRequestOptions
  ) => requestWithAuth("GET", path, schema, undefined, options),
  post: <Schema extends z.ZodType>(
    path: string,
    schema: Schema,
    body?: unknown,
    options?: ApiRequestOptions
  ) => requestWithAuth("POST", path, schema, body, options),
  put: <Schema extends z.ZodType>(
    path: string,
    schema: Schema,
    body?: unknown,
    options?: ApiRequestOptions
  ) => requestWithAuth("PUT", path, schema, body, options),
  patch: <Schema extends z.ZodType>(
    path: string,
    schema: Schema,
    body?: unknown,
    options?: ApiRequestOptions
  ) => requestWithAuth("PATCH", path, schema, body, options),
  delete: <Schema extends z.ZodType>(
    path: string,
    schema: Schema,
    options?: ApiRequestOptions
  ) => requestWithAuth("DELETE", path, schema, undefined, options),
};
