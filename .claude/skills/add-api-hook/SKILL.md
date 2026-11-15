---
name: add-api-hook
description: Add a TanStack Query hook that reads from or writes to the Buddy backend, with its Zod schema, query key, mock handler and test. Use when a screen needs data from the backend or needs to send a form.
---

# Add an API hook

Rules: `.claude/rules/data-and-security.md`. Guide for people: `docs/04-data-auth-security.md`.
No module has an `api/` folder yet, so the first one sets the pattern below.

## Steps

1. **Check the backend**: read the endpoint's route and schema in `../backend/src/modules/` so the
   path, the body and the response match. If the endpoint does not exist, stop and say so.
2. **File**: `src/modules/<name>/api/<thing>.ts`, holding the schema, the keys and the hooks for
   one thing.

   ```ts
   // Topics of the signed-in learner.
   import {
     useMutation,
     useQuery,
     useQueryClient,
   } from "@tanstack/react-query";
   import { z } from "zod";
   import { api } from "@/api/api-client";
   import { paginatedListSchema } from "@/api/response-schemas";

   const topicSchema = z.object({ id: z.string(), name: z.string() });
   export type Topic = z.output<typeof topicSchema>;

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

   export function useRenameTopic() {
     const queryClient = useQueryClient();
     return useMutation({
       mutationFn: (input: { id: string; name: string }) =>
         api.patch(`/user/topics/${input.id}`, topicSchema, {
           name: input.name,
         }),
       onSuccess: () =>
         queryClient.invalidateQueries({ queryKey: topicKeys.all }),
     });
   }
   ```

   - Response schemas use `z.object` (tolerant) and list only the fields the screen uses.
   - The query key lists every value the query uses. Pass `signal` so a closed screen cancels.
   - Never send `organizationId`, a user ID or a role to choose whose data comes back.
   - Calls made while signed out pass `{ requiresAuth: false }`.

3. **Use it in a form**: `<Form form={form} onSubmit={async (values) => { await rename.mutateAsync(values); }}>`.
   Field errors from the backend appear under the fields; other errors show a toast.
4. **Mock**: for tests of this hook add handlers with `server.use(...)`; add a default to
   `tests/helpers/mock-server/handlers.ts` only if many tests need it.
5. **Test** (`tests/unit/modules/<name>/api/<thing>.test.tsx`): success, a 4xx with the backend's
   message, field errors on a form, an empty list.

## Checklist before you hand over

- [ ] The path, body and response match the backend
- [ ] Every call has a Zod schema; nothing from the backend is used unchecked
- [ ] No scope ID is sent; no token or personal data is stored or logged
- [ ] After a change that affects other screens, the right query keys are invalidated
- [ ] After a membership change, `refreshAfterMembershipChange()` is called
- [ ] `pnpm check` passes
- [ ] Stop and list what changed; commit only when the user says so
