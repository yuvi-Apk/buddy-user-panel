// The signed-in person's own details: their name and photo (backend user-auth module).
//
//   PATCH  /user/auth/me          { name }               → the user
//   PUT    /user/auth/me/avatar   multipart, "image"     → the user (JPEG, PNG or WebP, up to 5 MB)
//   DELETE /user/auth/me/avatar                          → the user
//
// The user lives in the session store, not the query cache, so each change is merged into the
// session: the top bar, the sidebar and this screen show it at once.
import { useMutation } from "@tanstack/react-query";
import type { z } from "zod";
import { api } from "@/api/api-client";
import {
  getCurrentSession,
  sessionUserSchema,
  updateSessionUser,
} from "@/auth/session-store";

/** What the backend sends back. The role and Organization are not in it: they are kept. */
const profileUserSchema = sessionUserSchema.pick({
  id: true,
  name: true,
  email: true,
  examCategory: true,
  avatarUrl: true,
});

type ProfileUser = z.output<typeof profileUserSchema>;

export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const MAX_NAME_LENGTH = 80;

/** Uploads can be slow on a phone network. */
const UPLOAD_TIMEOUT_MS = 60_000;

function showUpdatedUser(profile: ProfileUser): void {
  const { user } = getCurrentSession();
  if (user) updateSessionUser({ ...user, ...profile });
}

export function useUpdateName() {
  return useMutation({
    mutationFn: (input: { name: string }) =>
      api.patch("/user/auth/me", profileUserSchema, { name: input.name }),
    onSuccess: showUpdatedUser,
  });
}

export function useUpdatePhoto() {
  return useMutation({
    mutationFn: (file: File) => {
      const body = new FormData();
      body.append("image", file);
      return api.put("/user/auth/me/avatar", profileUserSchema, body, {
        timeoutMs: UPLOAD_TIMEOUT_MS,
      });
    },
    onSuccess: showUpdatedUser,
  });
}

export function useRemovePhoto() {
  return useMutation({
    mutationFn: () => api.delete("/user/auth/me/avatar", profileUserSchema),
    onSuccess: showUpdatedUser,
  });
}
