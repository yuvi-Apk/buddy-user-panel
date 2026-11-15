// Every route of the app, in one tree (features.md):
//
//   root            title, focus after navigation, the start-up loading screen, the last-resort error
//   ├─ /            sends people to their home, or to /login
//   ├─ shell        signed-in screens (top bar + tabs on phones, sidebar on laptops)
//   ├─ focus        login, sign-up, invite links, dev tools
//   └─ *            404
//
// Each feature lists its own routes in its routes.ts with defineRoute (core-rules #6).
// tests/guardrails/routes.test.ts checks them against src/config/navigation.ts.
import { redirect, type RouteObject } from "react-router";
import { homeFor, LOGIN_PATH } from "@/config/navigation";
import { authRoutes } from "@/features/auth";
import { chatRoutes } from "@/features/chat";
import { devRoutes } from "@/features/dev";
import { onboardingRoutes } from "@/features/onboarding";
import { organizationManagementRoutes } from "@/features/organization-management";
import { organizationMembershipRoutes } from "@/features/organization-membership";
import { profileRoutes } from "@/features/profile";
import { settingsRoutes } from "@/features/settings";
import { studyPlanRoutes } from "@/features/study-plan";
import { topicsRoutes } from "@/features/topics";
import { waitForSession } from "@/lib/auth/session-store";
import {
  type DefinedRoute,
  defineRoute,
  type RouteHandle,
} from "@/lib/routing/define-route";
import { NotFoundPage } from "./errors/not-found-page";
import { RootError, RouteError } from "./errors/route-error-page";
import { AppLoading, RootLayout } from "./layouts/root-layout";
import { FocusLayout, ShellLayout } from "./layouts/shell-layout";

const notFoundRoute = defineRoute({
  path: "*",
  access: "public",
  // Small and already part of the error page, so it is not a separate chunk.
  page: () => Promise.resolve(NotFoundPage),
  titleKey: "pages.notFound",
});

/** Every page of the app. The dev tools are an empty list in production builds. */
export const appRoutes: readonly DefinedRoute[] = [
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

const homeHandle: RouteHandle = {
  access: "public",
  titleKey: "common.appName",
};

async function homeRedirect(): Promise<Response> {
  const session = await waitForSession();
  const role = session.status === "signed-in" ? session.user?.role : undefined;
  return redirect(role ? homeFor(role) : LOGIN_PATH);
}

export function buildRoutes(
  routes: readonly DefinedRoute[] = appRoutes
): RouteObject[] {
  const inLayout = (layout: DefinedRoute["layout"]) =>
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
