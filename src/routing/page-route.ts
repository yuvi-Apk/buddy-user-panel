// Every page of the app is registered with createPageRoute:
//
//   createPageRoute({
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
import { waitUntilSessionIsKnown } from "@/auth/session-store";
import type { LangKey } from "@/lang";
import { getRedirectPathIfBlocked, type RouteAccess } from "./route-access";

/** "shell": top bar, tabs and sidebar. "focus": a calm centered page (login, invite, 404). */
export type RouteLayout = "shell" | "focus";

export interface PageRouteOptions {
  path: string;
  access: RouteAccess;
  page: () => Promise<ComponentType>;
  /** The page's name in en.json, shown in the browser tab and announced on navigation. */
  titleKey: LangKey;
  /** Signed-in pages use the shell, the others the focus layout, unless this says otherwise. */
  layout?: RouteLayout;
}

export interface PageRouteInfo {
  access: RouteAccess;
  titleKey: LangKey;
}

export interface PageRoute {
  path: string;
  access: RouteAccess;
  titleKey: LangKey;
  layout: RouteLayout;
  route: RouteObject;
}

export function createPageRoute(options: PageRouteOptions): PageRoute {
  const { path, access, page, titleKey } = options;
  const layout =
    options.layout ?? (typeof access === "string" ? "focus" : "shell");
  const handle: PageRouteInfo = { access, titleKey };

  return {
    path,
    access,
    titleKey,
    layout,
    route: {
      path,
      handle,
      loader: createAccessCheckLoader(access),
      lazy: async () => ({ Component: await page() }),
    },
  };
}

/** The loader that runs before a page opens and redirects people who may not open it. */
function createAccessCheckLoader(access: RouteAccess) {
  return async ({ request }: LoaderFunctionArgs) => {
    const session = await waitUntilSessionIsKnown();
    const redirectPath = getRedirectPathIfBlocked(
      access,
      session,
      new URL(request.url)
    );
    if (redirectPath) return redirect(redirectPath);
    return null;
  };
}

export function isPageRouteInfo(value: unknown): value is PageRouteInfo {
  return (
    typeof value === "object" &&
    value !== null &&
    "access" in value &&
    "titleKey" in value &&
    typeof value.titleKey === "string"
  );
}

/** The title key of the deepest matching route, for the browser tab title. */
export function useCurrentPageTitleKey(): LangKey | undefined {
  const matches = useMatches();
  for (let index = matches.length - 1; index >= 0; index--) {
    const handle = matches[index]?.handle;
    if (isPageRouteInfo(handle)) return handle.titleKey;
  }
  return undefined;
}
