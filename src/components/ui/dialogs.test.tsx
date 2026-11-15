// ResponsiveDialog and ConfirmDialog.
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { getLang } from "@/lang";
import { Button } from "./button";
import { ConfirmDialog } from "./confirm-dialog";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogTrigger,
} from "./responsive-dialog";

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

function RemoveStudentDialog({
  onConfirm,
}: {
  onConfirm: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(true);
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      tone="destructive"
      title="Remove Asha from the class?"
      description="She can be added again later."
      confirmLabel="Remove"
      onConfirm={onConfirm}
    />
  );
}

describe("ConfirmDialog", () => {
  it("starts on Cancel, so an accidental Enter never confirms", async () => {
    const onConfirm = vi.fn();
    render(<RemoveStudentDialog onConfirm={onConfirm} />);

    const dialog = screen.getByRole("alertdialog", {
      name: "Remove Asha from the class?",
    });
    expect(dialog).toHaveAccessibleDescription("She can be added again later.");
    expect(screen.getByRole("button", { name: common.cancel })).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("is busy while onConfirm runs, then closes", async () => {
    let finish = () => {};
    const removing = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const onConfirm = vi.fn(() => removing);
    render(<RemoveStudentDialog onConfirm={onConfirm} />);

    const remove = screen.getByRole("button", { name: "Remove" });
    await userEvent.click(remove);
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(remove).toHaveAttribute("aria-busy", "true");

    await userEvent.click(remove);
    expect(onConfirm).toHaveBeenCalledOnce();

    await act(async () => {
      finish();
      await removing;
    });
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("stays open when onConfirm fails, so the person can try again", async () => {
    const onConfirm = vi.fn(() => Promise.reject(new Error("No internet")));
    render(<RemoveStudentDialog onConfirm={onConfirm} />);

    await userEvent.click(screen.getByRole("button", { name: "Remove" }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Remove" })
      ).not.toHaveAttribute("aria-busy")
    );
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });
});
