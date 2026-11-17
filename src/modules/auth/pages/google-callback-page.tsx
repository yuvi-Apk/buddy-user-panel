// Where Google sends the person back after sign-in (#id_token=…&state=…). How the whole flow
// works: ../google-sign-in.ts.
//
// The token is read once and removed from the address bar at once. Then the backend is asked to
// sign in. Someone signing in for the first time (no studies set up yet) goes to /onboarding;
// everyone else to `redirect`, or their home.
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { getErrorMessage, isApiError } from "@/api/api-error";
import type { SessionUser } from "@/auth/session-store";
import { Page } from "@/components/layout";
import { ErrorState } from "@/components/states";
import { Spinner } from "@/components/ui";
import { getHomePathForRole, LOGIN_PATH } from "@/config/navigation";
import { useLang } from "@/lang";
import { getSafeRedirectPath } from "@/utils/safe-redirect";
import { useGoogleSignIn } from "../api/google-sign-in";
import { readGoogleSignInResponse } from "../google-sign-in";

const ONBOARDING_PATH = "/onboarding";

function getPathAfterSignIn(user: SessionUser, redirect: string | null) {
  if (user.role === "INDIVIDUAL" && user.examCategory === null)
    return ONBOARDING_PATH;
  return getSafeRedirectPath(redirect, getHomePathForRole(user.role));
}

export function GoogleCallbackPage() {
  const lang = useLang();
  const location = useLocation();
  const navigate = useNavigate();
  const signInWithGoogle = useGoogleSignIn();
  const { mutate } = signInWithGoogle;
  // React may run the effect twice in development; Google's answer must be used only once.
  const hasReadResponse = useRef(false);

  useEffect(() => {
    if (hasReadResponse.current) return;
    hasReadResponse.current = true;

    const response = readGoogleSignInResponse(location.hash);
    // The ID token must not stay in the address bar or the history.
    void navigate({ pathname: location.pathname }, { replace: true });

    if ("error" in response) {
      void navigate(`${LOGIN_PATH}?error=${response.error}`, { replace: true });
      return;
    }
    mutate(response.idToken, {
      onSuccess: (session) => {
        void navigate(getPathAfterSignIn(session.user, response.redirect), {
          replace: true,
        });
      },
    });
  }, [location.hash, location.pathname, mutate, navigate]);

  if (signInWithGoogle.isError) {
    const error = signInWithGoogle.error;
    return (
      <Page width="reading">
        <ErrorState
          title={lang.auth.googleFailedTitle}
          description={getErrorMessage(error)}
          reference={isApiError(error) ? error.requestId : undefined}
          onRetry={() => {
            void navigate(LOGIN_PATH, { replace: true });
          }}
        />
      </Page>
    );
  }

  return (
    <Page width="reading">
      <div
        role="status"
        className="flex flex-col items-center gap-3 py-16 text-center"
      >
        <Spinner className="size-8 text-primary" />
        <p className="font-display text-xl font-semibold">
          {lang.auth.signingIn}
        </p>
      </div>
    </Page>
  );
}
