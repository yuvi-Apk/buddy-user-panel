// The top bar's parts: the light / dark switch and the avatar menu. On the real shell, so the
// menu's links and Sign out are tested with the router and the session.
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { getCurrentSession } from "@/auth/session-store";
import { ThemeToggle } from "@/components/layout";
import { getLang } from "@/lang";
import { getTheme } from "@/theme";
import { renderRoute, renderWithProviders } from "@tests/helpers/render";

const lang = getLang();

async function openAccountMenu() {
  const user = userEvent.setup();
  await user.click(
    await screen.findByRole("button", { name: lang.nav.accountMenu })
  );
  return { user, menu: within(await screen.findByRole("menu")) };
}

describe("ThemeToggle", () => {
  it("flips between light and dark, and says what it will do next", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ThemeToggle />);
    const startedDark = getTheme().resolvedMode === "dark";
    const next = startedDark ? "light" : "dark";

    await user.click(
      screen.getByRole("button", {
        name: startedDark ? lang.theme.switchToLight : lang.theme.switchToDark,
      })
    );

    expect(document.documentElement.dataset.mode).toBe(next);
    expect(getTheme().mode).toBe(next);
    expect(
      screen.getByRole("button", {
        name: startedDark ? lang.theme.switchToDark : lang.theme.switchToLight,
      })
    ).toBeVisible();
  });
});

describe("AccountMenu", () => {
  it("shows who is signed in and opens Settings", async () => {
    const { router } = renderRoute("/today", {
      as: "STUDENT",
      user: { name: "Asha Rao" },
    });
    await screen.findByRole("heading", { level: 1, name: lang.nav.today });

    const { user, menu } = await openAccountMenu();
    expect(await screen.findByRole("menu")).toHaveTextContent("Asha Rao");
    await user.click(menu.getByRole("menuitem", { name: lang.nav.settings }));

    await screen.findByRole("heading", { level: 1, name: lang.nav.settings });
    expect(router.state.location.pathname).toBe("/settings");
  });

  it("signs out and lands on login", async () => {
    const { router } = renderRoute("/today", { as: "INDIVIDUAL" });
    await screen.findByRole("heading", { level: 1, name: lang.nav.today });

    const { user, menu } = await openAccountMenu();
    await user.click(menu.getByRole("menuitem", { name: lang.nav.signOut }));

    await screen.findByRole("heading", {
      level: 1,
      name: lang.auth.loginTitle,
    });
    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/login");
    });
    expect(getCurrentSession().status).toBe("signed-out");
  });

  it("is on the calm pages too: login has the light / dark switch", async () => {
    renderRoute("/login");
    await screen.findByRole("heading", {
      level: 1,
      name: lang.auth.loginTitle,
    });

    expect(
      screen.getByRole("button", {
        name: new RegExp(
          `${lang.theme.switchToDark}|${lang.theme.switchToLight}`
        ),
      })
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: lang.nav.accountMenu })
    ).not.toBeInTheDocument();
  });
});
