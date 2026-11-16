// Registers the service worker and asks before using a new version. The new version
// waits until the person taps Reload, so the app never reloads in the middle of a quiz. Mounted
// once, in src/app/app.tsx. In development the service worker is off and this shows nothing.
import { RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { Button, toast } from "@/components/ui";
import { useLang } from "@/lang";
import { logger } from "@/utils/logger";

export function UpdatePrompt() {
  const lang = useLang();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError: () => {
      logger.warn("The service worker could not be registered");
    },
  });

  useEffect(() => {
    if (!offlineReady) return;
    toast({ title: lang.pwa.offlineReady, variant: "success" });
    setOfflineReady(false);
  }, [offlineReady, setOfflineReady, lang]);

  if (!needRefresh) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-reading flex-col gap-3 rounded-card border border-border bg-popover p-4 text-popover-foreground shadow-overlay lg:start-auto lg:end-6 lg:bottom-6 lg:w-96"
    >
      <div className="flex items-start gap-3">
        <RefreshCw
          aria-hidden
          className="mt-0.5 size-5 shrink-0 text-primary"
        />
        <div className="flex flex-col gap-1">
          <p className="font-semibold">{lang.pwa.updateTitle}</p>
          <p className="text-sm text-muted-foreground">{lang.pwa.updateBody}</p>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setNeedRefresh(false);
          }}
        >
          {lang.pwa.later}
        </Button>
        <Button
          size="sm"
          onClick={() => {
            void updateServiceWorker(true);
          }}
        >
          {lang.pwa.reload}
        </Button>
      </div>
    </div>
  );
}
