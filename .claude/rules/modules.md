---
paths:
  - "src/modules/**"
  - "src/app/**"
  - "src/routing/**"
  - "src/config/navigation.ts"
---

# Modules, pages and navigation

## A module

```
src/modules/<name>/
  index.ts        the only file other code imports: export { <name>Routes } from "./routes";
  routes.ts       the module's pages, each made with createPageRoute
  pages/          one file per screen: <thing>-page.tsx, exports <Thing>Page
  components/     parts used only by this module (when needed)
  api/            Zod schemas, query keys and TanStack Query hooks (when needed)
```

`src/modules/study-plan/` is the reference. Add `components/` and `api/` only when a screen needs
them. The module's routes are added to `appRoutes` in `src/app/router.ts`.

## A page

```ts
createPageRoute({
  path: "/today",
  access: LEARNER_ROLES,
  page: () => import("./pages/today-page").then((file) => file.TodayPage),
  titleKey: "nav.today",
});
```

| `access`                       | Who                                                        |
| ------------------------------ | ---------------------------------------------------------- |
| `"public"`                     | Anyone (an email link, the 404 page)                       |
| `"guest"`                      | Signed-out people only; signed-in people go to their home  |
| A list of roles                | Signed out → `/login?redirect=…`; wrong role → role's home |
| `LEARNER_ROLES`, `STAFF_ROLES` | Ready-made lists in `src/auth/roles.ts`                    |

- Pages for roles use the shell layout (top bar, tabs, sidebar). `"public"` and `"guest"` pages use
  the calm focus layout. `layout: "focus"` overrides it.
- The page loads only when opened (`page` is a dynamic import). The title comes from `titleKey`.
- A page composes: it calls the module's API hooks and renders shared components inside
  `<Page>` with a `<PageHeader>`. Components take props and return JSX; they do not fetch.
- A screen that is not built yet renders `<ComingSoonPage title={…} />`.
- Filters, tabs and page numbers live in the URL's search params, not in state.

## Navigation

- Menus per role live in `src/config/navigation.ts` (`NAVIGATION_BY_ROLE`): `tabs` (at most 4 on
  phones, "More" is the 5th) and `more`.
- A menu item must point to a route that role may open, and its `labelKey` must exist in `en.json`.
  `tests/project-rules/routes.test.ts` fails otherwise.
- Hiding a menu item is not security. The server decides (core-rules #1).

## Product rules that shape screens

- `/join` is for `INDIVIDUAL` only: code → consent choice → "Request sent". The request can be
  cancelled. No Organization screen until the server says approved.
- Teachers see only their own classes; the server enforces it, the UI does not filter by ID.
- After a membership change (approved, left, invite accepted), call
  `refreshAfterMembershipChange()` so the new token carries the new Organization.
- Invite and reset tokens arrive in the link: read once, remove from the address bar, never log.
