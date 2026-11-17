// Who is signed in, kept in memory only. Nothing here is ever written to browser storage: a
// reload restores the session with one silent refresh (session.ts).
//
//   const role = useSession((session) => session.user?.role);   in a component
//   getAccessToken()                                             in the API client
//
// status: "restoring" while the app starts and asks the server, then "signed-in" or "signed-out".
// Route loaders wait for it with waitUntilSessionIsKnown().
//
// The schemas describe what the backend sends about the signed-in person
// (backend/src/modules/user-auth):
//   POST /user/auth/google, POST /user/auth/refresh → { accessToken, user }
//   GET  /user/auth/me                              → user
// The refresh token never comes in a body: it is the httpOnly userRefreshToken cookie.
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

/**
 * The backend sends no role, Organization or pending request yet: until it does, everyone is
 * INDIVIDUAL with none (a join request stays pending until approved, core-rules #11). When the
 * backend adds these fields they are used as they come, with no change here.
 */
export const sessionUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: userRoleSchema.default("INDIVIDUAL"),
  /** null until the person has set up their studies (onboarding). */
  examCategory: z.string().nullable(),
  /** "/images/profile/…" once they upload a photo; Google's photo URL before that (not shown). */
  avatarUrl: z.string().nullable().default(null),
  organization: sessionOrganizationSchema.nullable().default(null),
  pendingRequest: pendingRequestSchema.nullable().default(null),
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

export function getCurrentSession(): SessionState {
  return sessionStore.getState();
}

export function getAccessToken(): string | null {
  return sessionStore.getState().accessToken;
}

export function markSignedIn(accessToken: string, user: SessionUser): void {
  sessionStore.setState({ status: "signed-in", accessToken, user }, true);
}

/** The person changed their own details (name, photo): show them everywhere at once. */
export function updateSessionUser(user: SessionUser): void {
  const session = sessionStore.getState();
  if (session.status !== "signed-in") return;
  sessionStore.setState({ ...session, user }, true);
}

/** Forgets the person in this tab. Use signOut() (session.ts) to end the session everywhere. */
export function markSignedOut(): void {
  sessionStore.setState(SIGNED_OUT, true);
}

/** Back to the state at app start. For tests. */
export function resetSessionForTests(): void {
  sessionStore.setState(RESTORING, true);
}

/** Resolves once the session is known (not "restoring" any more). */
export function waitUntilSessionIsKnown(): Promise<SessionState> {
  const session = sessionStore.getState();
  if (session.status !== "restoring") return Promise.resolve(session);

  return new Promise((resolve) => {
    const unsubscribe = sessionStore.subscribe((state) => {
      if (state.status === "restoring") return;
      unsubscribe();
      resolve(state);
    });
  });
}
