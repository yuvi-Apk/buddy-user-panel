---
name: new-module
description: Create a new module folder in the Buddy user panel (src/modules/<name>) with its index, routes and first page, and wire it into the router and menus. Use when asked to add a new feature area or section that does not have a module yet.
---

# New module

`src/modules/study-plan/` is the reference. The rules are in `.claude/rules/modules.md`; the guide
for people is `docs/02-modules-and-pages.md`.

## Steps

1. **Name**: kebab-case, says what the feature is (`study-plan`, `organization-membership`).
   "Organization" is never shortened. Check that no existing module already owns the feature.
2. **Folder**: create only what is needed now.

   ```
   src/modules/<name>/
     index.ts       // Public entry of the <name> module.
                    export { <name>Routes } from "./routes";
     routes.ts      export const <name>Routes = [createPageRoute({ … })];
     pages/<thing>-page.tsx
   ```

   Add `components/` and `api/` later, when a screen needs them.

3. **First page**: follow the `add-page` skill for the page, its route, its text and its test.
4. **Router**: in `src/app/router.ts`, import `<name>Routes` from `@/modules/<name>` and add
   `...<name>Routes` to `appRoutes`.
5. **Menu** (only if the module has a menu entry): add a `createNavItem` and put it in the right
   roles in `NAVIGATION_BY_ROLE` in `src/config/navigation.ts`. Phones show at most 4 tabs.
6. **Tests**: `tests/unit/modules/<name>/…`, same folders as the module.

## Checklist before you hand over

- [ ] Other code imports the module only through `@/modules/<name>`
- [ ] Every page is made with `createPageRoute`, with `access` and a `titleKey` that exists in `en.json`
- [ ] Every menu item points to a route its role may open
- [ ] No raw `<button>`, `<input>`, `<select>`, `<textarea>`; no text typed into JSX
- [ ] No empty folders or files "for later"
- [ ] `pnpm check` passes
- [ ] Stop and list what changed; commit only when the user says so
