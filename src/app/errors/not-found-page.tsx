// The page for an address that matches no route.
import { House, SearchX } from "lucide-react";
import { Link } from "react-router";
import { EmptyState } from "@/components/feedback/empty-state";
import { Page, PageHeader } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lang";

export function NotFoundPage() {
  const lang = useLang();

  return (
    <Page width="reading">
      <PageHeader title={lang.pages.notFound} />
      <EmptyState
        icon={<SearchX />}
        title={lang.notFound.title}
        description={lang.notFound.body}
        action={
          <Button asChild>
            <Link to="/">
              <House aria-hidden />
              {lang.common.goHome}
            </Link>
          </Button>
        }
      />
    </Page>
  );
}
