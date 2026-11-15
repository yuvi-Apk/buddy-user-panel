# Tests

Every test lives in this folder. `pnpm test` runs all of them; `pnpm test tests/unit/api` runs one
folder or file.

| Folder           | What is inside                                                                 |
| ---------------- | ------------------------------------------------------------------------------ |
| `unit/`          | Tests of the code in `src/`, in the same folders as `src/`                     |
| `project-rules/` | Checks on the whole project: colors, contrast, naming, lint bans, routes, text |
| `helpers/`       | Shared by the tests: `setup.ts`, `render.tsx` and the fake backend             |

## Where is the test for a file?

Same path, under `tests/unit/`:

```
src/api/client.ts                 →  tests/unit/api/client.test.ts
src/components/ui/button.tsx      →  tests/unit/components/ui/button.test.tsx
src/modules/settings/components/  →  tests/unit/modules/settings/components/
```

A few small components share one test file, named after what they are:

| Test file                                          | Covers                                              |
| -------------------------------------------------- | --------------------------------------------------- |
| `components/ui/choice-controls.test.tsx`           | checkbox, radio group, switch, select, choice cards |
| `components/ui/dialogs.test.tsx`                   | dialogs, confirm dialog, dropdown menu, popover     |
| `components/ui/badge-chip-progress-alert.test.tsx` | badge, topic chip, progress bar, alert              |
| `components/feedback/feedback.test.tsx`            | empty, error, loading and offline states            |
| `pwa/update-and-install.test.tsx`                  | the update prompt and "Install the app"             |

## Helpers

- `helpers/setup.ts` runs before every unit test: starts the fake backend and resets the session,
  the query cache and browser storage after each test.
- `helpers/render.tsx`: `renderWithProviders(<Button />)` for a component,
  `renderRoute("/today", { as: "STUDENT" })` for a whole screen.
- `helpers/mock-server/`: the fake backend (MSW). `handlers.ts` holds the default answers; a test
  adds its own with `server.use(...)`.
