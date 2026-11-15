# 05 Testing and workflow

## Tests

Every test lives in `tests/`. `pnpm test` runs all of them; `pnpm test tests/unit/api` runs one
folder or file; `pnpm test:watch` reruns as you type.

| Folder                 | What is inside                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| `tests/unit/`          | Tests of the code in `src/`, in the same folders as `src/`                                    |
| `tests/project-rules/` | Checks on the whole project (colors, contrast, naming, lint bans, routes, text, PWA, headers) |
| `tests/helpers/`       | Shared setup, render helpers and the fake backend                                             |

The test for `src/api/api-client.ts` is `tests/unit/api/api-client.test.ts`. `tests/README.md` lists
the few test files that cover several small components.

### Is this file tested already?

1. Look at the same path under `tests/unit/`.
2. Look in the table in `tests/README.md` (a few test files cover several small components).
3. Search `tests/` for the function or component name: some code is covered by a bigger test.

Nothing found means it is not tested.

### A component test

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui";

it("shows its error and is marked invalid", () => {
  render(<Input label="Name" error="Enter your name" />);
  const input = screen.getByRole("textbox", { name: "Name" });
  expect(input).toBeInvalid();
  expect(input).toHaveAccessibleDescription("Enter your name");
});
```

Find things the way a person does: by role and name, or by label. Use `userEvent` to click and type.
Use `renderWithProviders(<Thing />)` when the component needs the app's providers.

### A screen test

```tsx
import { renderRoute } from "@tests/helpers/render";

it("a student sees today's plan", async () => {
  renderRoute("/today", { as: "STUDENT" });
  expect(
    await screen.findByRole("heading", { name: getLang().nav.today })
  ).toBeVisible();
});
```

`renderRoute` renders the real route tree. Leave out `as` to be signed out.

### The fake backend

Tests never reach a real server. MSW answers instead:

```ts
import { http } from "msw";
import {
  apiPath,
  errorResponse,
  successResponse,
} from "@tests/helpers/mock-server/backend";
import { server } from "@tests/helpers/mock-server/server";

server.use(
  http.get(apiPath("/user/topics"), () => successResponse({ items: [], meta })),
  http.post(apiPath("/user/topics"), () =>
    errorResponse(400, "Validation failed")
  )
);
```

Default answers are in `tests/helpers/mock-server/handlers.ts`. Handlers added in a test last until
that test ends. After every test the session, the query cache and browser storage are reset.

### What to test

- **Component:** its name for screen readers, variants that change behaviour, disabled and loading,
  keyboard use.
- **API hook:** success, a 4xx with the backend's message, field errors, an empty list.
- **Page:** what each allowed role sees; where a signed-out person and a wrong role end up.

### Browser tests

End-to-end tests in real browsers (Playwright, with accessibility scans) are planned but not set
up yet. Until then, check new screens by hand:

- at 360px and at 1280px wide
- in light and dark, and in at least two themes
- with the keyboard only
- with the network switched off in the browser's dev tools

## Before you hand over a change

```bash
pnpm check        # lint + typecheck + test
```

A change is done when:

1. `pnpm check` passes.
2. New behaviour has tests.
3. New screens have loading, empty, error and offline states, and were checked as listed above.
4. New text is in `en.json`; a new env variable is in the schema and `.env.sample`.
5. No rule in `.claude/rules/core-rules.md` is broken.

Then commit with a message that says what changed and why.

## Common mistakes

| You see                                              | Cause and fix                                                            |
| ---------------------------------------------------- | ------------------------------------------------------------------------ |
| "Screen text lives in src/lang/en.json"              | Text typed into JSX. Move it to `en.json`, read it with `useLang()`      |
| "Use the shared components from @/components/ui"     | A raw `<button>` or `<input>` in a module. Use `Button`, `Input`         |
| An unknown-class error on `bg-blue-500`              | Tailwind's palette is off. Use a token class such as `bg-primary`        |
| `colors.test.ts` fails                               | A color value outside `tokens.css`. Add or reuse a token                 |
| `contrast.test.ts` fails                             | A new token pair is too faint. Darken or lighten it in `tokens.css`      |
| `routes.test.ts` fails                               | A page without `access` or title, or a menu item its role cannot open    |
| `naming.test.ts` fails                               | A file that is not kebab-case, or Organization written short             |
| "Only src/api/ calls fetch"                          | Use the `api` client inside your module's `api/` hook                    |
| "Import another module only through its index"       | Import from `@/modules/<name>`, or move the shared part to `components/` |
| The app stops with "The env variables are not valid" | Compare your `.env` with `.env.sample`                                   |
| A label does not move up when the input has a value  | The control needs the `peer` class and a placeholder (see `field.tsx`)   |

## Adding a package

Add one only when nothing in the browser, React or the current dependencies can do the job, and
write the reason in the commit message. New package versions wait a day before pnpm installs them
(`minimumReleaseAge` in `pnpm-workspace.yaml`), which protects against freshly published bad
versions.

## Working with Claude Code

- `CLAUDE.md` is the short brief: commands, what never to do, when a change is done.
- `.claude/rules/` holds the detailed rules; each file loads when Claude works on matching files.
- `.claude/skills/` has step-by-step recipes: `new-module`, `add-page`, `add-api-hook`,
  `add-ui-component`, `write-tests`.
- Two hooks run by themselves: one formats every file Claude edits, one blocks any command that
  touches your `.env`.
- Claude commits only when you tell it to.
