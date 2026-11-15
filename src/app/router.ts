// Every route of the app in one tree, and the browser router that serves it:
//
//   root            title, focus after navigation, the start-up loading screen, the last-resort error
//   ├─ /            sends people to their home, or to /login
//   ├─ shell        signed-in screens (top bar + tabs on phones, sidebar on laptops)
//   ├─ focus        login, sign-up, invite links, dev tools
//   └─ *            404
//
// Each module lists its own pages in its routes.ts with createPageRoute.
// tests/project-rules/routes.test.ts checks them against src/config/navigation.ts.
import { createBrowserRouter, redirect, type RouteObject } from "react-router";
import { homeFor, LOGIN_PATH } from "@/config/navigation";
import { authRoutes } from "@/modules/auth";
import { chatRoutes } from "@/modules/chat";
import { devRoutes } from "@/modules/dev";
import { onboardingRoutes } from "@/modules/onboarding";
import { organizationManagementRoutes } from "@/modules/organization-management";
import { organizationMembershipRoutes } from "@/modules/organization-membership";
import { profileRoutes } from "@/modules/profile";
import { settingsRoutes } from "@/modules/settings";
import { studyPlanRoutes } from "@/modules/study-plan";
import { topicsRoutes } from "@/modules/topics";
import { sessionStore, waitForSession } from "@/auth/session-store";
import {
  type PageRoute,
  createPageRoute,
  type PageRouteInfo,
} from "@/routing/page-route";
import { NotFoundPage } from "./errors/not-found-page";
import { RootError, RouteError } from "./errors/route-error-page";
import { AppLoading, RootLayout } from "./layouts/root-layout";
import { FocusLayout, ShellLayout } from "./layouts/shell-layout";

const notFoundRoute = createPageRoute({
  path: "*",
  access: "public",
  // Small and already part of the error page, so it is not a separate chunk.
  page: () => Promise.resolve(NotFoundPage),
  titleKey: "pages.notFound",
});

/** Every page of the app. The dev tools are an empty list in production builds. */
export const appRoutes: readonly PageRoute[] = [
  ...authRoutes,
  ...onboardingRoutes,
  ...studyPlanRoutes,
  ...topicsRoutes,
  ...chatRoutes,
  ...organizationMembershipRoutes,
  ...organizationManagementRoutes,
  ...profileRoutes,
  ...settingsRoutes,
  ...devRoutes,
];

const homeHandle: PageRouteInfo = {
  access: "public",
  titleKey: "common.appName",
};

async function homeRedirect(): Promise<Response> {
  const session = await waitForSession();
  const role = session.status === "signed-in" ? session.user?.role : undefined;
  return redirect(role ? homeFor(role) : LOGIN_PATH);
}

export function buildRoutes(
  routes: readonly PageRoute[] = appRoutes
): RouteObject[] {
  const inLayout = (layout: PageRoute["layout"]) =>
    routes
      .filter((route) => route.layout === layout)
      .map((route) => route.route);

  return [
    {
      id: "root",
      Component: RootLayout,
      HydrateFallback: AppLoading,
      ErrorBoundary: RootError,
      children: [
        { index: true, loader: homeRedirect, handle: homeHandle },
        {
          Component: ShellLayout,
          ErrorBoundary: RouteError,
          children: inLayout("shell"),
        },
        {
          Component: FocusLayout,
          ErrorBoundary: RouteError,
          children: [...inLayout("focus"), notFoundRoute.route],
        },
      ],
    },
  ];
}

/**
 * The browser router. When the person signs in or out (in this tab or another, or because a
 * refresh was refused), the current route is checked again, so a signed-out person lands on
 * /login and a new role lands on its own home.
 */
export function createAppRouter() {
  const router = createBrowserRouter(buildRoutes());

  sessionStore.subscribe((session, previousSession) => {
    // The first answer at start-up is awaited by the route loaders themselves.
    if (previousSession.status === "restoring") return;
    if (
      session.status !== previousSession.status ||
      session.user?.role !== previousSession.user?.role
    ) {
      void router.revalidate();
    }
  });

  return router;
}

export type AppRouter = ReturnType<typeof createAppRouter>;
