---
name: add-ui-component
description: Add or change a shared component in src/components (ui, layout or states) of the Buddy user panel, in the Paper & Ink style, with variants, a gallery entry and tests. Use when a screen needs a control or display part that does not exist yet, or a new variant of one.
---

# Add a UI component

Rules: `.claude/rules/design-and-components.md`. Guide for people: `docs/03-design-system.md`.

## Steps

1. **Look first**: check `src/components/ui`, `layout` and `states`, and `/dev/ui`. A new variant
   or prop on an existing component beats a new component. One `Input` covers every input type.
2. **Where**: `ui/` for controls and display parts, `layout/` for page structure, `states/` for
   empty / error / loading states. One file, kebab-case, named exports.
3. **Build**:
   - Start the file with a short comment: what it is for and one usage example.
   - Behaviour that is hard to get right (dialogs, menus, tabs, tooltips) comes from `radix-ui`;
     the look is ours.
   - Token utilities only (`bg-card`, `border-input`, `text-muted-foreground`). No color value,
     no Tailwind palette class, no radius outside `rounded-sm | control | card | sheet | full`.
   - Sharp corners and strong borders: it must not look like stock shadcn.
   - Variants with `cva`; merge classes with `cn`. Sizes `sm` / `md` / `lg` match the other controls.
   - A form control uses `Field`, `FieldFrame` and `FieldLabel` from `field.tsx` and
     `useFieldIds`, and takes `label`, `hint`, `error`, `isRequired`.
   - Text comes in through props, or from `useLang()` for the component's own words.
   - Visible focus state, keyboard use, 44px touch size, an accessible name.
4. **Export**: add `export * from "./<file>";` to the folder's `index.ts`.
5. **Gallery**: show every variant and state in `src/modules/dev/components/gallery-*.tsx`.
6. **Test** (`tests/unit/components/<folder>/<file>.test.tsx`): the accessible name, each variant
   that changes behaviour, disabled and loading, keyboard use.

## Checklist before you hand over

- [ ] No existing component could do it with a variant
- [ ] Only tokens; `pnpm test tests/project-rules` passes (colors and contrast)
- [ ] Works in all four themes, light and dark; looked at in `/dev/ui`
- [ ] Meaning is never shown by color alone
- [ ] Exported from the folder's `index.ts`
- [ ] `pnpm check` passes
- [ ] Stop and list what changed; commit only when the user says so
