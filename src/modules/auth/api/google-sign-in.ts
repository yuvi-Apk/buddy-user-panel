// Sends Google's ID token to the backend and starts the session with its answer.
//
//   const signInWithGoogle = useGoogleSignIn();
//   signInWithGoogle.mutate(idToken, { onSuccess: (session) => … });
//
// The backend sets the refresh cookie; the access token stays in memory (src/auth).
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/api/api-client";
import { signIn } from "@/auth/session";
import { AUTH_API_PATHS } from "@/auth/session-refresh";
import { sessionResponseSchema } from "@/auth/session-store";

const googleSignInBodySchema = z.object({ idToken: z.string().min(1) });

export function useGoogleSignIn() {
  return useMutation({
    mutationFn: (idToken: string) =>
      api.post(
        AUTH_API_PATHS.googleSignIn,
        sessionResponseSchema,
        googleSignInBodySchema.parse({ idToken }),
        { requiresAuth: false }
      ),
    onSuccess: (session) => {
      signIn(session);
    },
    // The callback page shows the error itself.
    meta: { toast: false },
  });
}
