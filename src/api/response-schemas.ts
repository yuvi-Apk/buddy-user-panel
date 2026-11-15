// The backend's response shapes (backend/src/utils/ApiResponse.ts, errorHandler.ts, pagination.ts).
//
//   success  { statusCode, data, message, success: true }
//   error    { success: false, message, errors: [{ field, message }] | null, data: null }
//   a page   data = { items: [...], meta: { page, limit, total, totalPages } }
//
// Tolerant on purpose (z.object): a new field from the backend never breaks the app.
import { z } from "zod";

export const successResponseSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
  message: z.string().optional(),
  statusCode: z.number().optional(),
});

export const errorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  errors: z
    .array(z.object({ field: z.string(), message: z.string() }))
    .nullish(),
});

/** The largest page the backend gives (backend pagination.ts). */
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;

export const paginationMetaSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});

export type PaginationMeta = z.output<typeof paginationMetaSchema>;

/** The schema of one page of a list: paginatedListSchema(topicSchema). */
export function paginatedListSchema<Item extends z.ZodType>(item: Item) {
  return z.object({ items: z.array(item), meta: paginationMetaSchema });
}

/** { email: "…" } from the backend's [{ field: "email", message: "…" }]. The first message wins. */
export function toFieldErrorMap(
  errors: ReadonlyArray<{ field: string; message: string }> | null | undefined
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const { field, message } of errors ?? []) {
    if (field && !(field in result)) result[field] = message;
  }
  return result;
}
