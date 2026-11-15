// "Are you sure?" before something that matters. Focus starts on Cancel, so an accidental Enter
// never confirms. The confirm button shows a spinner while onConfirm runs.
//
//   <ConfirmDialog open={open} onOpenChange={setOpen} tone="destructive"
//     title={lang.organization.removeStudentTitle} description={…}
//     confirmLabel={lang.organization.remove} onConfirm={removeStudent} />
import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import { type ReactNode, useState } from "react";
import { useLang } from "@/lang";
import { Button } from "./button";
import { overlayClasses, sheetClasses } from "./dialog-styles";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  /** `destructive` only when the action can't be undone (core-rules #2). */
  tone?: "primary" | "destructive";
  /**
   * May return a promise; the dialog closes when it resolves. If it throws or rejects, the dialog
   * stays open so the person can try again or cancel. onConfirm tells the person what went wrong
   * itself (API mutations already show an error toast).
   */
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone = "primary",
  onConfirm,
}: ConfirmDialogProps) {
  const lang = useLang();
  const [busy, setBusy] = useState(false);

  async function confirm(): Promise<void> {
    setBusy(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch {
      // Stay open (see onConfirm above). The error has already been shown by onConfirm.
    } finally {
      setBusy(false);
    }
  }

  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className={overlayClasses} />
        <AlertDialogPrimitive.Content className={sheetClasses}>
          <div
            aria-hidden
            className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-border lg:hidden"
          />
          <div className="flex flex-col gap-2 px-5 pt-4 pb-2 lg:pt-5">
            <AlertDialogPrimitive.Title className="font-display text-xl font-semibold">
              {title}
            </AlertDialogPrimitive.Title>
            <AlertDialogPrimitive.Description className="text-muted-foreground">
              {description}
            </AlertDialogPrimitive.Description>
          </div>
          <div className="flex flex-col-reverse gap-2 px-5 py-4 lg:flex-row lg:justify-end">
            <AlertDialogPrimitive.Cancel asChild>
              <Button variant="outline">
                {cancelLabel ?? lang.common.cancel}
              </Button>
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action asChild>
              <Button
                variant={tone}
                loading={busy}
                onClick={(event) => {
                  // Keep the dialog open until onConfirm has finished.
                  event.preventDefault();
                  void confirm();
                }}
              >
                {confirmLabel}
              </Button>
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
