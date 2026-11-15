// Text inputs, all in the shared Field frame.
//
//   <TextField label={lang.profile.name} {...form.register("name")} error={errors.name?.message} />
//   <EmailField label={lang.auth.email} … />        email keyboard, no auto-capitals
//   <SearchField label={lang.topics.search} … />    search keyboard, magnifier icon
//   <DateField label={lang.onboarding.examDate} … /> the phone's own date picker
//   <CodeField label={lang.organization.code} … />  Organization join codes
//
// Inputs are always 16px: smaller text makes iOS zoom into the page.
import { Search } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Field, type FieldTextProps } from "./field";
import { useFieldIds } from "./use-field-ids";

export interface TextFieldProps
  extends FieldTextProps, Omit<ComponentProps<"input">, "size"> {
  /** An icon at the start, inside the field. */
  startIcon?: ReactNode;
  /** Something at the end, inside the field (for example the show-password button). */
  end?: ReactNode;
  size?: "md" | "lg";
  /** Extra classes for the input element itself (used by CodeField). */
  inputClassName?: string;
}

const frameSize = { md: "h-11", lg: "h-13" } as const;

export function TextField({
  label,
  hint,
  error,
  required,
  id,
  className,
  startIcon,
  end,
  size = "md",
  inputClassName,
  disabled,
  ...inputProps
}: TextFieldProps) {
  const ids = useFieldIds(id, { hint, error });

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      controlId={ids.controlId}
      hintId={ids.hintId}
      errorId={ids.errorId}
      className={className}
    >
      <div
        className={cn(
          "flex w-full items-center gap-2 rounded-control border bg-card px-3 text-foreground transition-colors",
          "focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-ring",
          ids.invalid ? "border-destructive" : "border-input",
          disabled && "opacity-50",
          frameSize[size]
        )}
      >
        {startIcon ? (
          <span
            aria-hidden
            className="flex text-muted-foreground [&_svg]:size-5"
          >
            {startIcon}
          </span>
        ) : null}
        <input
          id={ids.controlId}
          aria-describedby={ids.describedBy}
          aria-invalid={ids.invalid || undefined}
          required={required}
          disabled={disabled}
          className={cn(
            "h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
            inputClassName
          )}
          {...inputProps}
        />
        {end}
      </div>
    </Field>
  );
}

export function EmailField(props: Omit<TextFieldProps, "type">) {
  return (
    <TextField
      type="email"
      inputMode="email"
      autoComplete="email"
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      {...props}
    />
  );
}

export function SearchField(props: Omit<TextFieldProps, "type" | "startIcon">) {
  return (
    <TextField
      type="search"
      enterKeyHint="search"
      startIcon={<Search />}
      {...props}
    />
  );
}

/** A date, picked with the phone's own calendar. The value is "YYYY-MM-DD". */
export function DateField(props: Omit<TextFieldProps, "type">) {
  return <TextField type="date" {...props} />;
}

/** An Organization join code: shown in capitals, spaced, never auto-corrected. */
export function CodeField(props: Omit<TextFieldProps, "type">) {
  return (
    <TextField
      type="text"
      inputMode="text"
      autoComplete="off"
      autoCapitalize="characters"
      autoCorrect="off"
      spellCheck={false}
      inputClassName="font-semibold tracking-[0.2em] uppercase tabular-nums"
      {...props}
    />
  );
}
