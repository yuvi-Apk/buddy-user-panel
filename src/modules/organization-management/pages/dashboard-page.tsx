// Placeholder: the screen arrives with the organization-management module.
import { ComingSoonPage, DashboardIllustration } from "@/components/states";
import { useLang } from "@/lang";

export function DashboardPage() {
  const lang = useLang();
  return (
    <ComingSoonPage
      title={lang.nav.dashboard}
      illustration={<DashboardIllustration />}
    />
  );
}
