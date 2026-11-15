---
name: add-page
description: Add one screen to an existing module of the Buddy user panel, with its route, access, title, text and test. Use when asked to add a page, screen or route, or to replace a "coming soon" placeholder with a real screen.
---

# Add a page

Rules: `.claude/rules/modules.md` and `design-and-components.md`. Guide for people:
`docs/02-modules-and-pages.md`.

## Steps

1. **Who may open it**: decide `access` first: `"public"`, `"guest"`, `LEARNER_ROLES`,
   `STAFF_ROLES`, or a list of roles. If unsure, ask. The server still decides what data comes back.
2. **Text**: add the title and every sentence to `src/lang/en.json` under the screen's group
   (camelCase keys, plain and encouraging words).
3. **Page** (`src/modules/<name>/pages/<thing>-page.tsx`, exports `<Thing>Page`):

   ```tsx
   export function TopicsPage() {
     const lang = useLang();
     return (
       <Page>
         <PageHeader
           title={lang.topics.title}
           description={lang.topics.intro}
         />
         <Section title={lang.topics.needsPractice}>…</Section>
       </Page>
     );
   }
   ```

   - Build it only from `@/components/ui`, `@/components/layout`, `@/components/states`.
   - Data comes from the module's `api/` hooks (`add-api-hook` skill). Show `LoadingState`,
     `EmptyState` and `ErrorState` for it.
   - Filters, tabs and page numbers go in the URL's search params.
   - Parts used only here go in the module's `components/`.

4. **Route** (`src/modules/<name>/routes.ts`):

   ```ts
   createPageRoute({
     path: "/topics",
     access: LEARNER_ROLES,
     page: () => import("./pages/topics-page").then((file) => file.TopicsPage),
     titleKey: "nav.topics",
   }),
   ```

5. **Menu**: only if the page belongs in a menu, add it in `src/config/navigation.ts`.
6. **Test** (`tests/unit/modules/<name>/pages/<thing>-page.test.tsx`): with
   `renderRoute("/topics", { as: "STUDENT" })` check what an allowed role sees, that a signed-out
   person lands on login, and that a wrong role lands on its home. Add MSW handlers for the data.

## Checklist before you hand over

- [ ] `access` and `titleKey` are set; the title exists in `en.json`
- [ ] Loading, empty, error and offline states exist for every piece of data
- [ ] No text typed into JSX; no raw form elements; no color values
- [ ] Meaning is never shown by color alone (icon and word too)
- [ ] Works at 360px and 1280px, in light and dark, with the keyboard only
- [ ] No `organizationId` or other scope ID is sent
- [ ] `pnpm check` passes
- [ ] Stop and list what changed; commit only when the user says so
