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
| `routes.tsx`               | One `defineRoute(...)` per page: path, access, lazy page, title key                      |
| `pages/<name>-page.tsx`    | One per route. Composes components and hooks; holds no fetching code itself              |
| `components/`              | UI used only by this feature, built from `@/components`                                  |
| `api/<feature>.queries.ts` | Query-key factory and hooks (`useStudyPlanQuery`, `useJoinOrganizationMutation`)         |
| `api/<feature>.schemas.ts` | Zod schemas: what the backend sends (tolerant `z.object`) and accepts (`z.strictObject`) |
| `hooks/`                   | Hooks that are not API calls, only when needed                                           |

Features today: `auth`, `onboarding`, `study-plan`, `topics`, `chat`, `organization-membership`,
`organization-management`, `profile`, `settings`, `dev` (dev builds only).

## Routes and access

```ts
export const studyPlanRoutes = [
  defineRoute({
    path: "/today",
    access: ["INDIVIDUAL", "STUDENT"],
    page: () => import("./pages/today-page").then((m) => m.TodayPage),
    titleKey: "nav.today",
  }),
];
```

- `access` is `"public"` (anyone), `"guest"` (signed-out only, e.g. `/login`), or the list of roles
  that may open the page (core-rules #6). The loader redirects: signed out → `/login?redirect=…`,
  wrong role → that role's home. This only picks screens; the server enforces access (core-rules #7).
- Pages load lazily, one chunk per page.
- Put fixed paths (`/organization/classes/new`) above parameter paths (`/organization/classes/:classId`).

## Roles (backend `UserRole`, used as is)

| Role                 | Home                      | Phone tabs                                      |
| -------------------- | ------------------------- | ----------------------------------------------- |
| `INDIVIDUAL`         | `/today`                  | Today · Plan · Topics · Ask · Profile           |
| `STUDENT`            | `/today`                  | Today · Plan · Topics · Ask · Profile           |
| `TEACHER`            | `/organization/dashboard` | Dashboard · Classes · Profile                   |
| `ORGANIZATION_ADMIN` | `/organization/dashboard` | Dashboard · Classes · Members · Requests · More |

Super Admins never use this app.

## Navigation

`src/config/navigation.ts` lists the items per role: route path, lang key, icon. Phones show at most
5 tabs; laptops show every item in the sidebar. `tests/guardrails/routes.test.ts` fails when a route
has no `access` or a nav item points to a route its role can't open.

## Joining an Organization (screens only; the server decides)

- `/join` (INDIVIDUAL): enter the code → consent question about older data (default: not shared) →
  "Request sent, waiting for approval". The request can be cancelled. No Organization screen opens
  until the server says it was approved.
- `/invite/:token`: sign in or sign up with the invited email, answer the consent question, accept.
- When membership changes, refresh the session (the new token carries the Organization) and clear
  all cached data.
