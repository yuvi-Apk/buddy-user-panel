// Reads the access and title that defineRoute keeps on each route's handle.
import { useMatches } from "react-router";
import type { LangKey } from "@/lang";
import type { RouteHandle } from "./define-route";

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
