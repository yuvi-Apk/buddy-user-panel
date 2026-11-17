// DropdownMenu.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";

function AccountMenu({ onSignOut }: { onSignOut: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Account</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem onSelect={onSignOut}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe("DropdownMenu", () => {
  it("opens from the keyboard, moves with the arrows and picks with Enter", async () => {
    const user = userEvent.setup();
    const onSignOut = vi.fn();
    render(<AccountMenu onSignOut={onSignOut} />);

    screen.getByRole("button", { name: "Account" }).focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("menu")).toBeVisible();
    expect(screen.getByRole("menuitem", { name: "Profile" })).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Sign out" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onSignOut).toHaveBeenCalledOnce();
  });

  it("closes with Escape and gives focus back to its button", async () => {
    const user = userEvent.setup();
    render(<AccountMenu onSignOut={vi.fn()} />);
    const trigger = screen.getByRole("button", { name: "Account" });

    await user.click(trigger);
    expect(await screen.findByRole("menu")).toBeVisible();
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
