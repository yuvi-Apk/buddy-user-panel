// Two test projects:
//   app         src/**/*.test.ts(x), in a browser-like DOM (jsdom)
//   guardrails  tests/**/*.test.ts, in Node: repo-wide rules (lint bans, naming, text files, ...)
import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
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
