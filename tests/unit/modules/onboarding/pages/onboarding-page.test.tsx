import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { getLang } from "@/lang";
import { renderRoute } from "@tests/helpers/render";

const lang = getLang();

const choice = (title: string) =>
  screen.findByRole("radio", { name: new RegExp(title) });

describe("OnboardingPage", () => {
  it("starts on 'On my own' and opens the learner's home", async () => {
    const user = userEvent.setup();
    const { router } = renderRoute("/onboarding", { as: "INDIVIDUAL" });

    expect(await choice(lang.onboarding.onMyOwnTitle)).toBeChecked();
    await user.click(
      screen.getByRole("button", { name: lang.onboarding.continue })
    );
    await screen.findByRole("heading", { level: 1, name: lang.nav.today });
    expect(router.state.location.pathname).toBe("/today");
  });

  it("sends someone studying with their school or coaching to join", async () => {
    const user = userEvent.setup();
    const { router } = renderRoute("/onboarding", { as: "INDIVIDUAL" });

    await user.click(await choice(lang.onboarding.withOrganizationTitle));
    await user.click(
      screen.getByRole("button", { name: lang.onboarding.continue })
    );
    await screen.findByRole("heading", { level: 1, name: lang.nav.join });
    expect(router.state.location.pathname).toBe("/join");
  });

  it("sends a signed-out person to log in", async () => {
    const { router } = renderRoute("/onboarding");

    await screen.findByRole("heading", {
      level: 1,
      name: lang.auth.loginTitle,
    });
    expect(router.state.location.pathname).toBe("/login");
  });
});
