// Placeholder: the screen arrives with the organization-membership module.
import { ComingSoonPage, JoinIllustration } from "@/components/states";
import { useLang } from "@/lang";

export function InvitePage() {
  const lang = useLang();
  return (
    <ComingSoonPage
      title={lang.pages.invite}
      illustration={<JoinIllustration />}
    />
  );
}
