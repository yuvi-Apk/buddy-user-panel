import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { getLang } from "@/lang";
import { PasswordField } from "./password-field";

const { ui } = getLang();

describe("PasswordField", () => {
  it("hides the password until the person asks to see it", async () => {
    render(<PasswordField label="Password" />);
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");

    await userEvent.click(
      screen.getByRole("button", { name: ui.showPassword })
    );
    expect(input).toHaveAttribute("type", "text");

    await userEvent.click(
      screen.getByRole("button", { name: ui.hidePassword })
    );
    expect(input).toHaveAttribute("type", "password");
  });

  it("works with password managers", () => {
    render(<PasswordField label="Password" />);
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("autocomplete", "current-password");
    expect(input).not.toHaveAttribute("maxlength");
  });

  it('asks for a "new-password" when signing up', () => {
    render(<PasswordField label="New password" autoComplete="new-password" />);
    expect(screen.getByLabelText("New password")).toHaveAttribute(
      "autocomplete",
      "new-password"
    );
  });

  it("disables the show button with the field", () => {
    render(<PasswordField label="Password" disabled />);
    expect(screen.getByLabelText("Password")).toBeDisabled();
    expect(
      screen.getByRole("button", { name: ui.showPassword })
    ).toBeDisabled();
  });
});
