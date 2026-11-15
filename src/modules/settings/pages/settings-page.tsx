// Settings: Appearance (theme and mode) and Install the app.
import { Page, PageHeader, Section } from "@/components/layout";
import { Card, CardContent } from "@/components/ui";
import { useLang } from "@/lang";
import { AppearanceSettings } from "../components/appearance-settings";
import { InstallAppSettings } from "../components/install-app-settings";

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
      <InstallAppSettings />
    </Page>
  );
}
