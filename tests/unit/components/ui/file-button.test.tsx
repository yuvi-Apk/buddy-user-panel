// FileButton: a button that opens the file picker and hands back the chosen file.
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FileButton } from "@/components/ui";
import { renderWithProviders } from "@tests/helpers/render";

function getFileInput(): HTMLInputElement {
  const input = document.querySelector<HTMLInputElement>(
    '[data-slot="file-button-input"]'
  );
  if (!input) throw new Error("No file input.");
  return input;
}

describe("FileButton", () => {
  it("is a named button that opens the picker, and hands back the file", async () => {
    const user = userEvent.setup();
    const onFileSelect = vi.fn();
    renderWithProviders(
      <FileButton accept="image/png" onFileSelect={onFileSelect}>
        Change photo
      </FileButton>
    );

    const button = screen.getByRole("button", { name: "Change photo" });
    const input = getFileInput();
    const openPicker = vi.spyOn(input, "click");
    await user.click(button);
    expect(openPicker).toHaveBeenCalled();

    const file = new File(["photo"], "me.png", { type: "image/png" });
    await user.upload(input, file);
    expect(onFileSelect).toHaveBeenCalledWith(file);
    expect(input).toHaveAttribute("accept", "image/png");
    // Cleared, so the same file can be picked again.
    expect(input.value).toBe("");
  });

  it("opens with the keyboard", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <FileButton onFileSelect={vi.fn()}>Change photo</FileButton>
    );
    const openPicker = vi.spyOn(getFileInput(), "click");

    await user.tab();
    expect(screen.getByRole("button", { name: "Change photo" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(openPicker).toHaveBeenCalled();
  });

  it("ignores a file while it is busy", async () => {
    const user = userEvent.setup();
    const onFileSelect = vi.fn();
    renderWithProviders(
      <FileButton loading onFileSelect={onFileSelect}>
        Change photo
      </FileButton>
    );

    await user.upload(
      getFileInput(),
      new File(["photo"], "me.png", { type: "image/png" })
    );
    expect(onFileSelect).not.toHaveBeenCalled();
  });
});
