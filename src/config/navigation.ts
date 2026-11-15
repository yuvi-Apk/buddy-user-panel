// The menus of every role. Phones show `tabs` in the bottom bar, plus a "More" tab
// that opens `more`; laptops show both lists in the sidebar.
//
// Every item must point to a route its role may open: tests/project-rules/routes.test.ts checks it.
// A menu only hides things; the server decides access.
import {
  Building,
  CalendarCheck,
  CircleUser,
  Inbox,
  Layers,
  LayoutDashboard,
  type LucideIcon,
  Mail,
  MessageCircleQuestionMark,
  Route,
  School,
  Settings,
  UserPlus,
  UsersRound,
} from "lucide-react";
import type { LangKey } from "@/lang";
import type { UserRole } from "@/auth/roles";

export interface NavItem {
  path: string;
  labelKey: LangKey;
  icon: LucideIcon;
}

export interface RoleNavigation {
  /** Where the role lands after login, and where a page it may not open sends it. */
  homePath: string;
  /** The bottom bar on phones: at most 4, because "More" takes the 5th place. */
  tabs: readonly NavItem[];
  /** Behind "More" on phones, below the main items in the sidebar. */
  more: readonly NavItem[];
}

export const LOGIN_PATH = "/login";

/** The most tabs a phone bar shows before "More". */
export const MAX_BOTTOM_TABS = 4;

const createNavItem = (
  path: string,
  labelKey: LangKey,
  icon: LucideIcon
): NavItem => ({
  path,
  labelKey,
  icon,
});

const today = createNavItem("/today", "nav.today", CalendarCheck);
const plan = createNavItem("/plan", "nav.plan", Route);
const topics = createNavItem("/topics", "nav.topics", Layers);
const ask = createNavItem("/ask", "nav.ask", MessageCircleQuestionMark);
const profile = createNavItem("/profile", "nav.profile", CircleUser);
const settings = createNavItem("/settings", "nav.settings", Settings);
const join = createNavItem("/join", "nav.join", UserPlus);
const dashboard = createNavItem(
  "/organization/dashboard",
  "nav.dashboard",
  LayoutDashboard
);
const classes = createNavItem("/organization/classes", "nav.classes", School);
const members = createNavItem(
  "/organization/members",
  "nav.members",
  UsersRound
);
const requests = createNavItem("/organization/requests", "nav.requests", Inbox);
const invites = createNavItem("/organization/invites", "nav.invites", Mail);
const organizationSettings = createNavItem(
  "/organization/settings",
  "nav.organizationSettings",
  Building
);

export const NAVIGATION_BY_ROLE: Readonly<Record<UserRole, RoleNavigation>> = {
  INDIVIDUAL: {
    homePath: today.path,
    tabs: [today, plan, topics, ask],
    more: [profile, join, settings],
  },
  STUDENT: {
    homePath: today.path,
    tabs: [today, plan, topics, ask],
    more: [profile, settings],
  },
  TEACHER: {
    homePath: dashboard.path,
    tabs: [dashboard, classes],
    more: [profile, settings],
  },
  ORGANIZATION_ADMIN: {
    homePath: dashboard.path,
    tabs: [dashboard, classes, members, requests],
    more: [invites, organizationSettings, profile, settings],
  },
};

export function getHomePathForRole(role: UserRole): string {
  return NAVIGATION_BY_ROLE[role].homePath;
}

export const ROLE_LABEL_KEYS: Readonly<Record<UserRole, LangKey>> = {
  INDIVIDUAL: "roles.individual",
  STUDENT: "roles.student",
  TEACHER: "roles.teacher",
  ORGANIZATION_ADMIN: "roles.organizationAdmin",
};
