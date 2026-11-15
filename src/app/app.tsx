// The app's root component. Until the router arrives (setup step 3), it shows the UI gallery.
import { LucideProvider } from "lucide-react";
import { Toaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UiGalleryPage } from "@/features/dev";

// Icons are drawn with a 1.75 stroke, a little softer than lucide's default 2 (design-system.md).
// An icon can still pass its own `strokeWidth`.
const ICON_STROKE = 1.75;

export function App() {
  return (
    <LucideProvider strokeWidth={ICON_STROKE}>
      <TooltipProvider>
        <UiGalleryPage />
        <Toaster />
      </TooltipProvider>
    </LucideProvider>
  );
}
