// Small notifications at the bottom of the screen ("Saved", "Couldn't send").
//
//   toast({ title: lang.profile.saved, tone: "success" });
//   toast({ title: lang.common.error, description: message, tone: "destructive" });
//
// <Toaster /> (toast.tsx) shows them; it is mounted once at the app root.
export type ToastTone = "neutral" | "success" | "destructive";

export interface ToastOptions {
  title: string;
  description?: string;
  tone?: ToastTone;
  /** How long it stays, in milliseconds. 5 seconds by default. */
  duration?: number;
}

export interface ToastItem extends ToastOptions {
  id: number;
  open: boolean;
}

/** At most this many toasts at once; older ones make room. */
const MAX_VISIBLE = 3;

let items: readonly ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

/** Shows a toast and returns its id. */
export function toast(options: ToastOptions): number {
  const id = nextId++;
  items = [...items.slice(-(MAX_VISIBLE - 1)), { ...options, id, open: true }];
  emit();
  return id;
}

/** Starts closing a toast (it animates out, then is removed). */
export function dismissToast(id: number): void {
  items = items.map((item) =>
    item.id === id ? { ...item, open: false } : item
  );
  emit();
}

export function removeToast(id: number): void {
  items = items.filter((item) => item.id !== id);
  emit();
}

export function getToasts(): readonly ToastItem[] {
  return items;
}

export function subscribeToasts(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
