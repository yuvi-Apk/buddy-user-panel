// Every route in the app is made with defineRoute (core-rules #6, features.md):
//
//   defineRoute({
//     path: "/today",
//     access: ["INDIVIDUAL", "STUDENT"],
//     page: () => import("./pages/today-page").then((m) => m.TodayPage),
//     titleKey: "nav.today",
//   })
//
// It adds a loader that waits for the session and redirects people who may not open the page,
// loads the page lazily (one chunk per page), and keeps access and title on the route's handle
// for the layouts and tests/guardrails/routes.test.ts.
import type { ComponentType } from "react";
import {
  type LoaderFunctionArgs,
  redirect,
  type RouteObject,
} from "react-router";
import type { LangKey } from "@/lang";
import { waitForSession } from "@/lib/auth/session-store";
import { accessRedirect, type RouteAccess } from "./access";

/** "shell": top bar, tabs and sidebar. "focus": a calm centered page (login, invite, 404). */
export type RouteLayout = "shell" | "focus";

export interface RouteDefinition {
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

export interface DefinedRoute {
  path: string;
  access: RouteAccess;
  titleKey: LangKey;
  layout: RouteLayout;
  route: RouteObject;
}

export function defineRoute(definition: RouteDefinition): DefinedRoute {
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
