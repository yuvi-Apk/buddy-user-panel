// Shared classes for ResponsiveDialog and ConfirmDialog: a bottom sheet on phones, a centered
// dialog from the lg breakpoint (1024px) up.
export const overlayClasses = [
  "fixed inset-0 z-50 bg-overlay",
  "data-[state=open]:animate-in data-[state=open]:fade-in-0",
  "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
].join(" ");

export const sheetClasses = [
  "fixed z-50 flex max-h-[90dvh] flex-col bg-popover text-popover-foreground shadow-overlay outline-none",
  // phones: a sheet that slides up from the bottom, clear of the home indicator
  "inset-x-0 bottom-0 rounded-t-sheet pb-[env(safe-area-inset-bottom)]",
  "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom",
  "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom",
  // laptops: a centered dialog that fades and zooms in
  "lg:inset-x-auto lg:top-1/2 lg:bottom-auto lg:left-1/2 lg:w-full lg:max-w-lg lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-card lg:pb-0",
  "lg:data-[state=open]:slide-in-from-bottom-0 lg:data-[state=open]:fade-in-0 lg:data-[state=open]:zoom-in-95",
  "lg:data-[state=closed]:slide-out-to-bottom-0 lg:data-[state=closed]:fade-out-0 lg:data-[state=closed]:zoom-out-95",
].join(" ");
