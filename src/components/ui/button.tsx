// Buttons. One look for every action in the app.
//
//   <Button onClick={save}>{lang.common.save}</Button>
//   <Button variant="outline" size="sm">…</Button>
//   <Button loading={isSaving}>…</Button>            busy: spinner, clicks ignored, focus kept
//   <IconButton label={lang.common.close} icon={<X />} />
//   <Button asChild><Link to="/plan">…</Link></Button>   a link that looks like a button
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Spinner } from "./spinner";

const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center gap-2 rounded-control font-semibold whitespace-nowrap select-none",
    "transition-colors duration-150 ease-out",
    "disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress",
    "[&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        secondary: "bg-muted text-foreground hover:bg-hover",
        outline: "border-2 border-input bg-card text-foreground hover:bg-hover",
        ghost: "text-foreground hover:bg-hover",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive-hover",
      },
      // sm grows to the 44px touch size on touch screens.
      size: {
        sm: "h-9 px-3 text-sm pointer-coarse:h-11",
        default: "h-11 px-4 text-base",
        lg: "h-13 px-6 text-base",
      },
      fullWidth: { true: "w-full" },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  /** Shows a spinner and ignores clicks, but keeps focus on the button (unlike `disabled`). */
  loading?: boolean;
  /** Gives the single child element (for example a router link) the button's look. */
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  fullWidth,
  loading = false,
  asChild = false,
  type = "button",
  onClick,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size, fullWidth }), className);

  if (asChild) {
    return (
      <Slot.Root data-slot="button" className={classes} {...props}>
        {children}
      </Slot.Root>
    );
  }

  return (
    <button
      data-slot="button"
      type={type}
      className={classes}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      onClick={loading ? (event) => event.preventDefault() : onClick}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

const iconButtonSizes = {
  sm: "w-9 px-0 pointer-coarse:w-11",
  default: "w-11 px-0",
  lg: "w-13 px-0",
} as const;

export interface IconButtonProps extends Omit<
  ButtonProps,
  "children" | "fullWidth" | "asChild"
> {
  /** Read out by screen readers, because the button shows only an icon. */
  label: string;
  icon: ReactNode;
}

export function IconButton({
  label,
  icon,
  variant = "ghost",
  size,
  className,
  ...props
}: IconButtonProps) {
  const iconSize = size ?? "default";
  return (
    <Button
      aria-label={label}
      variant={variant}
      size={iconSize}
      className={cn(iconButtonSizes[iconSize], className)}
      {...props}
    >
      {icon}
    </Button>
  );
}
