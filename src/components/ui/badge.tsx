// A small label with a meaning color. `weak` is only for weak topics, `destructive` only for
// errors. Pair the color with a word, and an icon when there is room.
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-semibold whitespace-nowrap [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-muted text-foreground",
        primary: "bg-primary-soft text-primary-soft-foreground",
        progress: "bg-progress-soft text-progress-soft-foreground",
        weak: "bg-weak-soft text-weak-soft-foreground",
        destructive: "bg-destructive-soft text-destructive-soft-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export type BadgeVariant = NonNullable<
  VariantProps<typeof badgeVariants>["variant"]
>;

export interface BadgeProps
  extends ComponentProps<"span">, VariantProps<typeof badgeVariants> {
  icon?: ReactNode;
}

export function Badge({
  variant,
  icon,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    >
      {icon ? <span aria-hidden>{icon}</span> : null}
      {children}
    </span>
  );
}
