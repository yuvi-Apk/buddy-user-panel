// What a route shows when it fails to load or render: a calm message and a way out. Inside the
// shell when the shell itself is fine (RouteError), or on its own (RootError).
//
// The most common cause is a page chunk that no longer exists after a new version was deployed,
// so the action reloads the page.
import { isRouteErrorResponse, useRouteError } from "react-router";
import { ErrorState } from "@/components/feedback/error-state";
import { FocusShell } from "@/components/layout/app-shell";
import { Page } from "@/components/layout/page";
import { useLang } from "@/lang";
import { isApiError } from "@/api/api-error";
import { logger } from "@/utils/logger";
import { NotFoundPage } from "./not-found-page";

export function RouteError() {
  const lang = useLang();
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPage />;
  }

  logger.error("A route failed", {
    name: error instanceof Error ? error.name : typeof error,
  });

  return (
    <Page width="reading">
      {/* The page's one h1, for screen readers; ErrorState shows the same words. */}
      <h1 className="sr-only" tabIndex={-1} data-page-heading>
        {lang.feedback.errorTitle}
      </h1>
      <ErrorState
        onRetry={() => {
          window.location.reload();
        }}
        reference={isApiError(error) ? error.requestId : undefined}
      />
    </Page>
  );
}

export function RootError() {
  return (
    <FocusShell>
      <RouteError />
    </FocusShell>
  );
}
