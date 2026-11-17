// Placeholder: the screen arrives with the organization-management module.
import { ComingSoonPage, ProfileIllustration } from "@/components/states";
import { useLang } from "@/lang";

export function StudentDetailPage() {
  const lang = useLang();
  return (
    <ComingSoonPage
      title={lang.pages.studentDetail}
      illustration={<ProfileIllustration />}
    />
  );
}
