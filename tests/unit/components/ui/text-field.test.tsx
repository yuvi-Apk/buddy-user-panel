import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { SelectField } from "@/components/ui/select-field";
import { TextArea } from "@/components/ui/text-area";
import {
  CodeField,
  DateField,
  EmailField,
  SearchField,
  TextField,
} from "@/components/ui/text-field";

describe("TextField", () => {
  it("is named by its label, and reads its hint and error with it", () => {
    render(
      <TextField
        label="Name"
        hint="As on your ID card"
        error="Enter your name"
      />
    );
    const input = screen.getByRole("textbox", { name: "Name" });
    expect(input).toHaveAccessibleDescription(
      "As on your ID card Enter your name"
    );
    expect(input).toBeInvalid();
    expect(screen.getByText("Enter your name")).toBeVisible();
  });

  it("is valid and has no description without a hint or an error", () => {
    render(<TextField label="Name" />);
    const input = screen.getByRole("textbox", { name: "Name" });
    expect(input).toBeValid();
    expect(input).not.toHaveAttribute("aria-describedby");
  });

  it("marks a required field, with the star hidden from screen readers", () => {
    render(<TextField label="Name" required />);
    expect(screen.getByRole("textbox", { name: "Name" })).toBeRequired();
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true");
  });

  it("passes the ref and the input props through", async () => {
    const ref = createRef<HTMLInputElement>();
    render(<TextField label="Name" ref={ref} defaultValue="Asha" />);
    expect(ref.current).toHaveValue("Asha");

    await userEvent.type(screen.getByRole("textbox", { name: "Name" }), " R");
    expect(ref.current).toHaveValue("Asha R");
  });

  it("can be disabled", () => {
    render(<TextField label="Name" disabled />);
    expect(screen.getByRole("textbox", { name: "Name" })).toBeDisabled();
  });
});

describe("the special text fields", () => {
  it("EmailField opens the email keyboard and helps password managers", () => {
    render(<EmailField label="Email" />);
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("autocomplete", "email");
    expect(input).toHaveAttribute("autocapitalize", "none");
  });

  it("SearchField is a search box", () => {
    render(<SearchField label="Search topics" />);
    expect(
      screen.getByRole("searchbox", { name: "Search topics" })
    ).toBeInTheDocument();
  });

  it("DateField uses the phone's own date picker", () => {
    render(<DateField label="Exam date" />);
    expect(screen.getByLabelText("Exam date")).toHaveAttribute("type", "date");
  });

  it("CodeField never autocorrects or autocompletes a join code", () => {
    render(<CodeField label="Organization code" />);
    const input = screen.getByRole("textbox", { name: "Organization code" });
    expect(input).toHaveAttribute("autocomplete", "off");
    expect(input).toHaveAttribute("autocapitalize", "characters");
    expect(input).toHaveAttribute("spellcheck", "false");
  });
});

describe("TextArea", () => {
  it("shares the field frame: label, hint and error", () => {
    render(
      <TextArea
        label="Your doubt"
        hint="One question at a time"
        error="Required"
      />
    );
    const textarea = screen.getByRole("textbox", { name: "Your doubt" });
    expect(textarea).toHaveAccessibleDescription(
      "One question at a time Required"
    );
    expect(textarea).toBeInvalid();
  });
});

describe("SelectField", () => {
  const options = [
    { value: "school", label: "School" },
    { value: "college", label: "College" },
  ];

  it("is a labelled native select with a placeholder that can't be picked", async () => {
    render(
      <SelectField
        label="Exam"
        placeholder="Choose your exam"
        options={options}
        defaultValue=""
        hint="You can change it later"
      />
    );
    const select = screen.getByRole("combobox", { name: "Exam" });
    expect(select).toHaveAccessibleDescription("You can change it later");
    expect(
      screen.getByRole("option", { name: "Choose your exam" })
    ).toBeDisabled();

    await userEvent.selectOptions(select, "college");
    expect(select).toHaveValue("college");
  });
});
