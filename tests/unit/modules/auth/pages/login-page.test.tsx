import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getLang } from "@/lang";
import { renderRoute } from "@tests/helpers/render";

const lang = getLang();

const googleLink = () =>
  screen.findByRole("link", { name: lang.auth.continueWithGoogle });

afterEach(() => {
  vi.restoreAllMocks();
});

describe("LoginPage", () => {
  it("offers Google as the only way to log in", async () => {
    renderRoute("/login");

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: lang.auth.loginTitle,
      })
    ).toBeVisible();
    expect(await googleLink()).toHaveAttribute(
      "href",
      "/api/v1/user/auth/google"
    );
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("passes a same-site redirect on to the backend", async () => {
    renderRoute("/login?redirect=%2Fplan%3Fweek%3D2");

    expect(await googleLink()).toHaveAttribute(
      "href",
      "/api/v1/user/auth/google?redirect=%2Fplan%3Fweek%3D2"
    );
  });

  it("drops a redirect to another site", async () => {
    renderRoute("/login?redirect=https%3A%2F%2Fevil.example");

    expect(await googleLink()).toHaveAttribute(
      "href",
      "/api/v1/user/auth/google"
    );
  });

  it("explains calmly when the person closed Google sign-in", async () => {
    renderRoute("/login?error=google-cancelled");

    expect(
      await screen.findByText(lang.auth.googleCancelledTitle)
    ).toBeVisible();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows an error when Google sign-in failed", async () => {
    renderRoute("/login?error=something-else");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      lang.auth.googleFailedTitle
    );
  });

  it("turns the button off while offline", async () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    renderRoute("/login");

    expect(
      await screen.findByRole("button", { name: lang.auth.continueWithGoogle })
    ).toBeDisabled();
    expect(screen.getByText(lang.auth.offlineHint)).toBeVisible();
  });

  it("sends a signed-in person to their home", async () => {
    const { router } = renderRoute("/login", { as: "STUDENT" });

    expect(
      await screen.findByRole("heading", { level: 1, name: lang.nav.today })
    ).toBeVisible();
    expect(router.state.location.pathname).toBe("/today");
  });
});
