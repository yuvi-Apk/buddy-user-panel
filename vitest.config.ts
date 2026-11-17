// Every test lives in tests/ (see tests/README.md). Two projects run with `pnpm test`:
//   unit           tests/unit/           same folders as src/, in a browser-like DOM (jsdom)
//   project-rules  tests/project-rules/  rules for the whole project (colors, naming, lint bans), in Node
import { defineConfig, mergeConfig } from "vitest/config";
import { createViteConfig } from "./vite.config.ts";

export default defineConfig((configEnv) =>
  mergeConfig(createViteConfig(configEnv), {
    test: {
      // Every vi.spyOn() and vi.stubGlobal() is undone after each test, so no test leaks into the next.
      restoreMocks: true,
      unstubGlobals: true,
      // The same values on every machine, whatever the local env file says.
      env: {
        VITE_API_BASE_URL: "/api/v1",
        VITE_GOOGLE_CLIENT_ID: "test-client.apps.googleusercontent.com",
      },
      projects: [
        {
          extends: true,
          test: {
            name: "unit",
            environment: "jsdom",
            include: ["tests/unit/**/*.test.{ts,tsx}"],
            setupFiles: ["./tests/helpers/setup.ts"],
          },
        },
        {
          extends: true,
          test: {
            name: "project-rules",
            environment: "node",
            include: ["tests/project-rules/**/*.test.ts"],
            // Linting fixture code takes a few seconds on the first run.
            testTimeout: 30_000,
          },
        },
      ],
    },
  })
);
