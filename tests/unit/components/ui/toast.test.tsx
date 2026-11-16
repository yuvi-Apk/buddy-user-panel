import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { getLang } from "@/lang";
import {
  Toaster,
  closeToast,
  getToasts,
  removeClosedToast,
  toast,
} from "@/components/ui";

const { ui } = getLang();

afterEach(() => {
  for (const item of getToasts()) removeClosedToast(item.id);
});

describe("the toast store", () => {
  it("keeps at most 3 toasts, dropping the oldest", () => {
    for (const n of [1, 2, 3, 4]) toast({ title: `Toast ${n}` });
    expect(getToasts().map((item) => item.title)).toEqual([
      "Toast 2",
      "Toast 3",
      "Toast 4",
    ]);
  });

  it("closes a toast first, then removes it", () => {
    const id = toast({ title: "Saved" });
    closeToast(id);
    expect(getToasts()).toEqual([expect.objectContaining({ id, open: false })]);

    removeClosedToast(id);
    expect(getToasts()).toEqual([]);
  });
});

describe("Toaster", () => {
  it("shows toasts in the notifications region, and the person can dismiss them", async () => {
    render(<Toaster />);
    act(() => {
      toast({
        title: "Saved",
        description: "Your plan is up to date.",
        variant: "success",
      });
    });

    // Radix puts the keyboard shortcut where `{hotkey}` is.
    const region = screen.getByRole("region", {
      name: ui.notifications.replace("{hotkey}", "F8"),
    });
    expect(within(region).getByText("Saved")).toBeInTheDocument();
    expect(
      within(region).getByText("Your plan is up to date.")
    ).toBeInTheDocument();

    await userEvent.click(
      within(region).getByRole("button", { name: ui.dismissNotification })
    );
    await waitFor(() => expect(within(region).queryByText("Saved")).toBeNull());
  });
});
