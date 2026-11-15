---
name: write-tests
description: Write tests for code that already exists in the Buddy user panel (for example written by hand), or find out which files have no tests yet. Use when asked to add tests, cover a file, or check what is tested and what is not.
---

# Write tests

Rules: `.claude/rules/testing.md`. Guide for people: `docs/05-testing-and-workflow.md`.

## Step 1: is it already tested?

Check in this order, and stop at the first hit:

1. **Same path under `tests/unit/`**: `src/api/api-client.ts` → `tests/unit/api/api-client.test.ts`
   (`.tsx` source → `.test.tsx`).
2. **A shared test file**: `tests/README.md` lists the test files that cover several small
   components (`choice-controls`, `dialogs`, `badge-chip-progress-alert`, `states`,
   `update-and-install`).
3. **Search `tests/` for the export's name** (`Grep` for `getHomePathForRole`, `<Avatar`): some
   code is covered through a bigger test, such as `tests/unit/app/router.test.tsx` or
   `tests/project-rules/routes.test.ts`.

Found a test? Read it and list which behaviours it does not cover yet. Found none? The file is
untested. Tell the user what you found before writing a lot of tests.

Placeholder pages that only render `<ComingSoonPage>` need no test of their own.

## Step 2: read the code

Read the file and write down what it promises: each branch, each prop that changes behaviour,
each error it can throw. Test behaviour a person or a caller can see, not how the code is written
inside.

## Step 3: write the test

Put it at the same path under `tests/unit/`. Do not change the source to make a test pass; if the
test shows a bug, stop and tell the user.

| Testing          | Use                                                      | Cover                                                                                    |
| ---------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| A plain function | Call it                                                  | Normal input, edge values, bad input                                                     |
| A component      | `render` or `renderWithProviders`, `screen`, `userEvent` | Accessible name, each variant that changes behaviour, disabled and loading, keyboard use |
| A form           | `Form` with a small Zod schema                           | Client errors under fields, values sent, backend field errors                            |
| An API hook      | `server.use(http.get(apiPath("/…"), …))`                 | Success, a 4xx with the backend's message, field errors, an empty list                   |
| A page           | `renderRoute("/path", { as: "STUDENT" })`                | What each allowed role sees; signed out → login; wrong role → its home                   |
| A project rule   | A file in `tests/project-rules/`                         | That the rule fires on a bad example and passes on a good one                            |

- Find things by role and name or by label. Take text from `getLang()`, not typed-in strings.
- One behaviour per `it`, named as a sentence: `it("sends the person to login when signed out")`.
- No snapshot tests. No test that only repeats the config or the implementation.
- Small related components may share one file; add it to the table in `tests/README.md`.

## Checklist before you hand over

- [ ] The test file sits at the same path under `tests/unit/` (or is listed in `tests/README.md`)
- [ ] Each test fails when the behaviour is broken (try it once by breaking the code, then undo)
- [ ] No real network, no real timers left running, nothing left in storage
- [ ] `pnpm check` passes
- [ ] Stop and list what is now covered and what is still not; commit only when the user says so
