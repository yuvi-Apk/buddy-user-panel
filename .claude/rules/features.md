---
paths:
  - "src/features/**"
  - "src/app/**"
  - "src/config/navigation.ts"
---

# Features

Every feature lives in `src/features/<feature>/` (kebab-case). Other code imports it only through
its `index.ts` (core-rules #10).

| File or folder             | Job                                                                                      |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| `index.ts`                 | Public entry: `<feature>Routes` and anything other features may use. Nothing else.       |
| `routes.ts`                | One `defineRoute(...)` per page: path, access, lazy page, title key                      |
| `pages/<name>-page.tsx`    | One per route. Composes components and hooks; holds no fetching code itself              |
| `components/`              | UI used only by this feature, built from `@/components`                                  |
| `api/<feature>.queries.ts` | Query-key factory and hooks (`useStudyPlanQuery`, `useJoinOrganizationMutation`)         |
| `api/<feature>.schemas.ts` | Zod schemas: what the backend sends (tolerant `z.object`) and accepts (`z.strictObject`) |
| `hooks/`                   | Hooks that are not API calls, only when needed                                           |

Features today: `auth`, `onboarding`, `study-plan`, `topics`, `chat`, `organization-membership`,
`organization-management`, `profile`, `settings`, `dev` (dev builds only).

## Routes and access

```ts
// src/features/study-plan/routes.ts
import { LEARNER_ROLES } from "@/lib/auth/roles";
import { defineRoute } from "@/lib/routing/define-route";

export const studyPlanRoutes = [
  defineRoute({
    path: "/today",
    access: LEARNER_ROLES,
    page: () => import("./pages/today-page").then((m) => m.TodayPage),
    titleKey: "nav.today",
  }),
];
```

- `access` is `"public"` (anyone), `"guest"` (signed-out only, e.g. `/login`), or the list of roles
  that may open the page (core-rules #6): `LEARNER_ROLES`, `STAFF_ROLES`, `USER_ROLES` or your own
  list. The loader redirects: signed out → `/login?redirect=…`, wrong role → that role's home. This
  only picks screens; the server enforces access (core-rules #7).
- `layout`: role pages use the `shell` (tabs and sidebar), the others the calm `focus` layout. Set
  `layout: "focus"` for a signed-in page that should have no menus (onboarding).
- Pages load lazily, one chunk per page. A new feature's routes are added to `appRoutes` in
  `src/app/routes.ts`.
- Put fixed paths (`/organization/classes/new`) above parameter paths (`/organization/classes/:classId`).
- Dev-only routes sit behind a literal `import.meta.env.DEV` check (`src/features/dev/routes.ts`),
  so production builds leave them out entirely.
- A screen with no feature yet is `<ComingSoonPage title={lang.nav.today} />`.

## Roles (backend `UserRole`, used as is)

| Role                 | Home                      | Phone tabs                                      | Behind "More"                                     |
| -------------------- | ------------------------- | ----------------------------------------------- | ------------------------------------------------- |
| `INDIVIDUAL`         | `/today`                  | Today · Plan · Topics · Ask · More              | Profile, Join an Organization, Settings           |
| `STUDENT`            | `/today`                  | Today · Plan · Topics · Ask · More              | Profile, Settings                                 |
| `TEACHER`            | `/organization/dashboard` | Dashboard · Classes · More                      | Profile, Settings                                 |
| `ORGANIZATION_ADMIN` | `/organization/dashboard` | Dashboard · Classes · Members · Requests · More | Invites, Organization settings, Profile, Settings |

Super Admins never use this app.

## Navigation

`src/config/navigation.ts` lists, per role, its `home`, its `tabs` (at most 4; "More" is always the
last tab) and its `more` items: route path, lang key, icon. Laptops show both lists in the sidebar.
"More" on phones also holds who is signed in and Sign out. `tests/guardrails/routes.test.ts` fails
when a route has no `access`, a nav item points to a route its role can't open, or a role has too
many tabs.

## Joining an Organization (screens only; the server decides)

- `/join` (INDIVIDUAL): enter the code → consent question about older data (default: not shared) →
  "Request sent, waiting for approval". The request can be cancelled. No Organization screen opens
  until the server says it was approved.
- `/invite/:token`: sign in or sign up with the invited email, answer the consent question, accept.
- When membership changes, call `refreshAfterMembershipChange()` (`src/lib/auth/session-actions.ts`):
  it clears all cached data and refreshes the session, so the new token carries the Organization.
