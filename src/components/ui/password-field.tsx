// A password input with a show/hide button. Works with password managers: the right
// autocomplete value, paste allowed, never cut short.
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useLang } from "@/lang";
import { IconButton } from "./button";
import { TextField, type TextFieldProps } from "./text-field";

export interface PasswordFieldProps extends Omit<
  TextFieldProps,
  "type" | "end" | "autoComplete"
> {
  /** "current-password" when logging in, "new-password" when signing up or resetting. */
  autoComplete?: "current-password" | "new-password";
}

export function PasswordField({
  autoComplete = "current-password",
  disabled,
  ...props
}: PasswordFieldProps) {
  const lang = useLang();
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      type={visible ? "text" : "password"}
      autoComplete={autoComplete}
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      disabled={disabled}
      end={
        <IconButton
          size="sm"
          className="-me-2"
          disabled={disabled}
          label={visible ? lang.ui.hidePassword : lang.ui.showPassword}
          icon={visible ? <EyeOff /> : <Eye />}
          onClick={() => setVisible((shown) => !shown)}
        />
      }
      {...props}
    />
  );
}
