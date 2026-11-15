import { zodResolver } from "@hookform/resolvers/zod";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { ApiError } from "@/api/api-error";
import { Form, SubmitButton } from "@/components/ui/form";
import { PasswordField } from "@/components/ui/password-field";
import { EmailField } from "@/components/ui/text-field";
import { getToasts } from "@/components/ui/toast-store";

const schema = z.object({
  email: z.email({ error: "Enter your email" }),
  password: z.string().min(8, { error: "Use at least 8 characters" }),
});
type Values = z.infer<typeof schema>;

function LoginForm({
  onSubmit,
}: {
  onSubmit: (values: Values) => void | Promise<void>;
}) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });
  const { errors } = form.formState;

  return (
    <Form form={form} onSubmit={onSubmit}>
      <EmailField
        label="Email"
        error={errors.email?.message}
        {...form.register("email")}
      />
      <PasswordField
        label="Password"
        error={errors.password?.message}
        {...form.register("password")}
      />
      <SubmitButton>Log in</SubmitButton>
    </Form>
  );
}

describe("Form", () => {
  it("shows each field's error, focuses the first one and sends nothing", async () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    const email = screen.getByRole("textbox", { name: "Email" });
    expect(email).toHaveAccessibleDescription("Enter your email");
    expect(email).toBeInvalid();
    expect(email).toHaveFocus();
    expect(screen.getByLabelText("Password")).toHaveAccessibleDescription(
      "Use at least 8 characters"
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("sends the values, and the button is busy until that has finished", async () => {
    let finish = () => {};
    const sending = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const onSubmit = vi.fn(() => sending);
    render(<LoginForm onSubmit={onSubmit} />);

    await userEvent.type(
      screen.getByRole("textbox", { name: "Email" }),
      "asha@example.com"
    );
    await userEvent.type(screen.getByLabelText("Password"), "correct horse");
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(onSubmit).toHaveBeenCalledWith(
      { email: "asha@example.com", password: "correct horse" },
      expect.anything()
    );
    const button = screen.getByRole("button", { name: "Log in" });
    await waitFor(() => expect(button).toHaveAttribute("aria-busy", "true"));

    await act(async () => {
      finish();
      await sending;
    });
    expect(button).not.toHaveAttribute("aria-busy");
  });

  it("shows the backend's validation errors under their fields", async () => {
    const onSubmit = vi.fn(() =>
      Promise.reject(
        new ApiError({
          kind: "http",
          status: 400,
          message: "Validation failed",
          fieldErrors: { email: "This email is already used" },
        })
      )
    );
    render(<LoginForm onSubmit={onSubmit} />);

    await userEvent.type(
      screen.getByRole("textbox", { name: "Email" }),
      "asha@example.com"
    );
    await userEvent.type(screen.getByLabelText("Password"), "correct horse");
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    const email = screen.getByRole("textbox", { name: "Email" });
    await waitFor(() =>
      expect(email).toHaveAccessibleDescription("This email is already used")
    );
    expect(email).toBeInvalid();
    expect(email).toHaveFocus();
    expect(screen.getByRole("button", { name: "Log in" })).not.toHaveAttribute(
      "aria-busy"
    );
  });

  it("shows a toast for a backend error on a field the form does not have", async () => {
    const onSubmit = vi.fn(() =>
      Promise.reject(
        new ApiError({
          kind: "http",
          status: 400,
          message: "Validation failed",
          fieldErrors: { examDate: "Choose a date in the future" },
        })
      )
    );
    render(<LoginForm onSubmit={onSubmit} />);

    await userEvent.type(
      screen.getByRole("textbox", { name: "Email" }),
      "asha@example.com"
    );
    await userEvent.type(screen.getByLabelText("Password"), "correct horse");
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() =>
      expect(getToasts().map((item) => item.description)).toContain(
        "Choose a date in the future"
      )
    );
  });
});
