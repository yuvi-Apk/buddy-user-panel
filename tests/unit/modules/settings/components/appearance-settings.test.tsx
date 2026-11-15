import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { getLang } from "@/lang";
import { setAccent, setMode } from "@/theme/theme-store";
import { AppearanceSettings } from "@/modules/settings/components/appearance-settings";

const { theme } = getLang();
const root = document.documentElement;

afterEach(() => {
  setMode("system");
  setAccent("indigo-ink");
});

describe("AppearanceSettings", () => {
  it("shows the modes and the 4 themes, with the current ones picked", () => {
    render(<AppearanceSettings />);

    const modes = screen.getByRole("radiogroup", { name: theme.modeLabel });
    expect(
      within(modes).getByRole("radio", { name: theme.modes.system })
    ).toBeChecked();

    const themes = screen.getByRole("radiogroup", { name: theme.accentLabel });
    expect(within(themes).getAllByRole("radio")).toHaveLength(4);
    expect(
      within(themes).getByRole("radio", {
        name: new RegExp(theme.accents.indigoInk.name),
      })
    ).toBeChecked();
  });

  it("switches the whole page to the picked mode and theme", async () => {
    render(<AppearanceSettings />);

    await userEvent.click(
      screen.getByRole("radio", { name: theme.modes.dark })
    );
    expect(root.dataset.mode).toBe("dark");
    expect(screen.getByRole("radio", { name: theme.modes.dark })).toBeChecked();

    const lagoon = screen.getByRole("radio", {
      name: new RegExp(theme.accents.lagoon.name),
    });
    await userEvent.click(lagoon);
    expect(root.dataset.accent).toBe("lagoon");
    expect(lagoon).toBeChecked();
  });
});
