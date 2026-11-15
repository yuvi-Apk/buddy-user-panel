// The one input of the app. `type` decides how it behaves, like a normal <input>:
//
//   <Input label={lang.profile.name} {...form.register("name")} error={errors.name?.message} />
//   <Input type="email" label={lang.auth.email} isRequired placeholder="asha@example.com" />
//   <Input type="password" label={lang.auth.password} autoComplete="new-password" />
//   <Input type="search" label={lang.topics.search} />
//   <Input type="date" label={lang.onboarding.examDate} />
//
// What each type adds by itself:
//   email     the email keyboard, no auto-capitals, works with password managers
//   password  a show/hide button, works with password managers
//   search    the search keyboard and a magnifier icon
//   date      the phone's own date picker
//
// The label sits inside the empty input and moves up onto the border on focus or when there is a
// value (see field.tsx). `isRequired` adds the red star. `className` styles the <input> itself.
//
// Inputs are always 16px: smaller text makes iOS zoom into the page.
import { Eye, EyeOff, Search } from "lucide-react";
import { type ComponentProps, type ReactNode, useState } from "react";
import { useLang } from "@/lang";
import { cn } from "@/utils/cn";
import { IconButton } from "./button";
import { Field, FieldFrame, FieldLabel, type FieldTextProps } from "./field";
import { useFieldIds } from "./use-field-ids";

export interface InputProps
  extends FieldTextProps, Omit<ComponentProps<"input">, "size" | "required"> {
  /** An icon at the start, inside the input. */
  startIcon?: ReactNode;
  size?: "md" | "lg";
  /** Extra classes for the whole field (label, input, hint and error together). */
  wrapperClassName?: string;
}

const frameSize = { md: "h-11", lg: "h-13" } as const;

/** What a type sets by itself. Props given to <Input> win over these. */
const propsByType: Record<string, ComponentProps<"input">> = {
  email: {
    inputMode: "email",
    autoComplete: "email",
    autoCapitalize: "none",
    autoCorrect: "off",
    spellCheck: false,
  },
  password: {
    autoComplete: "current-password",
    autoCapitalize: "none",
    autoCorrect: "off",
    spellCheck: false,
  },
  search: { enterKeyHint: "search" },
};

export function Input({
  label,
  type = "text",
  hint,
  error,
  isRequired,
  id,
  className,
  wrapperClassName,
  startIcon,
  size = "md",
  disabled,
  placeholder,
  ...inputProps
}: InputProps) {
  const lang = useLang();
  const ids = useFieldIds(id, { hint, error });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isPassword = type === "password";
  const icon = startIcon ?? (type === "search" ? <Search /> : null);
  // A date input always shows its own "dd/mm/yyyy", so the label can never sit inside it.
  const isLabelAlwaysRaised = type === "date";

  return (
    <Field
      hint={hint}
      error={error}
      hintId={ids.hintId}
      errorId={ids.errorId}
      className={wrapperClassName}
    >
      <FieldFrame
        isInvalid={ids.invalid}
        isDisabled={disabled}
        className={cn("items-center gap-2 px-3", frameSize[size])}
      >
        {icon ? (
          <span
            aria-hidden
            className="flex text-muted-foreground [&_svg]:size-5"
          >
            {icon}
          </span>
        ) : null}
        <input
          id={ids.controlId}
          type={isPassword && isPasswordVisible ? "text" : type}
          aria-describedby={ids.describedBy}
          aria-invalid={ids.invalid || undefined}
          // Never empty: CSS uses the placeholder to tell an empty input from a filled one.
          placeholder={placeholder ?? " "}
          required={isRequired}
          disabled={disabled}
          className={cn(
            "peer h-full min-w-0 flex-1 bg-transparent text-base outline-none disabled:cursor-not-allowed",
            "placeholder:text-muted-foreground placeholder:opacity-0 focus:placeholder:opacity-100",
            className
          )}
          {...propsByType[type]}
          {...inputProps}
        />
        <FieldLabel
          controlId={ids.controlId}
          label={label}
          isRequired={isRequired}
          isAlwaysRaised={isLabelAlwaysRaised}
          className={icon ? "start-10" : undefined}
        />
        {isPassword ? (
          <IconButton
            size="sm"
            className="-me-2"
            disabled={disabled}
            label={
              isPasswordVisible ? lang.ui.hidePassword : lang.ui.showPassword
            }
            icon={isPasswordVisible ? <EyeOff /> : <Eye />}
            onClick={() => setIsPasswordVisible((isVisible) => !isVisible)}
          />
        ) : null}
      </FieldFrame>
    </Field>
  );
}
