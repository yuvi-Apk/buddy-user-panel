---
paths:
  - "src/config/env.ts"
  - "src/config/env-schema.ts"
  - "tooling/dev-server-env.ts"
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
- App code reads env only through `env` from `src/config/env.ts`, which checks every value with the
  Zod schema in `src/config/env-schema.ts` and refuses to start on a bad one (the error names the
  variable, never its value). The schema is a separate file so Node config (`vite.config.ts`, which
  needs the API's origin for the CSP) and the guardrail can use it too.
- Give a variable a default when one makes sense, so a plain `pnpm build` with no env files works.
- The one exception is `import.meta.env.DEV`, a build flag: code behind a literal
  `import.meta.env.DEV` check is left out of production builds (the `/dev` routes use it).
- `vite.config.ts` reads the dev-server-only variables (like `API_PROXY_TARGET`) with `loadEnv`,
  through the schema in `tooling/dev-server-env.ts`. They never reach the browser.

| Variable            | Read by    | Default / test value    |
| ------------------- | ---------- | ----------------------- |
| `VITE_API_BASE_URL` | the app    | `/api/v1`               |
| `API_PROXY_TARGET`  | dev server | `http://localhost:4000` |

## Adding a variable

1. Add it to the Zod schema in `src/config/env-schema.ts`, then expose it on `env` in
   `src/config/env.ts` (or add it to `tooling/dev-server-env.ts` for the dev server).
2. Add it to `.env.sample` (with a comment) and `.env.test` (with a test value).
3. Tell the user the name and what to put in their `.env.local`.

`tests/guardrails/env-files.test.ts` fails if `.env.sample` or `.env.test` and the schemas list
different variables.
