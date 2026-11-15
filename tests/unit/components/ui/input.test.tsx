import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Input, SelectField, TextArea } from "@/components/ui";
import { getLang } from "@/lang";

const { ui } = getLang();

describe("Input", () => {
  it("is named by its label, and reads its hint and error with it", () => {
    render(
      <Input label="Name" hint="As on your ID card" error="Enter your name" />
    );
    const input = screen.getByRole("textbox", { name: "Name" });
    expect(input).toHaveAccessibleDescription(
      "As on your ID card Enter your name"
    );
    expect(input).toBeInvalid();
    expect(screen.getByText("Enter your name")).toBeVisible();
  });

  it("is valid and has no description without a hint or an error", () => {
    render(<Input label="Name" />);
    const input = screen.getByRole("textbox", { name: "Name" });
    expect(input).toHaveAttribute("type", "text");
    expect(input).toBeValid();
    expect(input).not.toHaveAttribute("aria-describedby");
  });

  it("isRequired marks the field, with the star hidden from screen readers", () => {
    render(<Input label="Name" isRequired />);
    expect(screen.getByRole("textbox", { name: "Name" })).toBeRequired();
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true");
  });

  it("shows no star without isRequired", () => {
    render(<Input label="Name" />);
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  it("always has a placeholder, so the label knows when the input is empty", () => {
    render(<Input label="Name" />);
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveAttribute(
      "placeholder",
      " "
    );
  });

  it("passes the ref and the input props through", async () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input label="Name" ref={ref} defaultValue="Asha" />);
    expect(ref.current).toHaveValue("Asha");

    await userEvent.type(screen.getByRole("textbox", { name: "Name" }), " R");
    expect(ref.current).toHaveValue("Asha R");
  });

  it("can be disabled", () => {
    render(<Input label="Name" disabled />);
    expect(screen.getByRole("textbox", { name: "Name" })).toBeDisabled();
  });
});

describe("Input types", () => {
  it("email opens the email keyboard and helps password managers", () => {
    render(<Input type="email" label="Email" />);
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("autocomplete", "email");
    expect(input).toHaveAttribute("autocapitalize", "none");
  });

  it("search is a search box", () => {
    render(<Input type="search" label="Search topics" />);
    expect(
      screen.getByRole("searchbox", { name: "Search topics" })
    ).toBeInTheDocument();
  });

  it("date uses the phone's own date picker, with the label always on the border", () => {
    render(<Input type="date" label="Exam date" />);
    expect(screen.getByLabelText("Exam date")).toHaveAttribute("type", "date");
    expect(screen.getByText("Exam date")).toHaveAttribute("data-raised");
  });

  it("a prop given to the input wins over what its type sets", () => {
    render(<Input type="email" label="Email" autoComplete="off" />);
    expect(screen.getByRole("textbox", { name: "Email" })).toHaveAttribute(
      "autocomplete",
      "off"
    );
  });
});

describe('Input type="password"', () => {
  it("hides the password until the person asks to see it", async () => {
    render(<Input type="password" label="Password" />);
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
    render(<Input type="password" label="Password" />);
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("autocomplete", "current-password");
    expect(input).not.toHaveAttribute("maxlength");
  });

  it('asks for a "new-password" when signing up', () => {
    render(
      <Input type="password" label="New password" autoComplete="new-password" />
    );
    expect(screen.getByLabelText("New password")).toHaveAttribute(
      "autocomplete",
      "new-password"
    );
  });

  it("disables the show button with the field", () => {
    render(<Input type="password" label="Password" disabled />);
    expect(screen.getByLabelText("Password")).toBeDisabled();
    expect(
      screen.getByRole("button", { name: ui.showPassword })
    ).toBeDisabled();
  });

  it("has no show button on other types", () => {
    render(<Input label="Name" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
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
