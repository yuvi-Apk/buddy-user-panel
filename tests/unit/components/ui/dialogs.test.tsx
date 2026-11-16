// ResponsiveDialog.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { getLang } from "@/lang";
import {
  Button,
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogTrigger,
} from "@/components/ui";

const { common } = getLang();

function LeaveClassDialog({ description }: { description?: string }) {
  return (
    <ResponsiveDialog>
      <ResponsiveDialogTrigger asChild>
        <Button>Leave class</Button>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent
        title="Leave the class?"
        description={description}
      >
        <p>Your teacher will see that you left.</p>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

describe("ResponsiveDialog", () => {
  it("opens as a dialog named by its title, with focus inside", async () => {
    render(<LeaveClassDialog description="You can join again later." />);
    await userEvent.click(screen.getByRole("button", { name: "Leave class" }));

    const dialog = screen.getByRole("dialog", { name: "Leave the class?" });
    expect(dialog).toHaveAccessibleDescription("You can join again later.");
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it("closes with Escape and with the close button, and gives focus back", async () => {
    render(<LeaveClassDialog />);
    const trigger = screen.getByRole("button", { name: "Leave class" });

    await userEvent.click(trigger);
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();

    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("button", { name: common.close }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("has no description, and no warning, when none is given", async () => {
    const warn = vi.spyOn(console, "warn");
    render(<LeaveClassDialog />);
    await userEvent.click(screen.getByRole("button", { name: "Leave class" }));

    expect(screen.getByRole("dialog")).not.toHaveAttribute("aria-describedby");
    expect(warn).not.toHaveBeenCalled();
  });
});
