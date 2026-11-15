// What a screen shows when there is nothing yet: an icon, a title, one sentence, one action.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Usually one Button: the next step. */
  action?: ReactNode;
  /** `destructive` only for ErrorState. */
  tone?: "primary" | "destructive";
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  tone = "primary",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 px-4 py-10 text-center",
        className
      )}
    >
      {icon ? (
        <div
          aria-hidden
          className={cn(
            "flex size-14 items-center justify-center rounded-full [&_svg]:size-7",
            tone === "destructive"
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
