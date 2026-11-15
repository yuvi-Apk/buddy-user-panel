// Placeholder: the screen arrives with the auth feature.
import { ComingSoonPage } from "@/components/feedback/coming-soon";
import { useLang } from "@/lang";

export function ResetPasswordPage() {
  const lang = useLang();
  return <ComingSoonPage title={lang.pages.resetPassword} />;
}
