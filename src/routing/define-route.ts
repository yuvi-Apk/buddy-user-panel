// Every page of the app is registered with defineRoute:
//
//   defineRoute({
//     path: "/today",
//     access: ["INDIVIDUAL", "STUDENT"],
//     page: () => import("./pages/today-page").then((file) => file.TodayPage),
//     titleKey: "nav.today",
//   })
//
// It adds a loader that waits for the session and redirects people who may not open the page
// (route-access.ts), loads the page only when it is opened, and keeps access and title on the
// route's handle for the layouts and tests/project-rules/routes.test.ts.
import type { ComponentType } from "react";
import {
  type LoaderFunctionArgs,
  redirect,
  type RouteObject,
  useMatches,
} from "react-router";
import { waitForSession } from "@/auth/session-store";
import type { LangKey } from "@/lang";
import { accessRedirect, type RouteAccess } from "./route-access";

/** "shell": top bar, tabs and sidebar. "focus": a calm centered page (login, invite, 404). */
export type RouteLayout = "shell" | "focus";

export interface RouteOptions {
  path: string;
  access: RouteAccess;
  page: () => Promise<ComponentType>;
  /** The page's name in en.json, shown in the browser tab and announced on navigation. */
  titleKey: LangKey;
  /** Signed-in pages use the shell, the others the focus layout, unless this says otherwise. */
  layout?: RouteLayout;
}

export interface RouteHandle {
  access: RouteAccess;
  titleKey: LangKey;
}

export interface AppRoute {
  path: string;
  access: RouteAccess;
  titleKey: LangKey;
  layout: RouteLayout;
  route: RouteObject;
}

export function defineRoute(definition: RouteOptions): AppRoute {
  const { path, access, page, titleKey } = definition;
  const layout =
    definition.layout ?? (typeof access === "string" ? "focus" : "shell");
  const handle: RouteHandle = { access, titleKey };

  return {
    path,
    access,
    titleKey,
    layout,
    route: {
      path,
      handle,
      loader: accessLoader(access),
      lazy: async () => ({ Component: await page() }),
    },
  };
}

/** The loader that guards a route. Exported for routes that are not pages (the "/" redirect). */
export function accessLoader(access: RouteAccess) {
  return async ({ request }: LoaderFunctionArgs) => {
    const session = await waitForSession();
    const target = accessRedirect(access, session, new URL(request.url));
    if (target) return redirect(target);
    return null;
  };
}

export function isRouteHandle(value: unknown): value is RouteHandle {
  return (
    typeof value === "object" &&
    value !== null &&
    "access" in value &&
    "titleKey" in value &&
    typeof value.titleKey === "string"
  );
}

/** The title key of the deepest matching route, for the browser tab title. */
export function useRouteTitleKey(): LangKey | undefined {
  const matches = useMatches();
  for (let index = matches.length - 1; index >= 0; index--) {
    const handle = matches[index]?.handle;
    if (isRouteHandle(handle)) return handle.titleKey;
  }
  return undefined;
}
