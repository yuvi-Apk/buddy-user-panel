---
paths:
  - "tests/**"
  - "vitest.config.ts"
---

# Testing

Every test lives under `tests/`. `pnpm test` runs all; `pnpm test tests/unit/api` runs one folder.

| Folder                 | Holds                                                                                        |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| `tests/unit/`          | Tests of `src/`, in the same folders: `src/api/x.ts` → `tests/unit/api/x.test.ts`            |
| `tests/project-rules/` | Checks on the whole project: colors, contrast, naming, lint bans, routes, text, PWA, headers |
| `tests/helpers/`       | `setup.ts`, `render.tsx`, and the fake backend in `mock-server/`                             |

## Writing a test

- A component: `renderWithProviders(<Thing />)`. A whole screen on its route:
  `renderRoute("/today", { as: "STUDENT" })` (signed out when `as` is left out).
- Find things the way a person does: `getByRole("button", { name })`, `getByLabelText`. Take text
  from `getLang()`, not typed-in strings, for anything that comes from `en.json`.
- Use `userEvent` for clicks and typing.
- The backend is faked with MSW. Default answers are in `tests/helpers/mock-server/handlers.ts`;
  a test adds its own with `server.use(http.get(apiPath("/…"), () => successResponse(data)))`.
  Build answers with `successResponse`, `errorResponse` and `makeUser` from `backend.ts`.
- `setup.ts` resets the session, the query cache and browser storage after every test.
- Small related components may share one test file, named after what they are
  (`choice-controls.test.tsx`). List it in `tests/README.md`.

## What to cover

- A component: its label and accessible name, each variant that changes behaviour, disabled and
  loading, keyboard use, and that hint and error are read with the control.
- An API hook: success, a 4xx with the backend's message, field errors, and the empty list.
- A page: what each allowed role sees, and where a signed-out person and a wrong role are sent.
- A new ban or project rule: a test in `tests/project-rules/` that proves it fires.

## Not yet set up

Browser tests (Playwright with axe, on phone and laptop sizes) are planned but not installed.
Until then, check new screens by hand at 360px and 1280px, in light and dark.
