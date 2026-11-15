// The schema of the app's env variables, without reading them. env.ts reads import.meta.env with
// it; vite.config.ts (the CSP needs the API's origin) and the env-files guardrail use it in Node.
//
// Everything here ends up in the browser bundle, where anyone can read it: never a secret.
// Adding a variable: .claude/rules/env.md (schema here, .env.sample, .env.test).
import { z } from "zod";

/** A path on the same site ("/api/v1") or a full https URL ("https://api.example.com/api/v1"). */
const apiBaseUrl = z
  .string()
  .trim()
  .refine(
    (value) =>
      (value.startsWith("/") && !value.startsWith("//")) ||
      /^https:\/\/[^\s/]+/.test(value) ||
      /^http:\/\/localhost(:\d+)?(\/|$)/.test(value),
    "must be a path such as /api/v1, or an https:// URL"
  )
  .transform((value) => value.replace(/\/+$/, ""));

export const appEnvSchema = z.object({
  /**
   * Where the backend's API lives. In development the Vite proxy forwards /api to the backend.
   * Defaults to /api/v1 (the API on the same site), so a build without env files still works.
   */
  VITE_API_BASE_URL: apiBaseUrl.default("/api/v1"),
});

export type AppEnv = z.output<typeof appEnvSchema>;

/** Checks the raw values. Throws an error that names each bad variable, without its value. */
export function parseAppEnv(source: Record<string, unknown>): AppEnv {
  const result = appEnvSchema.safeParse(source);
  if (result.success) return result.data;

  const problems = result.error.issues.map(
    (issue) => `${issue.path.join(".") || "(env)"}: ${issue.message}`
  );
  throw new Error(
    `The app's env variables are not valid. Check .env.sample.\n${problems.join("\n")}`
  );
}

/** The API's origin when it lives on another site ("https://api.example.com"), else undefined. */
export function apiOriginOf(apiBaseUrl: string): string | undefined {
  return /^https?:\/\//.test(apiBaseUrl)
    ? new URL(apiBaseUrl).origin
    : undefined;
}
