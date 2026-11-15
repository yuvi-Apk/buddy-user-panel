// The only reader of import.meta.env (core-rules #12). Every value is checked with Zod when the
// app starts (env-schema.ts); a bad value stops the app with a message that names the variable,
// never its value.
//
// Everything here ends up in the browser bundle, where anyone can read it: never a secret.
// Adding a variable: .claude/rules/env.md (schema in env-schema.ts, .env.sample, .env.test).
import { parseAppEnv } from "./env-schema";

export { parseAppEnv } from "./env-schema";

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
