// Placeholder: the screen arrives with the profile module.
import { ComingSoonPage } from "@/components/feedback/coming-soon";
import { useLang } from "@/lang";

export function ProfilePage() {
  const lang = useLang();
  return <ComingSoonPage title={lang.nav.profile} />;
}
