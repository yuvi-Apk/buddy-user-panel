import { screen } from "@testing-library/react";
import { http } from "msw";
import { describe, expect, it } from "vitest";
import { getCurrentSession } from "@/auth/session-store";
import { getLang } from "@/lang";
import { createGoogleSignInRequest } from "@/modules/auth/google-sign-in";
import {
  apiPath,
  errorResponse,
  makeUser,
  successResponse,
} from "@tests/helpers/mock-server/backend";
import { server } from "@tests/helpers/mock-server/server";
import { renderRoute } from "@tests/helpers/render";

const lang = getLang();

/** Starts a sign-in and returns the callback URL Google would send the person to. */
function googleCallbackUrl(redirect: string | null = null): string {
  const request = createGoogleSignInRequest(redirect, "client-1");
  request.remember();
  const params = new URL(request.url).searchParams;
  const payload = btoa(JSON.stringify({ nonce: params.get("nonce") }));
  const state = params.get("state") ?? "";
  return `/auth/google/callback#id_token=h.${payload}.s&state=${state}`;
}

function answerSignIn(user = makeUser()) {
  let sentBody: unknown = null;
  server.use(
    http.post(apiPath("/user/auth/google"), async ({ request }) => {
      sentBody = await request.json();
      return successResponse({ accessToken: "token-1", user });
    })
  );
  return () => sentBody;
}

describe("GoogleCallbackPage", () => {
  it("sends the ID token, signs in and opens the redirect", async () => {
    const sentBody = answerSignIn(makeUser({ examCategory: "SCHOOL" }));
    const { router } = renderRoute(googleCallbackUrl("/topics"));

    // Sign-in, then the topics page loads its code: slower than one second on a busy run.
    await screen.findByRole(
      "heading",
      { level: 1, name: lang.nav.topics },
      { timeout: 3000 }
    );
    expect(router.state.location.pathname).toBe("/topics");
    expect(router.state.location.hash).toBe("");
    expect(Object.keys(sentBody() ?? {})).toEqual(["idToken"]);
    expect(getCurrentSession().accessToken).toBe("token-1");
  });

  it("sends someone new to set up their studies", async () => {
    answerSignIn(makeUser({ examCategory: null }));
    const { router } = renderRoute(googleCallbackUrl("/topics"));

    await screen.findByRole("heading", {
      level: 1,
      name: lang.onboarding.title,
    });
    expect(router.state.location.pathname).toBe("/onboarding");
  });

  it("goes back to login when the answer was not asked for here", async () => {
    const { router } = renderRoute(
      "/auth/google/callback#id_token=h.e30.s&state=forged"
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      lang.auth.googleFailedTitle
    );
    expect(router.state.location.pathname).toBe("/login");
    expect(getCurrentSession().status).toBe("signed-out");
  });

  it("goes back to login calmly when Google's page was closed", async () => {
    createGoogleSignInRequest(null, "client-1").remember();
    const { router } = renderRoute("/auth/google/callback#error=access_denied");

    expect(
      await screen.findByText(lang.auth.googleCancelledTitle)
    ).toBeVisible();
    expect(router.state.location.search).toBe("?error=google-cancelled");
  });

  it("shows the backend's message when it refuses", async () => {
    server.use(
      http.post(apiPath("/user/auth/google"), () =>
        errorResponse(401, "Google sign-in failed")
      )
    );
    renderRoute(googleCallbackUrl());

    expect(await screen.findByText("Google sign-in failed")).toBeVisible();
    expect(
      screen.getByRole("button", { name: lang.common.tryAgain })
    ).toBeVisible();
    expect(getCurrentSession().status).toBe("signed-out");
  });
});
