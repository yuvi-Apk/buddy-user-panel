// Settings: Appearance (theme and mode), Install the app, and Your account.
import { Page, PageHeader, Section } from "@/components/layout";
import { Card, CardContent } from "@/components/ui";
import { useLang } from "@/lang";
import { AccountSettings } from "../components/account-settings";
import { AppearanceSettings } from "../components/appearance-settings";
import { InstallAppSettings } from "../components/install-app-settings";

export function SettingsPage() {
  const lang = useLang();

  return (
    <Page>
      <PageHeader title={lang.nav.settings} />
      <Section
        variant="split"
        title={lang.theme.title}
        description={lang.theme.description}
      >
        <Card>
          <CardContent>
            <AppearanceSettings />
          </CardContent>
        </Card>
      </Section>
      <InstallAppSettings />
      <AccountSettings />
    </Page>
  );
}
