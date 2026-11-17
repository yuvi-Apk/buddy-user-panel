---
paths:
  - "src/api/**"
  - "src/auth/**"
  - "src/modules/**/api/**"
  - "src/utils/**"
  - "src/config/env.ts"
  - "src/pwa/**"
  - "tooling/**"
  - "index.html"
  - "public/**"
  - "vite.config.ts"
  - ".env.sample"
---

# Data, session and security

## Calling the backend

- Modules call the backend only from their `api/` folder, through `api` in
  `src/api/api-client.ts`, inside TanStack Query hooks.

  ```ts
  api.get("/user/topics", paginatedListSchema(topicSchema), {
    signal,
    query: { page },
  });
  api.post("/user/memberships/requests", requestSchema, { code });
  ```

- Every call names a Zod schema for `data`. Response schemas are tolerant (`z.object`), so a new
  backend field never breaks the app. Bodies the app sends are checked by the form's schema.
- Calls made while signed out (Google sign-in) pass `requiresAuth: false`.
- Never put `organizationId`, a user ID or a role in a request to choose whose data comes back.

## Errors

Every failed call throws `ApiError` (`src/api/api-error.ts`): `status`, `kind` (`http`, `offline`,
`network`, `timeout`, `invalid-response`), `message` (safe to show), `fieldErrors`, `requestId`.

| What happened                      | What the person sees                           |
| ---------------------------------- | ---------------------------------------------- |
| 400 with field errors, in a `Form` | The message under each field (`Form` does it)  |
| Another 4xx                        | The backend's message in a toast               |
| 429                                | "Too many attempts"                            |
| 5xx, a bad response                | Our own calm sentence, never the server's text |
| Offline, network, timeout          | Their own sentences from `en.json`             |
| A failed query                     | The screen's `ErrorState`, with the request ID |

- A failed mutation shows a toast by itself (`src/api/query-client.ts`). Set
  `meta: { toast: false }` when the screen shows the error itself.
- Queries retry at most twice, and only on 5xx, network or timeout. Mutations never retry.
- Do not catch an error just to hide it, and never show `error.stack` or a raw server body.

## Session

- Login is Google only, by redirect (`src/modules/auth/google-sign-in.ts`). The access token is
  kept in memory (`src/auth/session-store.ts`); the refresh token is the httpOnly
  `userRefreshToken` cookie, sent only to `/api/v1/user/auth`.
- A 401 triggers one shared refresh and one retry (`api-client.ts`). If the refresh is refused,
  the person is signed out and the router sends them to `/login`.
- Refresh runs under `navigator.locks`, and sign-in / sign-out is told to other tabs.
- `signOut()` also clears the query cache. Offline sign-out is finished once back online.
- Read the session with `useSession(selector)`; in loaders use `waitUntilSessionIsKnown()`.

## Browser security

- Storage: only `readFromStorage`, `writeToStorage`, `removeFromStorage` with the keys listed in
  `src/utils/storage.ts`. A new key needs a comment saying why it holds nothing personal.
- A link built from data may only be `http`, `https`, `mailto` or `tel` (there is no helper for
  this yet: add one in `src/utils` with the first such link). `?redirect=` goes through
  `getSafeRedirectPath` (same-site relative paths only).
- The CSP and the other headers are built in `tooling/security-headers.ts` and used by
  `pnpm preview`. No inline script, no `eval`, nothing from another site.
- The service worker (`tooling/pwa.ts`) precaches static files only. Never add runtime caching
  for `/api`.
- Logs go through `src/utils/logger.ts` and never contain tokens, emails, names or answers.
- No analytics, ads or trackers: many users are minors.

## Env

- `src/config/env.ts` is the only reader of `import.meta.env`; the rest imports `env`.
- To add a variable: add it to the Zod schema and to `env`, then to `.env.sample` with a comment.
  Tell the user its name so they can add it to their `.env`. Claude never reads or edits `.env`.
- `VITE_*` values are built into the app and public. `API_PROXY_TARGET` is dev-only and is not
  sent to the browser.

## AI features (chat, study plan, topics)

- The browser never calls a model. It asks the backend.
- Long work is a job: start it, show progress, poll or stream. Stream with `fetch` through
  `src/api`, because `EventSource` cannot send the auth header.
- Render AI text as text or safe markdown, never as HTML.
