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
`expect` from `vitest`. Always run tests through `pnpm test`: in Git Bash, `pnpm exec vitest`
can load Vitest twice and fail with "Vitest failed to find the current suite".

## Writing tests

- Test what a person sees and does: find elements by role and label (`getByRole("button", { name })`),
  click with `userEvent`. Never by class name or test ID when a role works.
- Render with the helpers in `src/test/render.tsx`: `renderWithProviders(<X />)` for a component,
  `renderRoute("/today", { as: "STUDENT" })` for a screen in the real route tree (signed out when
  `as` is left out).
- Mock the backend with MSW, never by mocking `fetch` or a hook. `src/test/msw/handlers.ts` is the
  default backend (nobody signed in); a test adds its own with
  `server.use(http.get(apiPath("/user/x"), () => ok(data)))`, using `ok`, `fail`,
  `validationFailed` and `makeUser` from `src/test/msw/backend.ts`. A request without a handler
  fails the test.
- For an API hook: success, an error message, field errors, and a 401 that refreshes once.
- For a screen: loading, empty, error and offline states (core-rules #15).
- For a component: label, hint and error wiring, keyboard use, disabled and loading states.
- Read app text from `getLang()` (`screen.getByRole("button", { name: lang.common.tryAgain })`), so
  rewording a sentence never breaks a test.
- `src/test/setup.ts` fills gaps in jsdom: a `matchMedia` you control with `setMediaQuery()` from
  `src/test/media-query.ts`, a ResizeObserver and pointer capture for Radix. It starts the MSW
  server. After each test it clears localStorage, the MSW handlers a test added, the session (back
  to "restoring") and the query cache, and every `vi.spyOn` is undone (`restoreMocks`).
- Never delete or weaken a test to make a change pass. Moving or renaming one is fine.

## Guardrails

`tests/guardrails/` holds tests that keep the rules true everywhere:

- `eslint-rules`: every lint ban still fires. When you add a ban, add a case here.
- `naming`: Organization in full, kebab-case files.
- `lang-keys`: every language file has the same keys and placeholders as English.
- `colors`: no color value or palette class outside `tokens.css`.
- `contrast`: WCAG AA in every theme × mode, for the token pairs the components use. When a
  component puts a token on a new background, add that pair.
- `theme-boot`: `public/theme-boot.js` applies the same choice the theme store saves.
- `routes`: every route has access and a title; every menu item opens a route its role may open;
  at most 4 tabs. It loads the real route tree, so it runs in jsdom (`// @vitest-environment jsdom`).
- `env-files`: `.env.sample` and `.env.test` list exactly the schemas' variables, with valid values.
- `pwa`: prompt before updating, no runtime caching, `/api` never served the app shell, manifest
  fields and token colors, every icon file present, the logo's colors.
- `security-headers`: the CSP directives and headers, and an `index.html` with no inline script or
  outside URL.
- Code that uses `virtual:pwa-register/react` is tested by mocking that module with `vi.mock`
  (`src/pwa/pwa.test.tsx`); it is the only module mock allowed.

`tooling/design-tokens.ts` reads `tokens.css` and resolves each token per theme × mode; use it
rather than parsing the file again.
