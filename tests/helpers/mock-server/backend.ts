// Helpers that answer like the backend does (backend/src/utils/ApiResponse.ts, errorHandler.ts),
// so handlers in tests read like the real contract:
//
//   server.use(http.get(apiPath("/user/topics"), () => successResponse({ items: [], meta })))
//   server.use(http.post(apiPath("/user/auth/login"), () => errorResponse(401, "Invalid email or password")))
import { HttpResponse } from "msw";
import type { SessionUser } from "@/auth/session-store";

const API_BASE = "/api/v1";

/** Matches the path on any origin: "*\/api/v1/user/auth/me". */
export function apiPath(path: string): string {
  return `*${API_BASE}${path}`;
}

let nextRequestId = 1;

function headers(): Record<string, string> {
  return { "x-request-id": `test-request-${nextRequestId++}` };
}

/** A success envelope: { statusCode, data, message, success: true }. */
export function successResponse(
  data: unknown,
  { status = 200, message = "OK" } = {}
) {
  return HttpResponse.json(
    { statusCode: status, data, message, success: true },
    { status, headers: headers() }
  );
}

/** An error envelope: { success: false, message, errors, data: null }. */
export function errorResponse(
  status: number,
  message: string,
  errors: Array<{ field: string; message: string }> | null = null
) {
  return HttpResponse.json(
    { success: false, message, errors, data: null },
    { status, headers: headers() }
  );
}

/** A Zod validation error, as the backend's errorHandler sends it. */
export function validationFailed(fieldErrors: Record<string, string>) {
  return errorResponse(
    400,
    "Validation failed",
    Object.entries(fieldErrors).map(([field, message]) => ({ field, message }))
  );
}

export function makeUser(overrides: Partial<SessionUser> = {}): SessionUser {
  return {
    id: "user-1",
    name: "Asha Verma",
    email: "asha@example.com",
    role: "INDIVIDUAL",
    emailVerifiedAt: "2026-01-01T00:00:00.000Z",
    examCategory: null,
    organization: null,
    pendingRequest: null,
    ...overrides,
  };
}
