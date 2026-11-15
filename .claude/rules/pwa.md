---
paths:
  - "vite.config.ts"
  - "tooling/pwa.ts"
  - "public/**"
  - "src/pwa/**"
  - "pwa-assets.config.ts"
---

# PWA

All PWA settings live in `tooling/pwa.ts` (used by `vite.config.ts`, checked by
`tests/guardrails/pwa.test.ts`).

- `vite-plugin-pwa` (Workbox) with `registerType: "prompt"`: a new version waits until the person
  taps "Reload" in `src/pwa/update-prompt.tsx`, so the app never reloads in the middle of a quiz.
- The service worker is registered from the bundle (`injectRegister: false`), never by an inline
  script: the CSP allows none.
- Precache only the built static files (`PRECACHED_FILES`: JS, CSS, HTML, fonts, icons).
  `navigateFallback` is `index.html`, with `/api/` on the denylist. No runtime caching at all.
- Never cache `/api` responses (core-rules #13): they hold personal data, and phones are shared.
- Manifest (`createManifest`): name and description from `en.json`, `id` and `scope` `/`,
  `start_url` `/?source=pwa`, `display` `standalone`. `theme_color` is the Indigo Ink primary and
  `background_color` the paper color, both read from `tokens.css`.
- Icons (favicon, 64, 192, 512, maskable, apple-touch) are generated from `public/logo.svg` with
  `pnpm pwa:icons` (`pwa-assets.config.ts`) and committed. Never edit the generated files by hand;
  change the logo and run the command again. The logo's colors must match the tokens (guardrail).
- `useInstallPrompt()` (`src/pwa/use-install-prompt.ts`) handles the Android/desktop install
  prompt and the iOS "Add to Home Screen" hint. Settings → Install the app uses it.
- The app shell opens offline and shows the offline banner; screens show their offline state.
- In development the service worker is off, so it never serves stale code while you work. To try
  it, run `pnpm build && pnpm preview`.
