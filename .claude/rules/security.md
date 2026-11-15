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

Defined once in `security-headers.config.ts`, used by `vite preview`, copied to the host on deploy:

```
default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob: <api>;
font-src 'self'; connect-src 'self' <api>; worker-src 'self'; manifest-src 'self';
object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests
```

plus HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
`Permissions-Policy: camera=(), microphone=(), geolocation=()`, `Cross-Origin-Opener-Policy: same-origin`.
No inline scripts (the theme boot script is a file in `public/`). No third-party scripts, fonts,
trackers or CDNs (core-rules #18).

## Login screens

- One message for every login failure; the server decides it. Don't hint whether an email exists.
- Password fields: `autocomplete="current-password"` / `"new-password"`, paste allowed, show/hide.
- A 429 shows "Too many attempts, try again in a few minutes".

## Privacy

- No personal data in logs, error reports or analytics (there are no analytics).
- If you serve under-18s in India, the DPDP Act requires verifiable parental consent and forbids
  tracking children. Check with legal before launch.
