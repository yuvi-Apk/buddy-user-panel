import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http } from "msw";
import { describe, expect, it } from "vitest";
import { getCurrentSession } from "@/auth/session-store";
import { getLang } from "@/lang";
import {
  apiPath,
  errorResponse,
  successResponse,
} from "@tests/helpers/mock-server/backend";
import { server } from "@tests/helpers/mock-server/server";
import { renderRoute } from "@tests/helpers/render";

const lang = getLang();

async function confirmSignOutEverywhere() {
  const user = userEvent.setup();
  await user.click(
    await screen.findByRole("button", { name: lang.account.signOutEverywhere })
  );
  const dialog = await screen.findByRole("dialog");
  await user.click(
    within(dialog).getByRole("button", {
      name: lang.account.signOutEverywhereConfirm,
    })
  );
}

describe("AccountSettings", () => {
  it("signs out of every device after a confirmation", async () => {
    server.use(
      http.post(apiPath("/user/auth/logout-all"), () => successResponse(null))
    );
    const { router } = renderRoute("/settings", { as: "STUDENT" });

    await confirmSignOutEverywhere();
    await screen.findByRole("heading", {
      level: 1,
      name: lang.auth.loginTitle,
    });
    expect(router.state.location.pathname).toBe("/login");
    expect(getCurrentSession().status).toBe("signed-out");
  });

  it("stays signed in and says so when the server can't be reached", async () => {
    server.use(
      http.post(apiPath("/user/auth/logout-all"), () =>
        errorResponse(503, "Down")
      )
    );
    renderRoute("/settings", { as: "STUDENT" });

    await confirmSignOutEverywhere();
    expect(await screen.findByText(lang.errors.server)).toBeVisible();
    expect(getCurrentSession().status).toBe("signed-in");
  });
});
