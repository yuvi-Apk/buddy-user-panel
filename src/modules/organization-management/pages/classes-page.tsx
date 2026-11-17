// Placeholder: the screen arrives with the organization-management module.
import { ComingSoonPage, PeopleIllustration } from "@/components/states";
import { useLang } from "@/lang";

export function ClassesPage() {
  const lang = useLang();
  return (
    <ComingSoonPage
      title={lang.nav.classes}
      illustration={<PeopleIllustration />}
    />
  );
}
