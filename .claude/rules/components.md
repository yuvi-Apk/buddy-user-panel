---
paths:
  - "src/components/**"
  - "src/features/**"
---

# Components

Every screen is built only from the shared components, so the whole app looks and behaves the same
(core-rules #4). Features never use a raw `<button>`, `<input>`, `<select>` or `<textarea>`; ESLint
blocks it. If something is missing, add it to `src/components/ui/` (skill: `add-ui-component`).

## The set

| Group       | Components                                                                                                                                                                                                           |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Actions     | `Button` (primary, secondary, outline, ghost, destructive), `IconButton` (needs a `label`), `LinkButton`                                                                                                             |
| Form fields | `TextField`, `EmailField`, `PasswordField`, `TextArea`, `SelectField`, `Checkbox`, `RadioGroup`, `ChoiceCardGroup` (big options as cards), `Switch`, `SearchField`, `DateField`, `CodeField`, `Form`, `SubmitButton` |
| Display     | `Card`, `Badge`, `TopicChip`, `ProgressBar`, `ProgressRing`, `Stat`, `Avatar`, `Divider`                                                                                                                             |
| Feedback    | `Alert`, `toast()` (shown by `<Toaster />`, mounted once at the root), `Skeleton`, `LoadingState`, `Spinner` (inside buttons only), `EmptyState`, `ErrorState`, `OfflineBanner`, `ComingSoon`                        |
| Overlays    | `ResponsiveDialog` (bottom sheet on phones, dialog on laptops), `ConfirmDialog`, `DropdownMenu`, `Popover`, `Tooltip`                                                                                                |
| Navigation  | `Tabs`, `SegmentedControl`, `TopBar`, `BottomNav`, `SideNav`                                                                                                                                                         |
| Layout      | `Page`, `PageHeader`, `Section`, `Stack`, `Inline`, `Grid`                                                                                                                                                           |

## Shared props

- Fields: `label` (required), `hint`, `error`, `required`, `disabled`. All of them sit in one `Field`
  frame: label above, hint below, error with an icon, wired with `aria-describedby` and `aria-invalid`.
- Sizes: `sm` 36px, `md` 44px (default, the touch size), `lg` 52px.
- `tone` for things with meaning: `neutral`, `primary`, `progress`, `weak`, `destructive`.
- `className` is for layout from the outside (width, margin, grid placement), never for colors or
  looks. A new look is a new variant inside the component.

## Building a component

- Built on Radix primitives where behavior is tricky (dialogs, menus, tabs, switches). Behavior from
  Radix, look from our tokens.
- A new Radix piece can start from the shadcn CLI (`pnpm dlx shadcn add <name>`, set up by
  `components.json`). Its output is a draft: swap its classes for our tokens and scales (ESLint
  reports the ones that don't exist), keep our prop names, and never keep color variables it adds
  to `index.css` (the colors guardrail fails on them).
- Nothing may write a `<style>` tag or inject CSS at runtime: the CSP blocks it. That is why toasts
  are built on Radix Toast and not on a library that injects its own styles.
- Variants with `class-variance-authority`, classes merged with `cn()` from `@/lib/cn`.
- Tokens only (core-rules #1). Visible focus ring. Works with the keyboard and a screen reader.
  Touch target at least 44px. `ref` passes through.
- Text a component shows by itself (the "Show password" label, the close button's label) comes from
  `src/lang/en.json` (core-rules #5).
- Every component and every variant appears in the UI gallery (`/dev/ui`), where the Playwright axe
  scan checks it in all 4 themes × light and dark.
- Email and password fields: correct `autocomplete`, paste allowed, no `maxLength` that cuts off text.
