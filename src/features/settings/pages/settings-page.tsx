// Settings. Appearance is the one finished section of the foundation.
import { Page, PageHeader, Section } from "@/components/layout/page";
import { Card, CardContent } from "@/components/ui/card";
import { useLang } from "@/lang";
import { AppearanceSettings } from "../components/appearance-settings";

export function SettingsPage() {
  const lang = useLang();

  return (
    <Page width="reading">
      <PageHeader title={lang.nav.settings} />
      <Section title={lang.theme.title} description={lang.theme.description}>
        <Card>
          <CardContent>
            <AppearanceSettings />
          </CardContent>
        </Card>
      </Section>
    </Page>
  );
}
