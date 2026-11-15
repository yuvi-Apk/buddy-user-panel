// Placeholder: the screen arrives with the auth module.
import { ComingSoonPage } from "@/components/states";
import { useLang } from "@/lang";

export function LoginPage() {
  const lang = useLang();
  return <ComingSoonPage title={lang.pages.login} />;
}
