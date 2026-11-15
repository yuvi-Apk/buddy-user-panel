// Two test projects:
//   app         src/**/*.test.ts(x), in a browser-like DOM (jsdom)
//   guardrails  tests/**/*.test.ts, in Node: repo-wide rules (lint bans, naming, text files, ...)
import { defineConfig, mergeConfig } from "vitest/config";
import { createViteConfig } from "./vite.config.ts";

export default defineConfig((configEnv) =>
  mergeConfig(createViteConfig(configEnv), {
    test: {
      // Every vi.spyOn() and vi.stubGlobal() is undone after each test, so no test leaks into the next.
      restoreMocks: true,
      unstubGlobals: true,
      projects: [
        {
          extends: true,
          test: {
            name: "app",
            environment: "jsdom",
            include: ["src/**/*.test.{ts,tsx}"],
            setupFiles: ["./src/test/setup.ts"],
          },
        },
        {
          extends: true,
          test: {
            name: "guardrails",
            environment: "node",
            include: ["tests/**/*.test.ts"],
            // Linting fixture code takes a few seconds on the first run.
            testTimeout: 30_000,
          },
        },
      ],
    },
  })
);
