---
paths:
  - "src/styles/**"
  - "src/theme/**"
  - "**/*.tsx"
---

# Design system: "Paper & Ink"

Built for long study sessions: a warm paper page with ink text (about 15:1 contrast, without the
glare of pure black on white), calm low-saturation accents, and color that only appears when it
means something. Full guide for people: `docs/04-design-system.md`.

## Color meaning (core-rules #2) — the same in every theme

| Meaning                        | Token family  | Use it for                                                           |
| ------------------------------ | ------------- | -------------------------------------------------------------------- |
| Actions, links, focus          | `primary`     | Buttons, links, selected tabs, focus ring                            |
| Progress, strong topics        | `progress`    | Progress bars, "Strong" topics, completed days                       |
| Weak topics ("Needs practice") | `weak`        | Weak topics only. Never stars, streaks, reminders or warnings        |
| Real errors only               | `destructive` | Failed actions, invalid input, lost connection, irreversible confirm |
| Everything else                | neutrals      | Text, surfaces, borders                                              |

- Never color alone: always an icon and a word too ("Needs practice", "Strong").
- The label for weak topics is "Needs practice", not "Weak".

## Tokens (core-rules #1, #3)

- `src/styles/tokens.css` is the only file with color values. `index.css` maps them to Tailwind
  utilities and removes Tailwind's own palette, so `bg-indigo-600` and `bg-white` don't exist.
- Each family has four tokens: `X` (fill), `X-foreground` (text on the fill), `X-soft` (tinted
  background), `X-soft-foreground` (text on the tint). Example: `bg-weak-soft text-weak-soft-foreground`.
- Neutrals: `background`, `foreground`, `card`, `card-foreground`, `popover`, `muted`,
  `muted-foreground`, `border`, `input`, `ring`. `brand` / `brand-foreground` default to primary
  (an Organization brand color goes here later).
- Don't use `dark:` for colors: the tokens already switch with the mode.
- Every pair is checked for WCAG AA in every theme × mode by `tests/guardrails/contrast.test.ts`.

## Themes and modes

`<html data-mode="light|dark" data-accent="indigo-ink|lagoon|orchid|graphite">`, set before first
paint by `public/theme-boot.js` and changed through `useTheme()`.

| Theme                | Feeling                                           | Suits                           |
| -------------------- | ------------------------------------------------- | ------------------------------- |
| Indigo Ink (default) | Focus and trust; calm for hours                   | Everyone                        |
| Lagoon               | Calm, eases exam stress                           | Long revision, anxious learners |
| Orchid               | Imagination, energy without aggression            | Younger school students         |
| Graphite             | Minimal; color shows only when it means something | Adult aspirants, heavy reading  |

No green, orange, red or pink themes: they would clash with the meaning colors. Modes: Light
("Paper"), Dark ("Night"), System.

## Type and shape

- Headings: Lexend (`font-display`). Text and UI: Atkinson Hyperlegible Next (`font-sans`). Both
  self-hosted; the stack ends in `system-ui` for scripts they don't cover.
- UI text 16px (inputs below 16px make iOS zoom). Reading text (answers, explanations) 17px, line
  height 1.65, at most 68 characters wide (`max-w-prose`). Nothing below 14px.
- Ink for text, `muted-foreground` for secondary text. Never pure black or white.
- Radius: 10px controls, 16px cards, full for pills. Shadows only in light mode; dark mode uses borders.
- Icons: lucide, stroke 1.75, 20px in controls and 24px in navigation, always with a text label or
  an `aria-label`.

## Layout, motion, accessibility (core-rules #14)

- Mobile first: write the phone layout, then add `md:` and `lg:`. Under `lg` (1024px): top bar +
  bottom tabs (max 5). From `lg`: sidebar, content up to about 1120px.
- Page gutter 16px phone, 24px tablet, 32px laptop. Spacing on the 4px scale, mostly 8px steps.
- Respect safe areas (`env(safe-area-inset-*)`), use `dvh` not `vh`, never disable zoom.
- Touch targets at least 44×44px. Visible focus ring on everything focusable.
- Motion 150–250ms ease-out; nothing essential moves under `prefers-reduced-motion`.
- WCAG 2.2 AA. Every page has one `h1`, a title, and works at 320px wide and 200% zoom.
- Loading uses skeletons; spinners only inside buttons.
