---
paths:
  - "src/**"
---

# Architecture

## How a screen comes together

```
URL
  → src/app/router.tsx       every route, built with defineRoute({ path, access, page, titleKey })
  → access loader            waits for the session; signed out → /login, wrong role → the role's home
  → layout                   app shell: top bar + bottom tabs (phone) or sidebar (laptop)
  → feature page             composes shared components; gets data from its feature's api/ hooks
  → feature api/ hook        TanStack Query; the only caller of the API client
  → src/lib/api/client.ts    the only fetch: token, response envelope, errors, one refresh on 401
  → backend /api/v1/...
```

## Folder map

```
src/
  main.tsx          starts the app
  app/              providers, router, define-route, layouts, error and 404 pages
  config/           env.ts (only reader of import.meta.env), navigation.ts (tabs per role), constants.ts
  lang/             en.json (all text), index.ts (useLang, getLang, fill, plural)
  styles/           tokens.css (the only colors), index.css (Tailwind + token mapping), fonts.css
  theme/            the 4 themes, the theme store (saved choice, follows the phone), useTheme
  lib/              api/ (client, errors, query client), auth/ (session, refresh, roles), storage,
                    safe-url, safe-redirect, cn, logger, format (dates and numbers)
  components/       ui/ (the shared set), layout/ (shell, page, stack…), feedback/ (empty, error…)
  hooks/            shared hooks (use-media-query, use-online-status)
  pwa/              update prompt, install prompt
  test/             test setup, render helper, MSW mock of the backend
  features/<x>/     one folder per feature (see features.md)
```

Outside `src/`: `public/` (files served as they are, such as `theme-boot.js`), `tests/guardrails/`
(repo-wide rules), `tooling/` (Node helpers shared by config files and guardrails, such as the
`tokens.css` reader), `eslint/` (our own lint rules), `e2e/` (browser tests).

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
