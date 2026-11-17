// What a screen shows when there is nothing yet: an icon (or a small picture of the screen from
// ./illustrations), a title, one sentence, one action.
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface EmptyStateProps {
  icon?: ReactNode;
  /** A picture of the screen, shown instead of the icon (see ./illustrations). */
  illustration?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Usually one Button: the next step. */
  action?: ReactNode;
  /** `destructive` only for ErrorState. */
  variant?: "default" | "destructive";
  className?: string;
}

export function EmptyState({
  icon,
  illustration,
  title,
  description,
  action,
  variant = "default",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 px-4 py-10 text-center",
        className
      )}
    >
      {illustration ? (
        <div className="mb-2 w-full">{illustration}</div>
      ) : icon ? (
        <div
          aria-hidden
          className={cn(
            "flex size-14 items-center justify-center rounded-full [&_svg]:size-7",
            variant === "destructive"
              ? "bg-destructive-soft text-destructive-soft-foreground"
              : "bg-primary-soft text-primary-soft-foreground"
          )}
        >
          {icon}
        </div>
      ) : null}
      <h2 className="text-xl">{title}</h2>
      {description ? (
        <p className="max-w-reading text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
