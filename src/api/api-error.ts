// Every failed API call throws an ApiError, so screens handle one shape:
//
//   error.status        HTTP status, or 0 when nothing came back (offline, network, timeout)
//   error.kind          "http" | "offline" | "network" | "timeout" | "invalid-response"
//   error.message       a sentence that can be shown as it is
//   error.fieldErrors   { email: "Enter a valid email" } from the backend's validation errors
//   error.requestId     the backend's x-request-id, shown on error screens for support
import { getLang } from "@/lang";

export type ApiErrorKind =
  "http" | "offline" | "network" | "timeout" | "invalid-response";

export interface ApiErrorOptions {
  status?: number;
  kind: ApiErrorKind;
  message?: string;
  fieldErrors?: Record<string, string>;
  requestId?: string;
}

export class ApiError extends Error {
  override readonly name = "ApiError";
  readonly status: number;
  readonly kind: ApiErrorKind;
  readonly fieldErrors: Readonly<Record<string, string>>;
  readonly requestId: string | undefined;

  constructor(options: ApiErrorOptions) {
    const status = options.status ?? 0;
    super(buildFriendlyMessage(options.kind, status, options.message));
    this.status = status;
    this.kind = options.kind;
    this.fieldErrors = options.fieldErrors ?? {};
    this.requestId = options.requestId;
  }

  /** True for a 4xx answer: the request itself was refused, so retrying won't help. */
  get isClientError(): boolean {
    return this.kind === "http" && this.status >= 400 && this.status < 500;
  }

  get hasFieldErrors(): boolean {
    return Object.keys(this.fieldErrors).length > 0;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** A sentence for a toast or an error screen, whatever was thrown. */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) return error.message;
  return getLang().errors.unexpected;
}

/**
 * The backend's message is used for 4xx answers: it is written for people ("This code has
 * expired"). Everything else gets our own calm sentence, so a stack trace or "Internal server
 * error" never reaches the screen.
 */
function buildFriendlyMessage(
  kind: ApiErrorKind,
  status: number,
  serverMessage?: string
): string {
  const text = getLang().errors;
  switch (kind) {
    case "offline":
      return text.offline;
    case "network":
      return text.network;
    case "timeout":
      return text.timeout;
    case "invalid-response":
      return text.unexpected;
    case "http":
      if (status === 429) return text.tooManyAttempts;
      if (status >= 400 && status < 500 && serverMessage?.trim())
        return serverMessage;
      if (status >= 500) return text.server;
      return text.unexpected;
  }
}
