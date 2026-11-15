// Settings → Install the app: a button where the browser can install Buddy, the "Add to Home
// Screen" hint on iPhone and iPad, a note once installed, and nothing where installing isn't
// possible.
import { CircleCheck, Download, Share } from "lucide-react";
import { Section } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLang } from "@/lang";
import { useInstallPrompt } from "@/pwa/use-install-prompt";

export function InstallAppSettings() {
  const lang = useLang();
  const { status, showInstallDialog } = useInstallPrompt();

  if (status === "unavailable") return null;

  return (
    <Section title={lang.pwa.installTitle} description={lang.pwa.installBody}>
      <Card>
        <CardContent className="flex flex-col items-start gap-3">
          {status === "available" ? (
            <Button
              onClick={() => {
                void showInstallDialog();
              }}
            >
              <Download aria-hidden />
              {lang.pwa.installButton}
            </Button>
          ) : null}
          {status === "ios" ? (
            <p className="flex items-start gap-2">
              <Share
                aria-hidden
                className="mt-0.5 size-5 shrink-0 text-primary"
              />
              {lang.pwa.iosHint}
            </p>
          ) : null}
          {status === "installed" ? (
            <p className="flex items-center gap-2">
              <CircleCheck
                aria-hidden
                className="size-5 shrink-0 text-progress"
              />
              {lang.pwa.installed}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </Section>
  );
}
