// The frame every form field shares: label above, the control, hint below, error with an icon.
// Fields use it through TextField, PasswordField, SelectField, … rather than directly.
import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface FieldTextProps {
  /** Always visible above the control. Every field needs one. */
  label: ReactNode;
  /** Help below the control ("At least 8 characters"). */
  hint?: ReactNode;
  /** Why the value is not valid. Marks the field invalid. */
  error?: ReactNode;
  required?: boolean;
}

interface FieldProps extends FieldTextProps {
  controlId: string;
  hintId?: string;
  errorId?: string;
  className?: string;
  children: ReactNode;
}

export function Field({
  label,
  hint,
  error,
  required,
  controlId,
  hintId,
  errorId,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={controlId}
        className="text-sm font-semibold text-foreground"
      >
        {label}
        {required ? (
          <span aria-hidden className="ms-0.5 text-muted-foreground">
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint ? (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}

/** An error line under a field or a group. Red is for real errors only (core-rules #2). */
export function FieldError({
  id,
  children,
}: {
  id?: string;
  children: ReactNode;
}) {
  return (
    <p
      id={id}
      className="flex items-start gap-1.5 text-sm font-semibold text-destructive-soft-foreground"
    >
      <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
