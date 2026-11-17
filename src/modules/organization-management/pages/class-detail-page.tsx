// Placeholder: the screen arrives with the organization-management module.
import { ComingSoonPage, PeopleIllustration } from "@/components/states";
import { useLang } from "@/lang";

export function ClassDetailPage() {
  const lang = useLang();
  return (
    <ComingSoonPage
      title={lang.pages.classDetail}
      illustration={<PeopleIllustration />}
    />
  );
}
