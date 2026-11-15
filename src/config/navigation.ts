// The menus of every role. Phones show `tabs` in the bottom bar, plus a "More" tab
// that opens `more`; laptops show both lists in the sidebar.
//
// Every item must point to a route its role may open: tests/project-rules/routes.test.ts checks it
//. A menu only hides things; the server decides access.
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
  home: string;
  /** The bottom bar on phones: at most 4, because "More" takes the 5th place. */
  tabs: readonly NavItem[];
  /** Behind "More" on phones, below the main items in the sidebar. */
  more: readonly NavItem[];
}

export const LOGIN_PATH = "/login";

/** The most tabs a phone bar shows before "More". */
export const MAX_TABS = 4;

const item = (path: string, labelKey: LangKey, icon: LucideIcon): NavItem => ({
  path,
  labelKey,
  icon,
});

const today = item("/today", "nav.today", CalendarCheck);
const plan = item("/plan", "nav.plan", Route);
const topics = item("/topics", "nav.topics", Layers);
const ask = item("/ask", "nav.ask", MessageCircleQuestionMark);
const profile = item("/profile", "nav.profile", CircleUser);
const settings = item("/settings", "nav.settings", Settings);
const join = item("/join", "nav.join", UserPlus);
const dashboard = item(
  "/organization/dashboard",
  "nav.dashboard",
  LayoutDashboard
);
const classes = item("/organization/classes", "nav.classes", School);
const members = item("/organization/members", "nav.members", UsersRound);
const requests = item("/organization/requests", "nav.requests", Inbox);
const invites = item("/organization/invites", "nav.invites", Mail);
const organizationSettings = item(
  "/organization/settings",
  "nav.organizationSettings",
  Building
);

export const NAVIGATION: Readonly<Record<UserRole, RoleNavigation>> = {
  INDIVIDUAL: {
    home: today.path,
    tabs: [today, plan, topics, ask],
    more: [profile, join, settings],
  },
  STUDENT: {
    home: today.path,
    tabs: [today, plan, topics, ask],
    more: [profile, settings],
  },
  TEACHER: {
    home: dashboard.path,
    tabs: [dashboard, classes],
    more: [profile, settings],
  },
  ORGANIZATION_ADMIN: {
    home: dashboard.path,
    tabs: [dashboard, classes, members, requests],
    more: [invites, organizationSettings, profile, settings],
  },
};

export function homeFor(role: UserRole): string {
  return NAVIGATION[role].home;
}

export const ROLE_LABEL_KEYS: Readonly<Record<UserRole, LangKey>> = {
  INDIVIDUAL: "roles.individual",
  STUDENT: "roles.student",
  TEACHER: "roles.teacher",
  ORGANIZATION_ADMIN: "roles.organizationAdmin",
};
