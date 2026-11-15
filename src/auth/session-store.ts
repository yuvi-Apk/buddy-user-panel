// Who is signed in, kept in memory only. Nothing here is ever written to browser storage: a
// reload restores the session with one silent refresh (session.ts).
//
//   const role = useSession((session) => session.user?.role);   in a component
//   getAccessToken()                                             in the API client
//
// status: "restoring" while the app starts and asks the server, then "signed-in" or "signed-out".
// Route loaders wait for it with waitForSession().
//
// The schemas describe what the backend sends about the signed-in person:
//   POST /user/auth/login, POST /user/auth/refresh → { accessToken, user }
//   GET  /user/auth/me                             → user
import { z } from "zod";
import { createStore, useStore } from "zustand";
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

export type SessionStatus = "restoring" | "signed-in" | "signed-out";

export interface SessionState {
  status: SessionStatus;
  user: SessionUser | null;
  accessToken: string | null;
}

const RESTORING: SessionState = {
  status: "restoring",
  user: null,
  accessToken: null,
};
const SIGNED_OUT: SessionState = {
  status: "signed-out",
  user: null,
  accessToken: null,
};

export const sessionStore = createStore<SessionState>()(() => RESTORING);

export function useSession<T>(selector: (session: SessionState) => T): T {
  return useStore(sessionStore, selector);
}

export function getSession(): SessionState {
  return sessionStore.getState();
}

export function getAccessToken(): string | null {
  return sessionStore.getState().accessToken;
}

export function setSession(accessToken: string, user: SessionUser): void {
  sessionStore.setState({ status: "signed-in", accessToken, user }, true);
}

/** Forgets the person in this tab. Use signOut() (sign-out.ts) to end the session everywhere. */
export function clearSession(): void {
  sessionStore.setState(SIGNED_OUT, true);
}

/** Back to the state at app start. For tests. */
export function resetSession(): void {
  sessionStore.setState(RESTORING, true);
}

/** Resolves once the session is known (not "restoring" any more). */
export function waitForSession(): Promise<SessionState> {
  const current = sessionStore.getState();
  if (current.status !== "restoring") return Promise.resolve(current);

  return new Promise((resolve) => {
    const unsubscribe = sessionStore.subscribe((state) => {
      if (state.status === "restoring") return;
      unsubscribe();
      resolve(state);
    });
  });
}
