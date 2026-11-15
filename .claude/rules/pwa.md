---
paths:
  - "vite.config.ts"
  - "public/**"
  - "src/pwa/**"
  - "pwa-assets.config.ts"
---

# PWA

- `vite-plugin-pwa` (Workbox) with `registerType: "prompt"`: a new version waits until the person
  taps "Reload" on the toast, so the app never reloads in the middle of a quiz.
- Precache only the built static files (JS, CSS, HTML, fonts, icons). `navigateFallback` is
  `index.html`, with `/api/` on the denylist.
- Never cache `/api` responses (core-rules #13): they hold personal data, and phones are shared.
- Manifest: name "Buddy", `id` and `scope` `/`, `start_url` `/?source=pwa`, `display` `standalone`,
  `theme_color` from the Indigo Ink primary, `background_color` the paper color.
- Icons (192, 512, maskable, apple-touch) are generated from `public/logo.svg` with `pnpm pwa:icons`.
  Never edit the generated files by hand.
- `useInstallPrompt()` handles the Android/desktop install prompt and the iOS "Add to Home Screen" hint.
- The app shell opens offline and shows the offline banner; screens show their offline state.
- In development the service worker is off, so it never serves stale code while you work.
