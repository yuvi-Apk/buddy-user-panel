---
paths:
  - "src/config/env.ts"
  - ".env.sample"
  - ".env.test"
  - "vite.config.ts"
---

# Env files

- Never read or edit `.env`, `.env.local` or any other real env file. They are blocked in
  `.claude/settings.json` and by the `protect-env` hook. `.env.sample` (every variable with a comment)
  and `.env.test` (test values) may be read and edited.
- Everything in a `VITE_*` variable ends up in the browser bundle, where anyone can read it. Never
  put a secret there (core-rules #12). The user app has no secrets.
- App code reads env only through `env` from `src/config/env.ts`, which checks every value with Zod
  and refuses to start on a bad one.
- `vite.config.ts` reads the dev-server-only variables (like `API_PROXY_TARGET`) with `loadEnv`.

## Adding a variable

1. Add it to the Zod schema in `src/config/env.ts` (or the dev-server schema in `vite.config.ts`).
2. Add it to `.env.sample` (with a comment) and `.env.test` (with a test value).
3. Tell the user the name and what to put in their `.env.local`.

`tests/guardrails/env-files.test.ts` fails if `.env.sample` or `.env.test` and the schemas list
different variables.
