// A message inside the page. Variants: default (primary), success (progress), weak (weak topics
// only), destructive (errors only; it is announced to screen readers at once).
import { cva } from "class-variance-authority";
import { CircleAlert, CircleCheck, Info, Sprout } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

const alertVariants = cva("flex gap-3 rounded-card border p-4", {
  variants: {
    variant: {
      default: "border-primary/20 bg-primary-soft text-primary-soft-foreground",
      success:
        "border-progress/20 bg-progress-soft text-progress-soft-foreground",
      weak: "border-weak/30 bg-weak-soft text-weak-soft-foreground",
      destructive:
        "border-destructive/25 bg-destructive-soft text-destructive-soft-foreground",
    },
  },
});

export type AlertVariant = "default" | "success" | "weak" | "destructive";

const icons = {
  default: Info,
  success: CircleCheck,
  weak: Sprout,
  destructive: CircleAlert,
} as const;

export interface AlertProps {
  variant?: AlertVariant;
  title: ReactNode;
  children?: ReactNode;
  /** A button or link at the end, for example "Try again". */
  action?: ReactNode;
  className?: string;
}

export function Alert({
  variant = "default",
  title,
  children,
  action,
  className,
}: AlertProps) {
  const Icon = icons[variant];

  return (
    <div
      data-slot="alert"
      role={variant === "destructive" ? "alert" : "status"}
      className={cn(alertVariants({ variant }), className)}
    >
      <Icon aria-hidden className="mt-0.5 size-5 shrink-0" />
      <div className="flex flex-1 flex-col gap-1">
        <p className="font-semibold">{title}</p>
        {children ? <div className="text-sm">{children}</div> : null}
        {action ? <div className="mt-2">{action}</div> : null}
      </div>
    </div>
  );
}
