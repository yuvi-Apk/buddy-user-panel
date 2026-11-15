// One HTTP request to the backend, without any session logic: fetch, timeout, the response
// envelope, the Zod check, and errors as ApiError. The session code (src/auth/session-refresh.ts) uses
// it directly for the refresh call; everything else goes through `api` in client.ts.
import type { z } from "zod";
import { env } from "@/config/env";
import { logger } from "@/utils/logger";
import { ApiError } from "./api-error";
import {
  errorEnvelopeSchema,
  successEnvelopeSchema,
  toFieldErrors,
} from "./response-schemas";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type QueryValue = string | number | boolean | null | undefined;

export interface HttpRequestOptions {
  /** Sent as JSON. */
  body?: unknown;
  /** Added to the URL; null and undefined values are left out. */
  query?: Record<string, QueryValue>;
  /** From TanStack Query, so a cancelled query also cancels its request. */
  signal?: AbortSignal;
  /** The access token, sent as `Authorization: Bearer …`. */
  accessToken?: string | null;
  /** 15 seconds by default. Long AI work never waits in one request. */
  timeoutMs?: number;
}

export const DEFAULT_TIMEOUT_MS = 15_000;

/** "/user/auth/me" + query → "/api/v1/user/auth/me?x=1" (or the full API URL). */
export function apiUrl(
  path: string,
  query?: Record<string, QueryValue>
): string {
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new Error(`API paths start with one "/": got "${path}".`);
  }
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== null && value !== undefined) params.set(key, String(value));
  }
  const search = params.size > 0 ? `?${params.toString()}` : "";
  return `${env.apiBaseUrl}${path}${search}`;
}

export async function sendRequest<Schema extends z.ZodType>(
  method: HttpMethod,
  path: string,
  schema: Schema,
  options: HttpRequestOptions = {}
): Promise<z.output<Schema>> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new ApiError({ kind: "offline" });
  }

  const { signal, cancel, timedOut } = withTimeout(
    options.signal,
    options.timeoutMs
  );
  const headers = new Headers({ Accept: "application/json" });
  if (options.body !== undefined)
    headers.set("Content-Type", "application/json");
  if (options.accessToken)
    headers.set("Authorization", `Bearer ${options.accessToken}`);

  let response: Response;
  try {
    // Resolved against the page, so a path base ("/api/v1") also works outside a browser (tests).
    const url = new URL(apiUrl(path, options.query), window.location.href);
    response = await fetch(url, {
      method,
      headers,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
      // The refresh cookie must travel with auth calls, also when the API is on another subdomain.
      credentials: "include",
      signal,
    });
  } catch (error) {
    cancel();
    // The caller cancelled (the screen closed): let TanStack Query see its own abort.
    if (options.signal?.aborted) throw error;
    if (timedOut()) throw new ApiError({ kind: "timeout" });
    throw new ApiError({ kind: navigator.onLine ? "network" : "offline" });
  }

  try {
    return await readResponse(response, schema, path);
  } catch (error) {
    if (options.signal?.aborted) throw error;
    if (timedOut()) throw new ApiError({ kind: "timeout" });
    throw error;
  } finally {
    cancel();
  }
}

async function readResponse<Schema extends z.ZodType>(
  response: Response,
  schema: Schema,
  path: string
): Promise<z.output<Schema>> {
  const requestId = response.headers.get("x-request-id") ?? undefined;
  const body = await readJson(response);

  if (!response.ok) {
    const parsed = errorEnvelopeSchema.safeParse(body);
    throw new ApiError({
      kind: "http",
      status: response.status,
      message: parsed.success ? parsed.data.message : undefined,
      fieldErrors: parsed.success ? toFieldErrors(parsed.data.errors) : {},
      requestId,
    });
  }

  // 204 No Content: there is no envelope, so the schema checks `undefined` (use z.undefined()).
  let data: unknown = undefined;
  if (response.status !== 204) {
    const envelope = successEnvelopeSchema.safeParse(body);
    if (!envelope.success) {
      logger.warn("The response is not the backend's envelope", {
        path,
        requestId,
      });
      throw new ApiError({
        kind: "invalid-response",
        status: response.status,
        requestId,
      });
    }
    data = envelope.data.data;
  }

  const result = schema.safeParse(data);
  if (!result.success) {
    // Only the paths of the problems are logged, never the values (they may be personal data).
    logger.warn("The response does not match its schema", {
      path,
      requestId,
      problems: result.error.issues
        .map((issue) => issue.path.join(".") || "(root)")
        .join(", "),
    });
    throw new ApiError({
      kind: "invalid-response",
      status: response.status,
      requestId,
    });
  }
  return result.data;
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text === "") return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
}

/** The caller's signal plus a timeout. AbortSignal.any is too new for the browsers we support. */
function withTimeout(
  outer: AbortSignal | undefined,
  timeoutMs = DEFAULT_TIMEOUT_MS
) {
  const controller = new AbortController();
  let didTimeOut = false;
  const timer = setTimeout(() => {
    didTimeOut = true;
    controller.abort();
  }, timeoutMs);
  const onOuterAbort = () => {
    controller.abort(outer?.reason);
  };
  if (outer?.aborted) controller.abort(outer.reason);
  else outer?.addEventListener("abort", onOuterAbort, { once: true });

  return {
    signal: controller.signal,
    timedOut: () => didTimeOut,
    cancel: () => {
      clearTimeout(timer);
      outer?.removeEventListener("abort", onOuterAbort);
    },
  };
}
