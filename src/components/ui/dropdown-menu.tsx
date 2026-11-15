// A menu that opens from a button: "More" actions on a row, the profile menu.
//   <DropdownMenu>
//     <DropdownMenuTrigger asChild><IconButton label={lang.common.more} icon={<Ellipsis />} /></DropdownMenuTrigger>
//     <DropdownMenuContent>
//       <DropdownMenuItem icon={<Pencil />} onSelect={edit}>…</DropdownMenuItem>
//       <DropdownMenuSeparator />
//       <DropdownMenuItem tone="destructive" icon={<Trash />} onSelect={remove}>…</DropdownMenuItem>
//     </DropdownMenuContent>
//   </DropdownMenu>
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export function DropdownMenuContent({
  className,
  sideOffset = 6,
  align = "end",
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        align={align}
        className={cn(
          "z-50 min-w-48 overflow-hidden rounded-card border border-border bg-popover p-1 text-popover-foreground shadow-overlay",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export interface DropdownMenuItemProps extends ComponentProps<
  typeof DropdownMenuPrimitive.Item
> {
  icon?: ReactNode;
  /** `destructive` only for an action that deletes or removes something. */
  tone?: "neutral" | "destructive";
}

export function DropdownMenuItem({
  icon,
  tone = "neutral",
  className,
  children,
  ...props
}: DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "flex min-h-11 cursor-default items-center gap-3 rounded-control px-3 text-base outline-none select-none pointer-fine:min-h-9",
        "data-disabled:opacity-50 data-highlighted:bg-hover",
        tone === "destructive" && "text-destructive-soft-foreground",
        className
      )}
      {...props}
    >
      {icon ? (
        <span aria-hidden className="flex [&_svg]:size-5">
          {icon}
        </span>
      ) : null}
      {children}
    </DropdownMenuPrimitive.Item>
  );
}

export function DropdownMenuLabel({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return (
    <DropdownMenuPrimitive.Label
      className={cn(
        "px-3 py-1.5 text-sm font-semibold text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn("my-1 h-px bg-border", className)}
      {...props}
    />
  );
}
