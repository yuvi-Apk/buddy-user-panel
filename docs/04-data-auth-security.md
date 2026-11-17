# 04 Data, session and security

How the app talks to the backend, how errors reach the person, how the session works, and the
security rules. Many users are children on shared phones, so these rules are strict.

## Calling the backend

Only `src/api` calls `fetch`. A module puts its calls in its own `api/` folder, as TanStack Query
hooks that use the `api` client:

```ts
// src/modules/topics/api/topics.ts
const topicSchema = z.object({ id: z.string(), name: z.string() });

export const topicKeys = {
  all: ["topics"] as const,
  list: (page: number) => [...topicKeys.all, "list", page] as const,
};

export function useTopics(page: number) {
  return useQuery({
    queryKey: topicKeys.list(page),
    queryFn: ({ signal }) =>
      api.get("/user/topics", paginatedListSchema(topicSchema), {
        signal,
        query: { page },
      }),
  });
}
```

(No module has an `api/` folder yet; the first real screen adds one in this shape. The endpoint
above is an example.)

What the client does for you:

- adds the base URL (`VITE_API_BASE_URL`) and the access token
- unwraps the backend's envelope `{ statusCode, data, message, success }`
- checks `data` against your Zod schema, so wrong data never reaches a screen
- on a 401, refreshes the session once and tries again once
- stops after 15 seconds
- turns every failure into one `ApiError`

Write response schemas with `z.object` and list only the fields you use. Then a new field from the
backend never breaks the app.

**Never send an ID to choose whose data you get** (`organizationId`, a user ID, a role). The
backend reads that from the token.

## Errors

Every failed call throws an `ApiError` with `status`, `kind`, `message`, `fieldErrors` and
`requestId`. `message` is always safe to show.

| What happened                         | What the person sees                                    |
| ------------------------------------- | ------------------------------------------------------- |
| Validation failed (400 with fields)   | The backend's message under each field of the form      |
| Another 4xx ("This code has expired") | The backend's message in a toast                        |
| Too many attempts (429)               | "Too many attempts. Please try again in a few minutes." |
| Server error (5xx)                    | Our own calm sentence. Never "Internal Server Error"    |
| Offline, no network, timeout          | A sentence for each                                     |
| A page crashed                        | The error page, with the request ID for support         |

You get most of this for free:

- A failed **mutation** shows a toast by itself. Pass `meta: { toast: false }` if your screen shows
  the error in its own way.
- A failed **form** shows the backend's field errors under the fields (`Form` does it).
- A failed **query** is yours to show: render `<ErrorState>` when `query.isError`.

Queries retry twice on server and network errors, never on a 4xx. Mutations never retry.

The backend side of the same contract is `../backend/src/utils/errorHandler.ts`: every error
leaves as `{ success: false, message, errors: [{ field, message }] }`.

## Session

- People log in with Google only, with a plain redirect (no Google script in the app). The button
  links to Google's sign-in page; Google sends the person back to `/auth/google/callback` with an
  ID token, which the app checks (`state`, `nonce`) and sends to `POST /user/auth/google`. The
  backend answers with the session and sets the refresh cookie. The first sign-in creates the
  account and opens `/onboarding` (on my own, or with a school or coaching). Details in
  `src/modules/auth/google-sign-in.ts`. Needs `VITE_GOOGLE_CLIENT_ID` (see `.env.sample`).
- The **access token** is kept in memory only. It is gone when the tab closes.
- The **refresh token** is an httpOnly cookie. JavaScript cannot read it.
- At start, one silent refresh restores the session. Route checks wait for it.
- Refreshing is shared: ten requests that get a 401 together cause one refresh, also across tabs.
- Signing in or out in one tab updates the other tabs.
- Signing out clears the token and all cached data. If the phone is offline, the person is signed
  out locally at once and the server is told when the connection is back.

```ts
const user = useSession((session) => session.user); // in a component
await signOut(); // from src/auth/session
```

After the person's membership changes (request approved, left, invite accepted) call
`refreshAfterMembershipChange()`, so the new token carries the new Organization.

## Security rules

| Area            | Rule                                                                                          |
| --------------- | --------------------------------------------------------------------------------------------- |
| Access          | The backend decides. A role in the app only hides or shows screens                            |
| Browser storage | Only through `src/utils/storage.ts`, only its listed keys. Never a token or personal data     |
| HTML            | No `dangerouslySetInnerHTML`, no `eval`. AI and markdown text renders without raw HTML        |
| Redirects       | `?redirect=` accepts only paths on this site (`getSafeRedirectPath`)                          |
| Other sites     | No script, font, CDN, analytics or tracker from another site                                  |
| Headers         | A strict Content-Security-Policy and friends, built in `tooling/security-headers.ts`          |
| Service worker  | Stores only the app's own static files. Never an `/api` answer                                |
| Secret links    | Invite tokens and Google's ID token are read once, removed from the address bar, never logged |
| Logs            | Through `src/utils/logger.ts`; never a token, email, name or answer                           |
| Login screens   | One message for a wrong email or a wrong password. Password managers must work                |

ESLint and `tests/project-rules/` enforce most of these.

## Env variables

| File          | Committed | Holds                                        |
| ------------- | --------- | -------------------------------------------- |
| `.env`        | no        | Your own values                              |
| `.env.sample` | yes       | Every variable with an example and a comment |

`src/config/env.ts` is the only file that reads env. It checks the values with Zod and stops the
app with a clear message when one is wrong. Everything else imports `env`.

To add a variable: add it to the schema and to `env` in `src/config/env.ts`, then to `.env.sample`
and your `.env`.

`VITE_*` values are built into the app. Anyone can read them in the browser, so **never put a
secret in one**.

## PWA

- The app can be installed. `useInstallPrompt()` covers Android, desktop and the iOS hint.
- A new version never reloads the page by itself (the person may be in the middle of a quiz). A
  "New version ready" prompt asks first.
- The app shell opens offline; data needs a connection, and an offline banner says so.
