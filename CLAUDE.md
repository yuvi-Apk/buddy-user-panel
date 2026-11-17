# Buddy user panel

The app people study with: one mobile-first PWA for Individual users, students, teachers and
Organization admins. Screens change by role after login. Super Admins never use it (they have their
own panel). The backend is in `../backend`.

Vite 8, React 19, TypeScript strict, Tailwind 4, React Router (data mode), TanStack Query 5, Zustand,
Zod 4, React Hook Form, Vitest + Testing Library + MSW, vite-plugin-pwa, pnpm.

Rules live in `.claude/rules/`. `core-rules.md` is always loaded; the others load when you work on
matching files. Guides for people are in `docs/`.

## Commands

| Task                         | Command                                      |
| ---------------------------- | -------------------------------------------- |
| Dev server (port 5173)       | `pnpm dev`                                   |
| Lint / types / tests         | `pnpm lint` / `pnpm typecheck` / `pnpm test` |
| All three                    | `pnpm check`                                 |
| One test file or folder      | `pnpm test tests/unit/api`                   |
| Production build and preview | `pnpm build` then `pnpm preview`             |
| Icons from `public/logo.svg` | `pnpm pwa:icons`                             |

## Building

- New module folder: `new-module` skill. New screen in a module: `add-page`.
- Talking to the backend: `add-api-hook`. A new shared component: `add-ui-component`.
- Shared components follow the shadcn/ui pattern in our own Paper & Ink look: Radix behaviour,
  `cva` with `variant` / `size` (`default` is the base), `cn` for classes, `data-slot` on parts.
  Add to `src/components/ui` only what a screen needs; form fields (`Input` on `field.tsx`) are ours.
- Any UI picture or animated demo (coming-soon, empty state, onboarding, feature card, login
  panel): always the `stageshow` skill. Build it from `@/components` and `tokens.css`, not its
  `kit/` or `stageshow.css`; no new package. Rules: "Illustrations" in `design-and-components.md`.
- Tests for code that already exists, or "is this tested?": `write-tests`.
- Look at every component at `/dev/ui`; sign in as any role at `/dev/session` (dev builds only).

## Never

- A color value or a Tailwind palette class (`bg-indigo-600`, `#fff`) outside `src/styles/tokens.css`.
- Red for anything but a real error or the required star. Amber for anything but "Needs practice".
  Color without an icon and a word.
- A raw `<button>`, `<input>`, `<select>` or `<textarea>` in `src/modules`, or restyling a shared
  component from a module.
- Screen text outside `src/lang/en.json`.
- A page that is not made with `createPageRoute` (it needs `access` and `titleKey`).
- `fetch` outside `src/api`, or API data used without a Zod schema.
- Sending `organizationId` (or any "whose data" ID) to choose scope, or trusting the role in the UI.
- A token or personal data in browser storage. Storage only through `src/utils/storage.ts`.
- `dangerouslySetInnerHTML`, `eval`, raw HTML from AI or markdown.
- `import.meta.env` outside `src/config/env.ts`; a secret in a `VITE_*` variable; reading `.env`.
- Importing another module's files (only its `index.ts`). "org" for Organization. A Super Admin role.
- Caching `/api` in the service worker. A third-party script, font, CDN or tracker.
- `any`, `console.log`, floating promises, default exports in `src/`, a package without a reason.
- A test file outside `tests/`.
- Removing an export or file that is unused today but kept for a coming screen, unless the user asks.

## Definition of done

1. `pnpm check` passes.
2. New behaviour has tests under `tests/unit/`, in the same folders as `src/`.
3. Screens work at 360px and 1280px, in light and dark, and with the keyboard only.
4. Data screens have loading, empty, error and offline states.
5. New text is in `en.json`; a new env variable is in the schema and `.env.sample`.
6. No rule in `.claude/rules/` is broken.

## Commits

Commit only when the user says so. When a change is done and the checks pass, stop: list what
changed and wait. Commit messages say what changed and why, and end with the `Co-Authored-By` line.
Never `git push --force`, `git reset --hard` or `rm -rf`.
