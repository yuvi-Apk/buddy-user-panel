// @vitest-environment jsdom
// (The route tree imports screens, and the theme store reads the window when it loads.)
// every route declares its access, and every menu item points to a route its role
// may open. Reads the real route tree (src/app/router.ts) and menus (src/config/navigation.ts).
import type { RouteObject } from "react-router";
import { describe, expect, it } from "vitest";
import { appRoutes, buildRoutes } from "@/app/router";
import { MAX_TABS, NAVIGATION } from "@/config/navigation";
import en from "@/lang/en.json";
import { textAt } from "@/lang";
import { USER_ROLES } from "@/auth/roles";
import { canOpen } from "@/routing/route-access";
import { isRouteHandle } from "@/routing/define-route";

/** Every route that matches a URL (has a path or is an index), with where it sits. */
function pageRoutes(
  routes: RouteObject[],
  trail = ""
): Array<{ where: string; route: RouteObject }> {
  return routes.flatMap((route) => {
    const where = `${trail}/${route.path ?? (route.index ? "(index)" : "(layout)")}`;
    const self =
      route.path !== undefined || route.index ? [{ where, route }] : [];
    return [...self, ...pageRoutes(route.children ?? [], where)];
  });
}

const tree = buildRoutes();

describe("routes", () => {
  it("every route that opens a page declares access and a title", () => {
    const missing = pageRoutes(tree)
      .filter(({ route }) => !isRouteHandle(route.handle))
      .map(({ where }) => where);
    expect(missing, "Build these routes with defineRoute").toEqual([]);
  });

  it("no two pages share a path", () => {
    const paths = appRoutes.map((route) => route.path);
    const repeated = paths.filter(
      (path, index) => paths.indexOf(path) !== index
    );
    expect(repeated).toEqual([]);
  });

  it("only role pages use the shell (it needs a signed-in person)", () => {
    const wrong = appRoutes
      .filter(
        (route) => route.layout === "shell" && typeof route.access === "string"
      )
      .map((route) => route.path);
    expect(wrong).toEqual([]);
  });

  it("no page is open to an empty list of roles", () => {
    const empty = appRoutes
      .filter(
        (route) => typeof route.access !== "string" && route.access.length === 0
      )
      .map((route) => route.path);
    expect(empty).toEqual([]);
  });

  it("every title is a sentence in en.json", () => {
    const unknown = appRoutes
      .filter((route) => textAt(en, route.titleKey) === route.titleKey)
      .map((route) => `${route.path}: ${route.titleKey}`);
    expect(unknown).toEqual([]);
  });
});

describe("navigation", () => {
  const byPath = new Map(appRoutes.map((route) => [route.path, route]));

  it.each(USER_ROLES)(
    "every %s menu item opens a page that role may open",
    (role) => {
      const { home, tabs, more } = NAVIGATION[role];
      const problems = [
        home,
        ...[...tabs, ...more].map((item) => item.path),
      ].flatMap((path) => {
        const route = byPath.get(path);
        if (!route) return [`${path}: no such route`];
        return canOpen(route.access, role)
          ? []
          : [`${path}: ${role} may not open it`];
      });
      expect(problems).toEqual([]);
    }
  );

  it.each(USER_ROLES)(
    "%s has at most %i tabs before More, and no item twice",
    (role) => {
      const { tabs, more } = NAVIGATION[role];
      expect(tabs.length).toBeLessThanOrEqual(MAX_TABS);
      const paths = [...tabs, ...more].map((item) => item.path);
      expect(new Set(paths).size).toBe(paths.length);
    }
  );

  it("every menu label is a sentence in en.json", () => {
    const unknown = USER_ROLES.flatMap((role) =>
      [...NAVIGATION[role].tabs, ...NAVIGATION[role].more]
        .filter((item) => textAt(en, item.labelKey) === item.labelKey)
        .map((item) => `${role} ${item.path}: ${item.labelKey}`)
    );
    expect(unknown).toEqual([]);
  });
});
