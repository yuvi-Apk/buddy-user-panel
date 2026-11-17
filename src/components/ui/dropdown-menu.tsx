// A small menu that opens from a button (the avatar menu in the top bar).
//
//   <DropdownMenu>
//     <DropdownMenuTrigger asChild><IconButton label={…} icon={…} /></DropdownMenuTrigger>
//     <DropdownMenuContent>
//       <DropdownMenuLabel>…</DropdownMenuLabel>
//       <DropdownMenuItem asChild><Link to="/settings"><Settings />…</Link></DropdownMenuItem>
//       <DropdownMenuSeparator />
//       <DropdownMenuItem onSelect={signOut}><LogOut />…</DropdownMenuItem>
//     </DropdownMenuContent>
//   </DropdownMenu>
//
// Arrow keys move between items, Enter picks one, Escape closes and gives focus back to the button.
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/utils/cn";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export function DropdownMenuContent({
  className,
  align = "end",
  sideOffset = 8,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 flex min-w-60 flex-col gap-0.5 rounded-card border-2 border-border bg-popover p-1.5 text-popover-foreground shadow-overlay outline-none",
          "origin-(--radix-dropdown-menu-content-transform-origin) duration-150",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuItem({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Item>) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      className={cn(
        "flex min-h-10 cursor-pointer items-center gap-3 rounded-control px-3 font-semibold outline-none select-none pointer-coarse:min-h-11",
        "transition-colors duration-150 data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-hover",
        "[&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

export function DropdownMenuLabel({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      className={cn("px-3 py-2", className)}
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
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1.5 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}
