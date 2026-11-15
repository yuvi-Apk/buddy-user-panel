---
paths:
  - "src/**"
---

# Architecture

## Folders

| Folder                  | Holds                                                                             |
| ----------------------- | --------------------------------------------------------------------------------- |
| `src/app`               | Puts everything together: router, providers, layouts, error and 404 pages         |
| `src/modules/<name>`    | One feature: its routes, pages, components and API hooks                          |
| `src/components/ui`     | Shared controls and display parts (`Button`, `Input`, `Card`, dialogs, toast, …)  |
| `src/components/layout` | The shell and page building blocks (`AppShell`, `Page`, `PageHeader`, `Stack`, …) |
| `src/components/states` | Empty, error, loading, offline and coming-soon states                             |
| `src/api`               | The only `fetch`: `api` client, `ApiError`, response schemas, query client        |
| `src/auth`              | Roles, the session store, sign-in, sign-out, refresh, sync across tabs            |
| `src/routing`           | `createPageRoute` and the access check                                            |
| `src/config`            | `env.ts` (the only reader of env) and `navigation.ts` (menus per role)            |
| `src/lang`              | `en.json` (all screen text) and `useLang`, `getLang`, `fill`, `plural`            |
| `src/theme`             | The four themes and light / dark / system mode                                    |
| `src/styles`            | `tokens.css` (the only color values), `index.css` (Tailwind setup), `fonts.css`   |
| `src/utils`             | `cn`, `storage`, `safe-redirect`, `logger`, `contrast`                            |
| `src/hooks`, `src/pwa`  | Shared hooks; the update prompt and install hint                                  |
| `tests/`                | Every test (see `testing.md`)                                                     |
| `tooling/`              | Build-time config shared by Vite and the tests (PWA, security headers, tokens)    |

## Who may import what

- `src/app` and `src/main.tsx` may import everything, modules only through their `index.ts`.
- A module imports its own files with relative paths, another module only through
  `@/modules/<name>`, and any shared folder.
- Shared folders (everything else) never import a module or `src/app`.
- Import shared components from the folder: `import { Button, Input } from "@/components/ui"`.
  Inside a components folder, files import each other with relative paths.

## Naming

- Files and folders: kebab-case (`today-page.tsx`). Components: PascalCase. Hooks: `use-*.ts`.
- Named exports only. `@/` is `src/`.
- A function name says why it is used: `getHomePathForRole`, `showBackendFieldErrors`,
  `waitUntilSessionIsKnown`. Booleans start with `is`, `has` or `should`.
- Full words for variables (`isPasswordVisible`, not `vis`). "Organization" is never shortened.
- A file starts with a short comment that says what it is for and shows how to use it.

## Keep it simple

- Add a file, helper or layer only when the task needs it now.
- Before adding a helper, look for one that already does it in `src/utils`, `src/api`, `src/auth`.
- Do not remove exports that are unused today but kept for coming screens (`isUserRole`,
  `MAX_PAGE_SIZE`, `DEFAULT_PAGE_SIZE`, `refreshAfterMembershipChange`). Ask first.
- Never mix a removal into a rename or a style change.
