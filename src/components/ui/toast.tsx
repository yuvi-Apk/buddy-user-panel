// Shows the toasts from toast-store.ts. Mount <Toaster /> once at the app root.
// Built on Radix Toast: announced to screen readers, swipe down to dismiss, F8 to reach them.
import { cva } from "class-variance-authority";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { Toast as ToastPrimitive } from "radix-ui";
import { useSyncExternalStore } from "react";
import { useLang } from "@/lang";
import { cn } from "@/utils/cn";
import { IconButton } from "./button";
import {
  closeToast,
  getToasts,
  removeClosedToast,
  subscribeToToasts,
} from "./toast-store";

const toastVariants = cva(
  [
    "pointer-events-auto flex w-full items-start gap-3 rounded-card border p-4 shadow-overlay",
    "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4",
    "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
    "data-[swipe=cancel]:translate-y-0 data-[swipe=end]:animate-out data-[swipe=move]:translate-y-(--radix-toast-swipe-move-y)",
  ],
  {
    variants: {
      tone: {
        neutral: "border-border bg-popover text-popover-foreground",
        success:
          "border-progress/30 bg-progress-soft text-progress-soft-foreground",
        destructive:
          "border-destructive/30 bg-destructive-soft text-destructive-soft-foreground",
      },
    },
  }
);

const icons = {
  neutral: Info,
  success: CircleCheck,
  destructive: CircleAlert,
} as const;

/** Time for the closing animation before the toast is removed. */
const CLOSE_ANIMATION_MS = 200;

export function Toaster() {
  const lang = useLang();
  const toasts = useSyncExternalStore(subscribeToToasts, getToasts, getToasts);

  return (
    // `label` on the provider is read before each toast; the viewport's names the region, and
    // Radix puts the shortcut (F8) where `{hotkey}` is.
    <ToastPrimitive.Provider swipeDirection="down" label={lang.ui.notification}>
      {toasts.map((item) => {
        const tone = item.tone ?? "neutral";
        const Icon = icons[tone];
        return (
          <ToastPrimitive.Root
            key={item.id}
            open={item.open}
            duration={item.duration ?? 5000}
            onOpenChange={(open) => {
              if (open) return;
              closeToast(item.id);
              window.setTimeout(
                () => removeClosedToast(item.id),
                CLOSE_ANIMATION_MS
              );
            }}
            className={cn(toastVariants({ tone }))}
          >
            <Icon aria-hidden className="mt-0.5 size-5 shrink-0" />
            <div className="flex flex-1 flex-col gap-0.5">
              <ToastPrimitive.Title className="font-semibold">
                {item.title}
              </ToastPrimitive.Title>
              {item.description ? (
                <ToastPrimitive.Description className="text-sm">
                  {item.description}
                </ToastPrimitive.Description>
              ) : null}
            </div>
            <ToastPrimitive.Close asChild>
              <IconButton
                size="sm"
                className="-me-2 -mt-2"
                label={lang.ui.dismissNotification}
                icon={<X />}
              />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        );
      })}
      {/* Above the bottom tab bar on phones; bottom-right on laptops. */}
      <ToastPrimitive.Viewport
        label={lang.ui.notifications}
        className="pointer-events-none fixed inset-x-0 bottom-16 z-50 mb-[env(safe-area-inset-bottom)] flex flex-col gap-2 p-4 outline-none lg:start-auto lg:end-0 lg:bottom-0 lg:mb-0 lg:w-[26rem]"
      />
    </ToastPrimitive.Provider>
  );
}
