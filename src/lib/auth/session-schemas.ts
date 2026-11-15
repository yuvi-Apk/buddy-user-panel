// What the backend sends about the signed-in person (the contract in the setup plan, section 13):
//   POST /user/auth/login, POST /user/auth/refresh → { accessToken, user }
//   GET  /user/auth/me                             → user
// Tolerant (z.object): a new field from the backend never breaks the app.
import { z } from "zod";
import { userRoleSchema } from "./roles";

export const sessionOrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
});

export const pendingRequestSchema = z.object({
  id: z.string(),
  organizationName: z.string(),
  status: z.string(),
});

export const sessionUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: userRoleSchema,
  emailVerifiedAt: z.string().nullable(),
  examCategory: z.string().nullable(),
  organization: sessionOrganizationSchema.nullable(),
  pendingRequest: pendingRequestSchema.nullable(),
});

export type SessionUser = z.output<typeof sessionUserSchema>;

export const sessionResponseSchema = z.object({
  accessToken: z.string().min(1),
  user: sessionUserSchema,
});

export type SessionResponse = z.output<typeof sessionResponseSchema>;
