import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { getLang } from "@/lang";
import { getRedirectPathIfBlocked } from "@/routing/route-access";
import type { SessionState } from "@/auth/session-store";
import { makeUser } from "@tests/helpers/mock-server/backend";
import { renderRoute } from "@tests/helpers/render";

const lang = getLang();

const signedOut: SessionState = {
  status: "signed-out",
  user: null,
  accessToken: null,
};
const signedInAs = (
  role: NonNullable<SessionState["user"]>["role"]
): SessionState => ({
  status: "signed-in",
  user: makeUser({ role }),
  accessToken: "t",
});
const at = (path: string) => new URL(path, "http://localhost");

describe("getRedirectPathIfBlocked", () => {
  it("sends signed-out people to login, remembering where they were", () => {
    expect(
      getRedirectPathIfBlocked(["STUDENT"], signedOut, at("/plan?week=2"))
    ).toBe("/login?redirect=%2Fplan%3Fweek%3D2");
  });

  it("sends a role that may not open the page to its own home", () => {
    expect(
      getRedirectPathIfBlocked(
        ["ORGANIZATION_ADMIN"],
        signedInAs("TEACHER"),
        at("/x")
      )
    ).toBe("/organization/dashboard");
    expect(
      getRedirectPathIfBlocked(["TEACHER"], signedInAs("STUDENT"), at("/x"))
    ).toBe("/today");
  });

  it("lets the right role in", () => {
    expect(
      getRedirectPathIfBlocked(["STUDENT"], signedInAs("STUDENT"), at("/today"))
    ).toBeNull();
  });

  it("sends signed-in people away from guest pages, to a safe redirect or home", () => {
    expect(
      getRedirectPathIfBlocked(
        "guest",
        signedInAs("STUDENT"),
        at("/login?redirect=/plan")
      )
    ).toBe("/plan");
    expect(
      getRedirectPathIfBlocked(
        "guest",
        signedInAs("STUDENT"),
        at("/login?redirect=https://evil.example")
      )
    ).toBe("/today");
    expect(
      getRedirectPathIfBlocked("guest", signedOut, at("/login"))
    ).toBeNull();
  });

  it("lets anyone open public pages", () => {
    expect(
      getRedirectPathIfBlocked("public", signedOut, at("/verify-email"))
    ).toBeNull();
  });
});

describe("the route tree", () => {
  it("sends a signed-out person from a page to login", async () => {
    const { router } = renderRoute("/plan");
    expect(
      await screen.findByRole("heading", { level: 1, name: lang.pages.login })
    ).toBeVisible();
    expect(router.state.location.search).toBe("?redirect=%2Fplan");
  });

  it("sends / to the role's home", async () => {
    renderRoute("/", { as: "TEACHER" });
    expect(
      await screen.findByRole("heading", { level: 1, name: lang.nav.dashboard })
    ).toBeVisible();
  });

  it("sends a student away from an admin page", async () => {
    const { router } = renderRoute("/organization/members", { as: "STUDENT" });
    expect(
      await screen.findByRole("heading", { level: 1, name: lang.nav.today })
    ).toBeVisible();
    expect(router.state.location.pathname).toBe("/today");
  });

  it("shows the role's tabs, and More with the rest", async () => {
    const user = userEvent.setup();
    renderRoute("/organization/dashboard", { as: "ORGANIZATION_ADMIN" });
    await screen.findByRole("heading", { level: 1, name: lang.nav.dashboard });

    // Phones: the bottom bar. (The sidebar is hidden by CSS under lg, which jsdom doesn't apply,
    // so look inside the bar itself.)
    const bars = screen.getAllByRole("navigation", { name: lang.nav.main });
    const bottomBar = bars[bars.length - 1];
    if (!bottomBar) throw new Error("No bottom bar.");
    const bar = within(bottomBar);
    expect(bar.getByRole("link", { name: lang.nav.dashboard })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(bar.getByRole("link", { name: lang.nav.requests })).toBeVisible();

    await user.click(bar.getByRole("button", { name: lang.nav.more }));
    const sheet = await screen.findByRole("dialog", { name: lang.nav.more });
    expect(
      within(sheet).getByRole("link", { name: lang.nav.invites })
    ).toBeVisible();
    expect(
      within(sheet).getByRole("button", { name: lang.nav.signOut })
    ).toBeVisible();
  });

  it("signs out from the shell and lands on login", async () => {
    const user = userEvent.setup();
    const { router } = renderRoute("/today", { as: "INDIVIDUAL" });
    await screen.findByRole("heading", { level: 1, name: lang.nav.today });

    const [signOut] = screen.getAllByRole("button", { name: lang.nav.signOut });
    if (!signOut) throw new Error("No sign-out button.");
    await user.click(signOut);

    expect(
      await screen.findByRole("heading", { level: 1, name: lang.pages.login })
    ).toBeVisible();
    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/login");
    });
  });

  it("shows the 404 page for an unknown address", async () => {
    renderRoute("/no-such-page");
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: lang.pages.notFound,
      })
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: lang.common.goHome })
    ).toHaveAttribute("href", "/");
  });

  it("opens the real Settings page", async () => {
    renderRoute("/settings", { as: "TEACHER" });
    expect(
      await screen.findByRole("heading", { level: 1, name: lang.nav.settings })
    ).toBeVisible();
    expect(
      screen.getByRole("radiogroup", { name: lang.theme.modeLabel })
    ).toBeVisible();
  });

  it("sets the browser tab title", async () => {
    renderRoute("/topics", { as: "STUDENT" });
    await screen.findByRole("heading", { level: 1, name: lang.nav.topics });
    await waitFor(() => {
      expect(document.title).toBe(
        `${lang.nav.topics} · ${lang.common.appName}`
      );
    });
  });
});
