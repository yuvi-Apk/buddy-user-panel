---
paths:
  - "src/lib/**"
  - "index.html"
  - "public/**"
  - "vite.config.ts"
  - "security-headers.config.ts"
---

# Security

Many people using Buddy are minors, often on shared phones and school computers.

## Tokens and storage (core-rules #8)

- Access token: in memory only (`session-store.ts`). Refresh token: an httpOnly, SameSite=Strict
  cookie on `/api/v1/user/auth`, never readable by page scripts.
- `src/lib/storage.ts` is the only door to localStorage. It allows a short list of keys (theme,
  language, the "signed out while offline" flag, later dismissed hints). Never a token, an email,
  a name, an answer or any study data.
- Logout clears the memory token and the query cache, and tells the other tabs. Logging out while
  offline marks the person signed out locally, so the next launch does not restore the session,
  and retries the server logout when back online.

## Untrusted content (core-rules #11)

- React escapes text; keep it that way. No `dangerouslySetInnerHTML`, `eval`, `new Function`.
- A link built from data goes through `safeUrl()` (http, https, mailto, tel only).
- `?redirect=` after login goes through `safeRedirect()` (same-origin relative paths only).
- AI answers and markdown (later) render without raw HTML, and links in them go through `safeUrl()`.
- Invite and password-reset tokens arrive in links: read them once, remove them from the address
  bar (`history.replaceState`), never log them.

## Headers and CSP

Defined once in `security-headers.config.ts`. `pnpm preview` sends them; `pnpm build` writes them
to `dist/_headers` (Netlify and Cloudflare Pages read it; for another host, copy them into its
config). `tests/guardrails/security-headers.test.ts` checks them.

```
default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: <api>;
font-src 'self'; connect-src 'self' <api>; worker-src 'self'; manifest-src 'self'; media-src 'self' blob:;
object-src 'none'; base-uri 'self'; form-action 'self'; frame-src 'none'; frame-ancestors 'none';
upgrade-insecure-requests
```

plus HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
`Referrer-Policy: strict-origin-when-cross-origin`, a `Permissions-Policy` that turns off camera,
microphone, location, payment and USB, `Cross-Origin-Opener-Policy: same-origin` and
`Cross-Origin-Resource-Policy: same-origin`. `<api>` is added only when `VITE_API_BASE_URL` is on
another site. The local preview leaves out HSTS and `upgrade-insecure-requests` (it is plain http).

- Scripts: `'self'` only. No inline scripts (the theme boot script is a file in `public/`; the
  service worker is registered from the bundle), no `eval`, no third-party scripts, fonts,
  trackers or CDNs (core-rules #18).
- Styles allow `'unsafe-inline'` for one reason: Radix dialogs lock page scrolling with a small
  `<style>` tag. Inline CSS can't run code. Don't add other inline styles or `<style>` tags.
- When the app needs camera or microphone (voice doubts, later), change `Permissions-Policy` to
  `microphone=(self)`, never to `*`.
- Source maps are built "hidden" (no file links to them) for a future error tracker. Leave
  `dist/**/*.map` out of the deploy, or upload them only to the error tracker.
- A new external origin (an image CDN, an error tracker) needs a reason and a CSP change here.

## Login screens

- One message for every login failure; the server decides it. Don't hint whether an email exists.
- Password fields: `autocomplete="current-password"` / `"new-password"`, paste allowed, show/hide.
- A 429 shows "Too many attempts, try again in a few minutes".

## Privacy

- No personal data in logs, error reports or analytics (there are no analytics).
- If you serve under-18s in India, the DPDP Act requires verifiable parental consent and forbids
  tracking children. Check with legal before launch.
