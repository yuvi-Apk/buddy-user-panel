// A calm bar while the device is offline. Ink, not red: losing signal is normal on a bus or in a
// basement, and it is not the person's mistake.
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useLang } from "@/lang";
import { cn } from "@/utils/cn";

export function OfflineBanner({ className }: { className?: string }) {
  const online = useOnlineStatus();
  const lang = useLang();
  if (online) return null;

  return (
    <div
      role="status"
      className={cn(
        "flex items-center justify-center gap-2 bg-foreground px-4 py-2 text-center text-sm font-semibold text-background",
        className
      )}
    >
      <WifiOff aria-hidden className="size-4 shrink-0" />
      {lang.feedback.offline}
    </div>
  );
}
