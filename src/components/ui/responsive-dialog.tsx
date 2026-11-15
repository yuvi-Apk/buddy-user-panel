// A dialog that is a bottom sheet on phones and a centered dialog on laptops.
//
//   <ResponsiveDialog open={open} onOpenChange={setOpen}>
//     <ResponsiveDialogTrigger asChild><Button>…</Button></ResponsiveDialogTrigger>
//     <ResponsiveDialogContent title={lang.x.title} description={…} footer={<Button>…</Button>}>
//       …
//     </ResponsiveDialogContent>
//   </ResponsiveDialog>
//
// The title is required: screen readers announce it when the dialog opens. Focus stays inside
// while it is open; Escape and the close button close it.
import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import type { ComponentProps, ReactNode } from "react";
import { useLang } from "@/lang";
import { cn } from "@/lib/cn";
import { IconButton } from "./button";
import { overlayClasses, sheetClasses } from "./dialog-styles";

export const ResponsiveDialog = DialogPrimitive.Root;
export const ResponsiveDialogTrigger = DialogPrimitive.Trigger;
export const ResponsiveDialogClose = DialogPrimitive.Close;

export interface ResponsiveDialogContentProps extends Omit<
  ComponentProps<typeof DialogPrimitive.Content>,
  "title"
> {
  title: ReactNode;
  description?: ReactNode;
  /** Buttons at the bottom. They stay in view while the body scrolls. */
  footer?: ReactNode;
}

export function ResponsiveDialogContent({
  title,
  description,
  footer,
  className,
  children,
  ...props
}: ResponsiveDialogContentProps) {
  const lang = useLang();

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={overlayClasses} />
      <DialogPrimitive.Content
        className={cn(sheetClasses, className)}
        {...(description ? {} : { "aria-describedby": undefined })}
        {...props}
      >
        <div
          aria-hidden
          className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-border lg:hidden"
        />
        <div className="flex items-start gap-3 px-5 pt-4 pb-2 lg:pt-5">
          <div className="flex flex-1 flex-col gap-1">
            <DialogPrimitive.Title className="font-display text-xl font-semibold">
              {title}
            </DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="text-muted-foreground">
                {description}
              </DialogPrimitive.Description>
            ) : null}
          </div>
          <DialogPrimitive.Close asChild>
            <IconButton
              size="sm"
              className="-me-2 -mt-1"
              label={lang.common.close}
              icon={<X />}
            />
          </DialogPrimitive.Close>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-2">{children}</div>
        {footer ? (
          <div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 lg:flex-row lg:justify-end">
            {footer}
          </div>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
