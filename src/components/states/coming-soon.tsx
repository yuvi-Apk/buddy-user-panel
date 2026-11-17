// The placeholder for screens whose module is not built yet.
//   <ComingSoon />                                  inside a page
//   <ComingSoonPage title={lang.nav.today} />       a whole placeholder screen
//   <ComingSoonPage title={…} illustration={<TodayIllustration />} />   with a picture of the screen
import { Hammer } from "lucide-react";
import type { ReactNode } from "react";
import { Page, PageHeader } from "@/components/layout";
import { useLang } from "@/lang";
import { EmptyState } from "./empty-state";

export function ComingSoon({
  illustration,
  className,
}: {
  illustration?: ReactNode;
  className?: string;
}) {
  const lang = useLang();
  return (
    <EmptyState
      icon={<Hammer />}
      illustration={illustration}
      title={lang.feedback.comingSoonTitle}
      description={lang.feedback.comingSoonBody}
      className={className}
    />
  );
}

export function ComingSoonPage({
  title,
  description,
  illustration,
}: {
  title: ReactNode;
  description?: ReactNode;
  illustration?: ReactNode;
}) {
  return (
    <Page>
      <PageHeader title={title} description={description} />
      <ComingSoon illustration={illustration} />
    </Page>
  );
}
