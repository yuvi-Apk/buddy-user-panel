---
paths:
  - "src/styles/**"
  - "src/theme/**"
  - "src/lang/**"
  - "public/theme-boot.js"
  - "**/*.tsx"
---

# Design system, components and text

The look is "Paper & Ink": warm paper backgrounds, ink text, calm accents, sharp corners and
strong borders. Components follow the shadcn/ui pattern (code we own, Radix for behaviour, `cva`
variants, `cn`, `data-slot`), but the look is ours: it must not look like stock shadcn.

## Colors

- `src/styles/tokens.css` is the only file with color values. `src/styles/index.css` maps tokens
  to Tailwind utilities and removes Tailwind's own palette, so `bg-indigo-600` does not exist.
- Use token utilities only: `bg-primary`, `text-muted-foreground`, `border-input`,
  `bg-weak-soft`, `text-destructive-soft-foreground`, …
- Each color family has four tokens: `X` (fill), `X-foreground` (text on the fill), `X-soft`
  (tinted background), `X-soft-foreground` (text on the tint).

| Family        | Means                                                                                     |
| ------------- | ----------------------------------------------------------------------------------------- |
| `primary`     | Actions, links, focus. Changes with the theme                                             |
| `progress`    | Progress and strong topics (green)                                                        |
| `weak`        | "Needs practice" only (amber). Never "Weak", never streaks                                |
| `destructive` | Real errors, the confirm button of an action that cannot be undone, and the required star |

- Never color alone: pair it with an icon and a word.
- Four themes (`indigo-ink` default, `lagoon`, `orchid`, `graphite`) × light / dark / system
  (`src/theme/themes.ts`). A new theme needs rules in `tokens.css`, an id in `themes.ts` and in
  `public/theme-boot.js`, and text in `en.json`; the project-rule tests check all four.
- No green, orange, red or pink theme: it would clash with the meaning colors.

## Shape, size, type

- Corners: `rounded-sm` (2px), `rounded-control` (4px), `rounded-card` (6px), `rounded-sheet`
  (12px), `rounded-full` for pills. No other radius.
- Controls: `sm` 36px (44px on touch screens), `default` 44px, `lg` 52px.
- Fonts: Lexend for headings, Atkinson Hyperlegible Next for text, both self-hosted. Text is 16px,
  never under 14px. Long reading text sits in `<Page width="reading">`.
- Motion is 150–250ms and stops under `prefers-reduced-motion`.
- Every state change moves, nothing pops: a mark (tick, radio dot) stays mounted and fades and
  scales in (`forceMount` + `data-[state]`); a chosen option's highlight slides to it; a label or
  icon that changes crossfades in one slot; new content opens its height and carries what is
  below it.
- A control keeps its size when its state changes: a loading `Button` covers its label with the
  spinner instead of adding one beside it.
- A short label centered in a fixed box (initials, a ring's number) uses `text-trim`, so it sits
  on its letters, not its line box.

## Components

- Modules build screens only from `@/components/ui`, `@/components/layout`,
  `@/components/states`. Missing something? Add it there (`add-ui-component` skill), with its
  variants, and show it in `/dev/ui`.
- A new look is a new variant inside the component (class-variance-authority), never a one-off
  override from a module.
- shadcn naming: the look prop is `variant` (never `tone`), the base value is `default`
  (`variant="default"`, `size="default"`), sizes are `sm` / `default` / `lg`. Every rendered part
  has `data-slot="<component>-<part>"`. Merge classes with `cn` from `@/utils/cn`.
- A shadcn component may be copied in as a start, then restyled with our tokens and corners and
  its text moved to `en.json`. Keep only what a screen uses now; no unused parts or variants.
- Form fields are ours, not shadcn's: `Input`, `TextArea`, `SelectField` on `field.tsx`.
- One `Input` for every text input; `type` decides the behaviour (`email`, `password` with a
  show/hide button, `search`, `date`). `TextArea` and `SelectField` share its frame.
- Field layout (`src/components/ui/field.tsx`): the label sits inside the empty control and moves
  up onto the border on focus or when there is a value (`label-raised:` variant). `isRequired`
  adds the red star. `hint` and `error` are below; `error` marks the control invalid for screen
  readers.
- Forms use `<Form form={form} onSubmit={…}>` with React Hook Form and a Zod resolver. The
  backend's field errors appear under the matching fields by themselves.
- Every interactive part has a visible focus state, works with the keyboard, and is at least 44px
  on touch screens. `IconButton` needs a `label`.
- Data screens show `LoadingState` / skeletons, `EmptyState`, `ErrorState` and the offline banner.

## Text

- All screen text is in `src/lang/en.json`, grouped by screen, camelCase keys.

  ```tsx
  const lang = useLang();
  <h1>{lang.auth.loginTitle}</h1>
  <p>{fill(lang.home.greeting, { name })}</p>
  <p>{plural(lang.plan.daysLeft, days)}</p>
  ```

- Outside components use `getLang()`. Config names its text with a `LangKey` (`"nav.today"`).
- Tone: plain words, short sentences, encouraging. "Needs practice", not "Weak". "Organization"
  in full.
- A new language is one more JSON file with the same keys, registered in `src/lang/index.ts`.
