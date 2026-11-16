// Checkbox, Switch, RadioGroup and SegmentedControl: the controls for picking.
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  Checkbox,
  RadioGroup,
  SegmentedControl,
  Switch,
} from "@/components/ui";

describe("Checkbox", () => {
  it("is named by its label and described by its description", () => {
    render(<Checkbox label="Remember me" description="On this phone only" />);
    expect(
      screen.getByRole("checkbox", { name: "Remember me" })
    ).toHaveAccessibleDescription("On this phone only");
  });

  it("toggles from the box, from its label and with the Space key", async () => {
    render(<Checkbox label="Remember me" />);
    const box = screen.getByRole("checkbox", { name: "Remember me" });
    expect(box).not.toBeChecked();

    await userEvent.click(box);
    expect(box).toBeChecked();

    await userEvent.click(screen.getByText("Remember me"));
    expect(box).not.toBeChecked();

    await userEvent.keyboard(" ");
    expect(box).toBeChecked();
  });

  it("can't be changed when disabled", async () => {
    render(<Checkbox label="Remember me" disabled />);
    const box = screen.getByRole("checkbox", { name: "Remember me" });
    await userEvent.click(box);
    expect(box).not.toBeChecked();
  });
});

describe("Checkbox mark", () => {
  it("stays in place and changes state, so it can fade in and out", async () => {
    const { container } = render(<Checkbox label="Remember me" />);
    const mark = () => container.querySelector("button [data-state]");
    expect(mark()).toHaveAttribute("data-state", "unchecked");

    await userEvent.click(
      screen.getByRole("checkbox", { name: "Remember me" })
    );
    expect(mark()).toHaveAttribute("data-state", "checked");
  });
});

describe("Switch", () => {
  it("turns on and off, by click and with the Space key", async () => {
    const onCheckedChange = vi.fn();
    render(
      <Switch
        label="Daily reminder"
        description="At 7 pm"
        onCheckedChange={onCheckedChange}
      />
    );
    const toggle = screen.getByRole("switch", { name: "Daily reminder" });
    expect(toggle).toHaveAccessibleDescription("At 7 pm");

    await userEvent.click(toggle);
    expect(toggle).toBeChecked();
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);

    await userEvent.keyboard(" ");
    expect(toggle).not.toBeChecked();
  });
});

describe("RadioGroup", () => {
  const options = [
    { value: "school", label: "School" },
    { value: "college", label: "College" },
    { value: "job", label: "Government job", disabled: true },
  ];

  it("is one group named by its label, with its hint and error", () => {
    render(
      <RadioGroup
        label="Where do you study?"
        hint="Pick one"
        error="Choose where you study"
        options={options}
      />
    );
    const group = screen.getByRole("radiogroup", {
      name: "Where do you study?",
    });
    expect(group).toHaveAccessibleDescription(
      "Pick one Choose where you study"
    );
    expect(group).toHaveAttribute("aria-invalid", "true");
  });

  it("picks with a click and moves with the arrow keys", async () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup
        label="Where do you study?"
        options={options}
        onValueChange={onValueChange}
      />
    );
    await userEvent.click(screen.getByRole("radio", { name: "School" }));
    expect(screen.getByRole("radio", { name: "School" })).toBeChecked();

    await userEvent.keyboard("{ArrowDown>}");
    await waitFor(() =>
      expect(screen.getByRole("radio", { name: "College" })).toBeChecked()
    );
    await userEvent.keyboard("{/ArrowDown}");
    expect(onValueChange).toHaveBeenLastCalledWith("college");
  });

  it("never picks a disabled option", async () => {
    render(<RadioGroup label="Where do you study?" options={options} />);
    const disabled = screen.getByRole("radio", { name: "Government job" });
    expect(disabled).toBeDisabled();
    await userEvent.click(disabled);
    expect(disabled).not.toBeChecked();
  });
});

describe("SegmentedControl", () => {
  function ModePicker() {
    const [value, setValue] = useState("light");
    return (
      <SegmentedControl
        label="Mode"
        value={value}
        onValueChange={setValue}
        options={[
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
          { value: "system", label: "System" },
        ]}
      />
    );
  }

  it("picks exactly one option, by click or with the arrow keys", async () => {
    render(<ModePicker />);
    expect(
      screen.getByRole("radiogroup", { name: "Mode" })
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Light" })).toBeChecked();

    await userEvent.click(screen.getByRole("radio", { name: "System" }));
    expect(screen.getByRole("radio", { name: "System" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Light" })).not.toBeChecked();

    await userEvent.keyboard("{ArrowLeft>}");
    await waitFor(() =>
      expect(screen.getByRole("radio", { name: "Dark" })).toBeChecked()
    );
    await userEvent.keyboard("{/ArrowLeft}");
  });

  it("has one highlight, hidden only when no option matches the value", () => {
    const options = [
      { value: "light", label: "Light" },
      { value: "dark", label: "Dark" },
    ];
    const highlight = (container: HTMLElement) =>
      container.querySelector('[data-slot="segmented-control-highlight"]');

    const { container, rerender } = render(
      <SegmentedControl
        label="Mode"
        value="dark"
        onValueChange={vi.fn()}
        options={options}
      />
    );
    expect(highlight(container)).not.toHaveClass("opacity-0");

    rerender(
      <SegmentedControl
        label="Mode"
        value="sepia"
        onValueChange={vi.fn()}
        options={options}
      />
    );
    expect(highlight(container)).toHaveClass("opacity-0");
  });
});
