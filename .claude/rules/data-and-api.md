---
paths:
  - "src/lib/api/**"
  - "src/lib/auth/**"
  - "src/features/**/api/**"
---

# Data and the API

## The backend's response shape (from `backend/src/utils/ApiResponse.ts` and `errorHandler.ts`)

```jsonc
// success
{ "statusCode": 200, "data": { ... }, "message": "Plan fetched", "success": true }
// error
{ "success": false, "message": "Validation failed", "errors": [{ "field": "email", "message": "..." }], "data": null }
// a page of a list: data = { items: [...], meta: { page, limit, total, totalPages } }, limit ≤ 100
```

`src/lib/api/client.ts` unwraps `data`, checks it with the Zod schema you pass, and throws an
`ApiError { status, message, fieldErrors, requestId }` for anything else. Only this file calls
`fetch` (core-rules #9).

## Calling an endpoint (skill: `add-api-hook`)

1. In `api/<feature>.schemas.ts`, write the Zod schema for what the backend returns. Mirror the
   backend DTO with `z.object` (tolerant: new backend fields never break the app). Request bodies
   use `z.strictObject`, like the backend.
2. In `api/<feature>.queries.ts`, add the key to the feature's key factory and a hook:

```ts
export const studyPlanKeys = {
  all: ["study-plan"] as const,
  today: () => [...studyPlanKeys.all, "today"] as const,
};

export function useTodayPlanQuery() {
  return useQuery({
    queryKey: studyPlanKeys.today(),
    queryFn: ({ signal }) =>
      api.get("/user/study-plan/today", todayPlanSchema, { signal }),
  });
}
```

3. Add an MSW handler in `src/test/msw/` and a test: success, a 4xx error, and a field error.

## Rules

- Never send `organizationId`, `userId` or any "whose data" ID to choose scope: the server reads it
  from the token (core-rules #7). IDs of the thing you act on (`classId`, `studentId`) are fine.
- Query keys come from the factory, never typed by hand. Mutations invalidate the keys they change.
- No retry on 4xx; at most 2 retries on 5xx or network errors (the query client's defaults).
- A mutation's error shows as a toast (`getErrorMessage(error)`); field errors go onto the form fields.
- Lists use the backend's pagination (`page`, `limit` ≤ 100) and keep `page` in the URL.
- Logout and every membership change clear the whole query cache.
- Long AI jobs: start, then poll or stream (see `ai-features.md`). Never wait in one request.

## Session (`src/lib/auth/`)

- The access token lives in memory only. The refresh token is an httpOnly cookie the browser sends
  to `/api/v1/user/auth` by itself; the app never sees it (core-rules #8).
- A 401 triggers one shared refresh, then one retry. Refreshes go through `navigator.locks` so two
  tabs never refresh at once (reusing an old refresh token revokes the session).
- `BroadcastChannel` tells the other tabs about sign-in and sign-out.
