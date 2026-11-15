# 03 Design system

The look is called "Paper & Ink": warm paper backgrounds, ink-colored text, calm accents, sharp
corners and strong borders. It is made for long study sessions on a phone.

See all of it running at `/dev/ui` in a dev build.

## Colors

Every color value lives in `src/styles/tokens.css`. Nowhere else. In components you use the token
names as Tailwind classes:

```tsx
<div className="border border-border bg-card text-foreground">
<p className="text-muted-foreground">
<span className="bg-weak-soft text-weak-soft-foreground">
```

Tailwind's own palette is switched off, so `bg-indigo-600` or `text-white` is reported as an
unknown class by ESLint, and a `#fff` in a component fails `tests/project-rules/colors.test.ts`.

### What the colors mean

| Token family                                     | Meaning                                                                              |
| ------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `primary`                                        | Actions, links, focus. Changes with the theme                                        |
| `progress`                                       | Progress, strong topics (green)                                                      |
| `weak`                                           | "Needs practice" (amber). Nothing else                                               |
| `destructive`                                    | Real errors, confirming something that cannot be undone, and the required star (red) |
| `background`, `card`, `muted`, `border`, `input` | Paper, surfaces and lines                                                            |

Each family has four tokens: `primary` (fill), `primary-foreground` (text on the fill),
`primary-soft` (tinted background), `primary-soft-foreground` (text on the tint).

Two rules matter most:

- **Never color alone.** About 1 in 12 men cannot tell red from green. Always add an icon and a word.
- **Red is not for scores, deadlines or weak topics.** A weak topic is amber and is called
  "Needs practice".

### Themes

People pick a theme in Settings → Appearance: Indigo Ink (default), Lagoon, Orchid or Graphite,
each in light, dark or "follow my phone". A theme changes only the `primary` family.
`tests/project-rules/contrast.test.ts` checks every text and border pair in all of them (WCAG AA).

## Shape and size

| Thing    | Values                                                                                            |
| -------- | ------------------------------------------------------------------------------------------------- |
| Corners  | `rounded-sm` 2px, `rounded-control` 4px, `rounded-card` 6px, `rounded-sheet` 12px, `rounded-full` |
| Controls | `sm` 36px (44px on touch screens), `md` 44px, `lg` 52px                                           |
| Fonts    | Lexend for headings, Atkinson Hyperlegible Next for text, both served by the app                  |
| Text     | 16px; never smaller than 14px                                                                     |
| Layout   | Under 1024px: top bar and bottom tabs. From 1024px: sidebar                                       |

## Components

Screens are built only from the shared components:

```tsx
import { Button, Card, Input } from "@/components/ui";
import { Page, PageHeader, Stack } from "@/components/layout";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
```

A raw `<button>`, `<input>`, `<select>` or `<textarea>` in a module is a lint error. If something
is missing, add it to `src/components` and show it in the gallery (`src/modules/dev`). A new look
is a new variant inside the component, not a one-off class from a screen.

### Inputs and forms

There is one `Input`. Its `type` decides how it behaves, like a normal `<input>`:

```tsx
<Input label={lang.profile.name} isRequired {...form.register("name")} error={errors.name?.message} />
<Input type="email" label={lang.auth.email} placeholder="asha@example.com" />
<Input type="password" label={lang.auth.password} autoComplete="new-password" />
<Input type="search" label={lang.topics.search} />
<Input type="date" label={lang.onboarding.examDate} />
```

- The label sits inside the empty input and moves up onto the border when the input has focus or a
  value. The placeholder shows only while focused.
- `isRequired` adds a red star. `hint` and `error` show below the input.
- `type="password"` adds a show/hide button; `type="email"` opens the email keyboard.
- `TextArea` and `SelectField` look and behave the same way.

A form:

```tsx
const form = useForm<Values>({ resolver: zodResolver(schema) });

<Form form={form} onSubmit={save}>
  <Input
    type="email"
    label={lang.auth.email}
    {...form.register("email")}
    error={form.formState.errors.email?.message}
  />
  <SubmitButton>{lang.common.save}</SubmitButton>
</Form>;
```

When the backend answers with field errors, `Form` puts each message under its field and focuses
the first one. You write nothing for that.

### States

Every screen that shows data needs four states: loading (`LoadingState` or skeletons), empty
(`EmptyState`), error (`ErrorState`, with a "Try again" action) and offline (the banner is shown
by the shell).

## Text

All text on screen lives in `src/lang/en.json`. Typing text into JSX is a lint error.

```tsx
const lang = useLang();

<h1>{lang.auth.loginTitle}</h1>
<p>{fill(lang.home.greeting, { name })}</p>      // "Hi {name}, ready to study?"
<p>{plural(lang.plan.daysLeft, days)}</p>         // { "one": "{count} day left", "other": "{count} days left" }
```

- You get autocomplete, and a missing key is a TypeScript error.
- Outside components (for example in the API client) use `getLang()`.
- Write plain, short, encouraging sentences. Always "Organization", never a shortened form.
- Another language is one more file (`hi.json`) with the same keys; a test compares the keys.

## Accessibility

- Everything works with the keyboard and has a visible focus state.
- Touch targets are at least 44px. Zoom is never disabled.
- After navigation, focus moves to the page heading and the browser tab gets the page title.
- Motion is short and stops when the person asked their device for less motion.
