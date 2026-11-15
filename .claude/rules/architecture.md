---
paths:
  - "src/**"
---

# Architecture

## How a screen comes together

```
URL
  → src/app/routes.ts        the route tree: every feature's routes.ts (built with defineRoute)
  → access loader            waits for the session; signed out → /login, wrong role → the role's home
  → layout                   shell (top bar + bottom tabs on phones, sidebar on laptops) or focus
  → feature page             composes shared components; gets data from its feature's api/ hooks
  → feature api/ hook        TanStack Query; the only caller of the API client
  → src/lib/api/client.ts    token, one shared refresh + retry on 401
  → src/lib/api/transport.ts the only fetch: timeout, response envelope, Zod check, ApiError
  → backend /api/v1/...      (in development through the Vite proxy to localhost:4000)
```

## Folder map

```
src/
  main.tsx          starts the app
  app/              app.tsx, providers, routes.ts (the tree), router.tsx, layouts/, errors/ (404, crash)
  config/           env.ts (only reader of import.meta.env), navigation.ts (menus and home per role)
  lang/             en.json (all text), index.ts (useLang, getLang, fill, plural)
  styles/           tokens.css (the only colors), index.css (Tailwind + token mapping), fonts.css
  theme/            the 4 themes, the theme store (saved choice, follows the phone), useTheme
  lib/              api/ (client, transport, errors, envelope, query client),
                    auth/ (roles, session store, refresh, sync across tabs, sign-in/out, start-up),
                    routing/ (defineRoute, access rules), storage, safe-url, safe-redirect, cn,
                    logger, format (dates and numbers)
  components/       ui/ (the shared set), layout/ (app shell, nav, page, stack…), feedback/ (empty,
                    error, loading, offline, coming soon)
  hooks/            shared hooks (use-media-query, use-online-status)
  pwa/              update-prompt (new version ready), use-install-prompt (Install the app)
  test/             test setup, render helper, MSW mock of the backend
  features/<x>/     one folder per feature (see features.md)
```

Outside `src/`: `public/` (files served as they are: `theme-boot.js`, the logo and the icons made
from it, `robots.txt`), `tests/guardrails/` (repo-wide rules), `tooling/` (Node helpers shared by
config files and guardrails: the `tokens.css` reader, the PWA options, the dev-server env),
`eslint/` (our own lint rules), `e2e/` (browser tests), and at the root
`security-headers.config.ts` (CSP and headers) and `pwa-assets.config.ts` (icon generation).

## Who may import what

| From                                                                   | May import                                              |
| ---------------------------------------------------------------------- | ------------------------------------------------------- |
| `src/main.tsx`, `src/app/`                                             | shared code, and features through their `index.ts` only |
| `src/features/<x>/`                                                    | its own files, other features' `index.ts`, shared code  |
| shared: `components`, `lib`, `hooks`, `theme`, `lang`, `config`, `pwa` | other shared code only                                  |
| tests and `src/test/`                                                  | anything                                                |

`eslint/import-boundaries.js` (rule `buddy/import-boundaries`) enforces this for relative and `@/`
imports alike (core-rules #10).

## Naming

- Files and folders: kebab-case (`study-plan-card.tsx`). Tests sit next to the file (`*.test.tsx`).
- Components are PascalCase; a hook file `use-thing.ts` exports `useThing`. Named exports only.
- Imports: `./x` for a file in the same folder, `@/…` for everything else.
- "Organization" in full: `organizationId`, `OrganizationSettingsPage`, `organization-management/`.

## State

- Server data: TanStack Query, with one query-key factory per feature.
- Session: `src/lib/auth/session-store.ts` (Zustand, memory only, never persisted).
- Theme and language: their own small stores, saved through `src/lib/storage.ts`.
- Filters, tabs and page numbers: URL search params, so back/forward and sharing work.
- Nothing else is global.
