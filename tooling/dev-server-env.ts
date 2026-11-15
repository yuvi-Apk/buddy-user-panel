// Env variables that only the Vite dev server reads (never the browser). vite.config.ts reads
// them with loadEnv; tests/guardrails/env-files.test.ts checks .env.sample and .env.test list them.
import { z } from "zod";

export const devServerEnvSchema = z.object({
  /** Where `pnpm dev` and `pnpm preview` forward /api requests: the backend on your machine. */
  API_PROXY_TARGET: z
    .url({ protocol: /^https?$/ })
    .default("http://localhost:4000"),
});

export type DevServerEnv = z.output<typeof devServerEnvSchema>;

/** Picks and checks the dev-server variables. The error names the variable, never its value. */
export function parseDevServerEnv(
  source: Record<string, string | undefined>
): DevServerEnv {
  const picked = Object.fromEntries(
    Object.keys(devServerEnvSchema.shape).map((key) => [
      key,
      source[key] || undefined,
    ])
  );
  const result = devServerEnvSchema.safeParse(picked);
  if (result.success) return result.data;

  const problems = result.error.issues.map(
    (issue) => `${issue.path.join(".")}: ${issue.message}`
  );
  throw new Error(
    `The dev server's env variables are not valid.\n${problems.join("\n")}`
  );
}
