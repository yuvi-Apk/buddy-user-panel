// The placeholder for screens whose feature is not built yet.
//   <ComingSoon />                                  inside a page
//   <ComingSoonPage title={lang.nav.today} />       a whole placeholder screen
import { Hammer } from "lucide-react";
import type { ReactNode } from "react";
import { Page, PageHeader } from "@/components/layout/page";
import { useLang } from "@/lang";
import { EmptyState } from "./empty-state";

export function ComingSoon({ className }: { className?: string }) {
  const lang = useLang();
  return (
    <EmptyState
      icon={<Hammer />}
      title={lang.feedback.comingSoonTitle}
      description={lang.feedback.comingSoonBody}
      className={className}
    />
  );
}

export function ComingSoonPage({
  title,
  description,
}: {
  title: ReactNode;
  description?: ReactNode;
}) {
  return (
    <Page>
      <PageHeader title={title} description={description} />
      <ComingSoon />
    </Page>
  );
}
