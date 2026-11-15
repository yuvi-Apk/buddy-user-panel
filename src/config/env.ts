// The only reader of import.meta.env (core-rules #12). Every value is checked with Zod when the
// app starts; a bad value stops the app with a message that names the variable (never its value).
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
  /** Where the backend's API lives. In development the Vite proxy forwards /api to the backend. */
  VITE_API_BASE_URL: apiBaseUrl,
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

const parsed = parseAppEnv(import.meta.env);

export const env = {
  apiBaseUrl: parsed.VITE_API_BASE_URL,
  /** True in `pnpm dev` and tests. Dev-only screens (/dev/ui, /dev/session) exist only then. */
  // To leave dev-only code out of production, check `import.meta.env.DEV` itself instead: the
  // bundler only removes code behind that literal check (src/features/dev/routes.ts does this).
  isDev: import.meta.env.DEV,
  /** True while `pnpm test` runs. */
  isTest: import.meta.env.MODE === "test",
} as const;
