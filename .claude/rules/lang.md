---
paths:
  - "src/lang/**"
  - "**/*.tsx"
---

# Screen text

All screen text lives in one file per language (core-rules #5). English is `src/lang/en.json`; it
is the source of truth, and its shape is the type of `lang`.

```tsx
import { fill, plural, useLang } from "@/lang";

const lang = useLang();
<h1>{lang.auth.loginTitle}</h1>
<p>{fill(lang.home.greeting, { name })}</p>          // "Hi {name}, ready to study?"
<p>{plural(lang.plan.daysLeft, days)}</p>            // { "one": "{count} day left", "other": "{count} days left" }
```

- Outside components (error messages built in `lib/`), use `getLang()`.
- ESLint blocks text typed into JSX, and into `alt`, `aria-label`, `placeholder`, `title`, `label`,
  `hint` and `description`. Dev-only pages and tests are exempt.

## Adding text

1. Add the key to `en.json` in the group for its screen (`auth`, `plan`, `organization`, …).
   Shared words (`save`, `cancel`, `tryAgain`) go in `common`; tab and menu labels in `nav`.
2. Keys are camelCase. Values are plain sentences. Placeholders look like `{name}`.
3. A number-dependent text is an object with `one` and `other` (optional `zero`, `two`, `few`, `many`).

## Adding a language (for example Hindi)

1. Copy `en.json` to `hi.json` and translate the values. Keep every key and `{placeholder}`.
2. In `src/lang/index.ts`, add `"hi"` to `LANGUAGES` and a loader line:
   `hi: () => import("./hi.json").then((file) => file.default),`
3. `tests/guardrails/lang-keys.test.ts` fails if a key or placeholder differs from English. A value
   left empty falls back to English at runtime. Only the chosen language's file downloads.

## Tone of voice

- Plain words and short sentences that a 12-year-old and an exam aspirant both read easily.
- Encouraging, never shaming: "Needs practice", not "Weak"; "Let's try that again", not "Wrong!".
- Say what happened and what to do next: "No internet. Your answers are saved; we'll send them when
  you're back online."
- "Organization" is always written in full (core-rules #16). Spell it "Organization".
