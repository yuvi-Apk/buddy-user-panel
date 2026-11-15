// What every screen needs around it: server data (TanStack Query), icon defaults, tooltips and
// toasts. The test render helper (tests/helpers/render.tsx) uses the same providers.
import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LucideProvider } from "lucide-react";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";

// Icons are drawn with a 1.75 stroke, a little softer than lucide's default 2.
// An icon can still pass its own `strokeWidth`.
const ICON_STROKE = 1.75;

export function Providers({
  queryClient,
  children,
}: {
  queryClient: QueryClient;
  children: ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <LucideProvider strokeWidth={ICON_STROKE}>
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </LucideProvider>
    </QueryClientProvider>
  );
}
