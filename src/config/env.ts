// The env variables the app reads. This is the only file that touches import.meta.env; the rest
// of the app imports `env` from here.
//
// Adding a variable: add it to the schema and to `env` below, then to .env.sample and your .env.
// VITE_* values are built into the app, so anyone can read them in the browser.
import { z } from "zod";

const envSchema = z.object({
  /** Where the backend's API lives: "/api/v1" on the same site, or a full URL. */
  VITE_API_BASE_URL: z
    .string()
    .trim()
    .min(1)
    .default("/api/v1")
    .transform((url) => url.replace(/\/+$/, "")),
});

/** Checks the raw values and stops the app with a clear message when one is wrong. */
export function parseEnv(rawEnv: Record<string, unknown>) {
  const result = envSchema.safeParse(rawEnv);
  if (result.success) return result.data;
  throw new Error(
    `The env variables are not valid. Compare your .env with .env.sample.\n${z.prettifyError(result.error)}`
  );
}

const parsedEnv = parseEnv(import.meta.env);

export const env = {
  apiBaseUrl: parsedEnv.VITE_API_BASE_URL,
  /** True in `pnpm dev` and in tests. */
  isDev: import.meta.env.DEV,
  /** True while `pnpm test` runs. */
  isTest: import.meta.env.MODE === "test",
} as const;
