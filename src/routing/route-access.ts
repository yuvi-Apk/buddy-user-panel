// Who may open a route. This only picks the screen; the server enforces access.
//
//   "public"               anyone (an email link, the 404 page)
//   "guest"                signed-out people only (login, sign-up); signed-in people go home
//   ["TEACHER", ...]       these roles only: signed out → /login?redirect=…, wrong role → home
import { homeFor, LOGIN_PATH } from "@/config/navigation";
import type { UserRole } from "@/auth/roles";
import type { SessionState } from "@/auth/session-store";
import { safeRedirect } from "@/utils/safe-redirect";

export type RouteAccess = "public" | "guest" | readonly UserRole[];

/** Where to send the person instead, or null when they may open the page. */
export function getRedirectPathIfBlocked(
  access: RouteAccess,
  session: SessionState,
  url: URL
): string | null {
  if (access === "public") return null;

  const role = session.status === "signed-in" ? session.user?.role : undefined;

  if (access === "guest") {
    if (!role) return null;
    return safeRedirect(url.searchParams.get("redirect"), homeFor(role));
  }

  if (!role) return buildLoginPathWithReturn(url);
  return access.includes(role) ? null : homeFor(role);
}

/** "/login?redirect=%2Fplan%3Fweek%3D2", so login brings the person returnPath where they were. */
export function buildLoginPathWithReturn(url: URL): string {
  const returnPath = `${url.pathname}${url.search}${url.hash}`;
  if (returnPath === "/" || returnPath.startsWith(LOGIN_PATH))
    return LOGIN_PATH;
  return `${LOGIN_PATH}?${new URLSearchParams({ redirect: returnPath }).toString()}`;
}

export function canRoleOpenRoute(access: RouteAccess, role: UserRole): boolean {
  if (access === "public") return true;
  if (access === "guest") return false;
  return access.includes(role);
}
