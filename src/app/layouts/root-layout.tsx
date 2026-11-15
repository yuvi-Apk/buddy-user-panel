// The top of the route tree. Sets the browser tab title from the route's titleKey, and after each
// navigation moves focus to the new page's heading, so screen readers announce the new page
//. Also the loading screen while the session is restored at start.
import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router";
import { LoadingState } from "@/components/feedback/loading-state";
import { MAIN_CONTENT_ID } from "@/components/layout/skip-link";
import { fill, textAt, useLang } from "@/lang";
import { useRouteTitleKey } from "@/routing/define-route";

export function RootLayout() {
  useDocumentTitle();
  useFocusOnNavigation();
  return <Outlet />;
}

/** Shown once, while the app asks the server who is signed in. */
export function AppLoading() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-reading flex-col justify-center px-4">
      <LoadingState />
    </div>
  );
}

function useDocumentTitle(): void {
  const lang = useLang();
  const titleKey = useRouteTitleKey();

  useEffect(() => {
    const appName = lang.common.appName;
    document.title = titleKey
      ? fill(lang.common.pageTitle, { page: textAt(lang, titleKey), appName })
      : appName;
  }, [lang, titleKey]);
}

function useFocusOnNavigation(): void {
  const { pathname } = useLocation();
  const firstRender = useRef(true);

  useEffect(() => {
    // On the first page the browser's own focus order is right; only later navigations move it.
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const frame = requestAnimationFrame(() => {
      const heading = document.querySelector<HTMLElement>(
        "[data-page-heading]"
      );
      (heading ?? document.getElementById(MAIN_CONTENT_ID))?.focus();
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [pathname]);
}
