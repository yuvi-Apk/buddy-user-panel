// The frame every form field shares. Fields use it through Input, SelectField,
// … rather than directly.
//
// The label sits inside the empty control like a placeholder. When the control has focus or a
// value, the label moves up onto the top border (the `label-raised:` variant in styles/index.css)
// and the real placeholder appears. The hint and the error are below the control.
import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface FieldTextProps {
  /** Always visible. Every field needs one. */
  label: ReactNode;
  /** Help below the control ("At least 8 characters"). */
  hint?: ReactNode;
  /** Why the value is not valid. Marks the field invalid. */
  error?: ReactNode;
  /** Shows the red star after the label and tells screen readers the field must be filled in. */
  isRequired?: boolean;
}

interface FieldProps {
  hint?: ReactNode;
  error?: ReactNode;
  hintId?: string;
  errorId?: string;
  className?: string;
  /** The FieldFrame with the control and its FieldLabel. */
  children: ReactNode;
}

export function Field({
  hint,
  error,
  hintId,
  errorId,
  className,
  children,
}: FieldProps) {
  return (
    // The top padding leaves room for the raised label, which sticks out above the frame.
    <div className={cn("flex flex-col gap-1.5 pt-2.5", className)}>
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

interface FieldFrameProps {
  isInvalid: boolean;
  isDisabled?: boolean;
  className?: string;
  /** The control, then its FieldLabel. */
  children: ReactNode;
}

/**
 * The box around a control: a strong border with sharp corners, the theme color and a soft glow
 * on focus, red when the value is not valid.
 */
export function FieldFrame({
  isInvalid,
  isDisabled,
  className,
  children,
}: FieldFrameProps) {
  return (
    <div
      className={cn(
        "relative flex w-full rounded-control border-2 bg-card text-foreground transition-[border-color,box-shadow] duration-150",
        isInvalid
          ? "border-destructive ring-3 ring-destructive-soft"
          : "border-input focus-within:border-primary focus-within:ring-3 focus-within:ring-primary-soft",
        isDisabled && "opacity-50",
        className
      )}
    >
      {children}
    </div>
  );
}

interface FieldLabelProps {
  controlId: string;
  label: ReactNode;
  isRequired?: boolean;
  /** For controls that always show something (a select, a date): the label never sits inside. */
  isAlwaysRaised?: boolean;
  /** Moves the resting label, for example past a start icon ("start-10"). */
  className?: string;
}

/**
 * The label of a field. It must come after the control in the same frame, and the control needs
 * the `peer` class and a placeholder (a space is enough), so CSS can tell when it is empty.
 */
export function FieldLabel({
  controlId,
  label,
  isRequired,
  isAlwaysRaised,
  className,
}: FieldLabelProps) {
  return (
    <label
      htmlFor={controlId}
      data-raised={isAlwaysRaised ? "" : undefined}
      className={cn(
        "pointer-events-none absolute start-3 top-1/2 max-w-[calc(100%-1.5rem)] -translate-y-1/2 truncate text-base text-muted-foreground transition-all duration-100 ease-out",
        "label-raised:start-2 label-raised:top-0 label-raised:bg-card label-raised:px-1.5 label-raised:text-sm label-raised:font-semibold label-raised:text-foreground",
        className
      )}
    >
      {label}
      {isRequired ? (
        // The one red that is not an error: the star that marks a field as required.
        <span aria-hidden className="ms-0.5 font-semibold text-destructive">
          *
        </span>
      ) : null}
    </label>
  );
}

/** An error line under a field or a group. Red is for real errors only. */
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
