# 02 Modules and pages

How to add a feature or a screen. `src/modules/study-plan/` is the example to copy.

## What a module looks like

```
src/modules/topics/
  index.ts        export { topicsRoutes } from "./routes";
  routes.ts       the pages of this module
  pages/          topics-page.tsx  (exports TopicsPage)
  components/     parts only this module uses        ← add when needed
  api/            schemas, query keys, data hooks    ← add when needed
```

Other code imports a module only through its `index.ts` (`@/modules/topics`).

## Add a page

1. **Text.** Add the title and the sentences to `src/lang/en.json`.
2. **Page.** Create `pages/<thing>-page.tsx`:

   ```tsx
   import { Page, PageHeader, Section } from "@/components/layout";
   import { useLang } from "@/lang";

   export function TopicsPage() {
     const lang = useLang();
     return (
       <Page>
         <PageHeader title={lang.topics.title} />
         <Section title={lang.topics.needsPractice}>…</Section>
       </Page>
     );
   }
   ```

3. **Route.** Add it to the module's `routes.ts`:

   ```ts
   createPageRoute({
     path: "/topics",
     access: LEARNER_ROLES,
     page: () => import("./pages/topics-page").then((file) => file.TopicsPage),
     titleKey: "nav.topics",
   }),
   ```

4. **Menu.** If the page belongs in a menu, add it in `src/config/navigation.ts`.
5. **Test.** `tests/unit/modules/topics/pages/topics-page.test.tsx` (see guide 05).

### Who may open a page: `access`

| Value                          | Meaning                                                |
| ------------------------------ | ------------------------------------------------------ |
| `"public"`                     | Anyone: a link from an email, the 404 page             |
| `"guest"`                      | Signed-out people only. Signed-in people are sent home |
| `["TEACHER", …]`               | These roles only                                       |
| `LEARNER_ROLES`, `STAFF_ROLES` | Ready-made lists from `src/auth/roles.ts`              |

`access` only picks the screen. It is not security: the backend decides what each person may see
or change, from their token. Never send an `organizationId` to say whose data you want.

## Add a module

1. Create the folder with `index.ts`, `routes.ts` and the first page.
2. In `src/app/router.ts`, import its routes and add them to `appRoutes`.
3. Add menu items in `src/config/navigation.ts` if it has any.

## The pages today

| Path                                                                               | Who                         | Module                    |
| ---------------------------------------------------------------------------------- | --------------------------- | ------------------------- |
| `/login`, `/signup`, `/forgot-password`, `/reset-password`                         | Signed-out only             | `auth`                    |
| `/verify-email`                                                                    | Anyone                      | `auth`                    |
| `/onboarding`                                                                      | Individual, student         | `onboarding`              |
| `/today`, `/plan`                                                                  | Individual, student         | `study-plan`              |
| `/topics`                                                                          | Individual, student         | `topics`                  |
| `/ask`                                                                             | Individual, student         | `chat`                    |
| `/join`                                                                            | Individual                  | `organization-membership` |
| `/invite/:token`                                                                   | Anyone                      | `organization-membership` |
| `/organization/dashboard`, `/classes`, `/classes/:classId`, `/students/:studentId` | Teacher, Organization admin | `organization-management` |
| `/organization/members`, `/invites`, `/requests`, `/settings`                      | Organization admin          | `organization-management` |
| `/profile`, `/settings`                                                            | Every signed-in role        | `profile`, `settings`     |
| `/dev/ui`, `/dev/session`                                                          | Dev builds only             | `dev`                     |

Each module's `routes.ts` is the source of truth; check there if this table and the code differ.
All of these are placeholders except Settings → Appearance.

## Menus

`NAVIGATION_BY_ROLE` in `src/config/navigation.ts` gives each role its `homePath`, its `tabs`
(bottom bar on phones, at most 4, the 5th is "More") and its `more` list. On laptops the sidebar
shows both lists. A test fails if a menu item points to a page its role cannot open.

## Product rules to keep in mind

- **Joining an Organization.** A join code only creates a pending request. The person sees
  "Request sent" and can cancel. No Organization screen appears until the backend says approved.
- **Consent.** Moving into an Organization asks whether to share earlier study data. The default is
  not shared.
- **Teachers** see only their own classes. The backend enforces that.
- **Secret links.** Invite and password-reset tokens come in the link. Read them once, remove them
  from the address bar, never log them.
