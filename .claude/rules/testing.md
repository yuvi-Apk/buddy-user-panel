---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "e2e/**"
  - "tests/**"
  - "src/test/**"
  - "vitest.config.ts"
  - "playwright.config.ts"
---

# Testing

| Kind       | Where                 | Runs with                   | For                                                      |
| ---------- | --------------------- | --------------------------- | -------------------------------------------------------- |
| App tests  | `src/**/*.test.ts(x)` | `pnpm test` (Vitest, jsdom) | Components, hooks, lib code; API mocked with MSW         |
| Guardrails | `tests/guardrails/`   | `pnpm test` (Vitest, Node)  | Repo-wide rules: lint bans, naming, text, colors, routes |
| Browser    | `e2e/`                | `pnpm e2e` (Playwright)     | Whole screens on phone and laptop sizes, with axe        |

`pnpm test src/lang/lang.test.ts` runs one file. Test globals are off: import `describe`, `it`,
`expect` from `vitest`.

## Writing tests

- Test what a person sees and does: find elements by role and label (`getByRole("button", { name })`),
  click with `userEvent`. Never by class name or test ID when a role works.
- Render with the helper in `src/test/render.tsx` (it adds the router, query client and theme).
- Mock the backend with MSW handlers in `src/test/msw/`, never by mocking `fetch` or a hook.
- For an API hook: success, an error message, field errors, and a 401 that refreshes once.
- For a screen: loading, empty, error and offline states (core-rules #15).
- For a component: label, hint and error wiring, keyboard use, disabled and loading states.
- Never delete or weaken a test to make a change pass. Moving or renaming one is fine.

## Guardrails

`tests/guardrails/` holds tests that keep the rules true everywhere: `eslint-rules` (every lint ban
still fires), `naming` (Organization in full, kebab-case files), `lang-keys` (language files match
English), and later `colors`, `contrast`, `routes`, `env-files`. When you add a lint ban, add a case
to `eslint-rules.test.ts`.
