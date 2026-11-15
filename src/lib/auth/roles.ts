// The roles of the people who use this app: the backend's `UserRole`, used as it is (no mapping).
// Super Admins never use this app; they have their own admin panel and login.
//
// A role only decides which screens to show. The server decides what is allowed (core-rules #7).
import { z } from "zod";

export const USER_ROLES = [
  "INDIVIDUAL",
  "STUDENT",
  "TEACHER",
  "ORGANIZATION_ADMIN",
] as const;

export const userRoleSchema = z.enum(USER_ROLES);

export type UserRole = z.output<typeof userRoleSchema>;

/** People who study: alone (INDIVIDUAL) or in an Organization (STUDENT). */
export const LEARNER_ROLES = [
  "INDIVIDUAL",
  "STUDENT",
] as const satisfies readonly UserRole[];

/** The staff of an Organization. */
export const STAFF_ROLES = [
  "TEACHER",
  "ORGANIZATION_ADMIN",
] as const satisfies readonly UserRole[];

export function isUserRole(value: unknown): value is UserRole {
  return userRoleSchema.safeParse(value).success;
}
