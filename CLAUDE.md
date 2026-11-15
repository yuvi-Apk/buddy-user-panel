# Buddy user app

The app people study with: Individual users, and the admins, teachers and students of an
Organization (a school, college, coaching centre or training institute). Super Admins never use it;
they have their own admin panel. One mobile-first PWA whose screens change with the person's role.

Vite 8, React 19, TypeScript 6 (strict), Tailwind CSS 4 on our own design tokens, React Router 8
(data mode), TanStack Query 5, Zustand, Zod 4, Vitest + MSW, Playwright. Node 22, pnpm 11.

Rules live in `.claude/rules/`. `core-rules.md` is always loaded; the others load when you work on
matching files. The backend is `../backend` and follows its own `CLAUDE.md`.

## The product in one minute

- Roles come from the backend's `UserRole`: `INDIVIDUAL` (studies alone), `STUDENT`, `TEACHER`,
  `ORGANIZATION_ADMIN`. A person belongs to one Organization at most. Login is email and password.
- Joining an Organization: the Organization invites by email, or the person enters the Organization
  code. A code only creates a pending request; nothing opens until an Organization admin approves.
- Moving into an Organization asks whether it may see the person's older data (default: no).
- The server decides access. The `organizationId` always comes from the verified token, never from
  the app.
- Heavy AI work runs in the background; screens show progress instead of waiting.

## Commands

| Task                               | Command                                      |
| ---------------------------------- | -------------------------------------------- |
| Dev server (http://localhost:5173) | `pnpm dev`                                   |
| Lint / types / tests               | `pnpm lint` / `pnpm typecheck` / `pnpm test` |
| All three (definition of done)     | `pnpm check`                                 |
| One test file                      | `pnpm test src/lang/lang.test.ts`            |
| Production build / serve it        | `pnpm build` / `pnpm preview`                |
| Format                             | `pnpm format`                                |
| App icons from `public/logo.svg`   | `pnpm pwa:icons`                             |

## Never

- A color value or a Tailwind palette class (`bg-indigo-600`, `bg-white`) outside
  `src/styles/tokens.css`. Amber for anything but weak topics, red for anything but real errors,
  or a meaning shown by color alone.
- A raw `<button>`, `<input>`, `<select>` or `<textarea>` in a feature, or restyling a shared
  component from a feature. Add a variant to the component instead.
- Screen text typed into a component. All text lives in `src/lang/en.json`, read with `useLang()`.
- A route without `access`, or a nav item that points to a route its role can't open.
- `fetch` outside `src/lib/api/`, an API call outside a feature's `api/` folder, or API data used
  without a Zod schema.
- Sending `organizationId` (or any "whose data" ID) to choose scope, or trusting the role in the UI.
- A token or personal data in browser storage, or storage used outside `src/lib/storage.ts`.
- `dangerouslySetInnerHTML`, `eval`, `new Function`, or raw HTML from AI or markdown.
- `import.meta.env` outside `src/config/env.ts`; a secret in a `VITE_*` variable; reading or editing
  a real env file (only `.env.sample` and `.env.test`).
- Importing another feature's files instead of its `index.ts`.
- "org" or any other shortening of Organization, in code, file names or text.
- Caching `/api` in the service worker; a third-party script, font, tracker or CDN.
- `any`, `console.log`, floating promises, default exports in `src/`, a package without a reason.
- `git add` or `git commit` (see below).

## Definition of done

1. `pnpm check` passes (lint, typecheck, test), plus `pnpm e2e` when screens changed.
2. New screens are checked at 360px and 1280px wide, in light and dark, and with the keyboard only.
3. Every screen that shows data has loading, empty, error and offline states.
4. New text is in `src/lang/en.json`. New env variables are in `src/config/env.ts`, `.env.sample`
   and `.env.test`, and the user has been told the name.
5. No rule in `.claude/rules/` is broken.

## Commits

Never commit. When a step is done and the checks pass, stop: list the changed files, give a commit
message that says what changed and why (ending with the `Co-Authored-By` line), and wait. The user
reviews and commits, then tells you to continue.

## Setup status

The foundation is built in five steps. Done: **1** (tooling, text system, rules), **2** (design
tokens, 4 themes × light/dark, the shared components, the UI gallery) and **3** (env, API client,
session, router with role access, app shell, placeholder screens, the dev session switcher at
`/dev/session`) and **4** (installable PWA, update prompt, icons, CSP and security headers). Still
to come: **5** browser tests, docs and skills. The rules describe the finished foundation, so a
file they name may not exist until its step lands; until then that rule is enforced by review.
