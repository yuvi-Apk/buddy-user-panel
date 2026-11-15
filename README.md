# Buddy user panel

The app people study with. One mobile-first web app (installable as a PWA) for four kinds of people:

| Role                 | Who                            | Lands on                  |
| -------------------- | ------------------------------ | ------------------------- |
| `INDIVIDUAL`         | Studies alone, no Organization | `/today`                  |
| `STUDENT`            | Belongs to one Organization    | `/today`                  |
| `TEACHER`            | Organization staff             | `/organization/dashboard` |
| `ORGANIZATION_ADMIN` | Runs the Organization          | `/organization/dashboard` |

Super Admins do not use this app. The backend is in `../backend`.

**Status:** this is the foundation. The design system, app shell, routing by role, session and API
plumbing, text system, PWA and security headers are built and tested. The feature screens are
placeholders ("coming soon"); only Settings → Appearance is a finished screen.

## Start

You need Node 22 or newer and pnpm 11.

```bash
pnpm install
cp .env.sample .env     # then change what you need
pnpm dev                # http://localhost:5173
```

`pnpm dev` forwards `/api` to the backend at `http://localhost:4000` (`API_PROXY_TARGET` in `.env`),
so start the backend too when you need real data.

Without a backend you can still see everything in a dev build:

- `/dev/ui` shows every shared component in every theme.
- `/dev/session` signs you in as any of the four roles with a fake session.

## Commands

| Task                                 | Command                                                             |
| ------------------------------------ | ------------------------------------------------------------------- |
| Dev server                           | `pnpm dev`                                                          |
| Lint, types and tests together       | `pnpm check`                                                        |
| One of them                          | `pnpm lint`, `pnpm typecheck`, `pnpm test`                          |
| One test file or folder              | `pnpm test tests/unit/api`                                          |
| Format everything                    | `pnpm format`                                                       |
| Production build, then serve it      | `pnpm build`, `pnpm preview` (port 4173, with the security headers) |
| Rebuild icons from `public/logo.svg` | `pnpm pwa:icons`                                                    |

## Tech

Vite 8, React 19, TypeScript (strict), Tailwind CSS 4, React Router (data mode), TanStack Query 5,
Zustand, Zod 4, React Hook Form, Radix primitives, lucide icons, Vitest + Testing Library + MSW,
vite-plugin-pwa.

Browsers: Chrome and Edge 111+, Safari and iOS 16.4+, Firefox 128+.

## Where things are

```
src/app          router, providers, layouts, error pages
src/modules      one folder per feature: routes, pages, components, api
src/components   ui (controls), layout (page structure), states (empty, error, loading)
src/api          the only fetch: api client, ApiError, response schemas
src/auth         roles and the session
src/routing      createPageRoute and the access check
src/config       env.ts and navigation.ts
src/lang         en.json: all screen text
src/theme, src/styles   themes; tokens.css holds every color
tests            every test
tooling          build-time config (PWA, security headers)
docs             the guides below
```

## Guides

1. [Overview](docs/01-overview.md): how the app is put together
2. [Modules and pages](docs/02-modules-and-pages.md): add a feature or a screen
3. [Design system](docs/03-design-system.md): colors, themes, components, text
4. [Data, session and security](docs/04-data-auth-security.md): talk to the backend safely
5. [Testing and workflow](docs/05-testing-and-workflow.md): tests, env, before you hand over

Working with Claude Code: see `CLAUDE.md` and `.claude/`.
