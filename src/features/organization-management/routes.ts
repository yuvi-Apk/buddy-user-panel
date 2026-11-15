// Screens for an Organization's teachers and admins. Teachers see only their own classes; the server enforces it.
import { STAFF_ROLES } from "@/lib/auth/roles";
import { defineRoute } from "@/lib/routing/define-route";

export const organizationManagementRoutes = [
  defineRoute({
    path: "/organization/dashboard",
    access: STAFF_ROLES,
    page: () => import("./pages/dashboard-page").then((m) => m.DashboardPage),
    titleKey: "nav.dashboard",
  }),
  defineRoute({
    path: "/organization/classes",
    access: STAFF_ROLES,
    page: () => import("./pages/classes-page").then((m) => m.ClassesPage),
    titleKey: "nav.classes",
  }),
  defineRoute({
    path: "/organization/classes/:classId",
    access: STAFF_ROLES,
    page: () =>
      import("./pages/class-detail-page").then((m) => m.ClassDetailPage),
    titleKey: "pages.classDetail",
  }),
  defineRoute({
    path: "/organization/students/:studentId",
    access: STAFF_ROLES,
    page: () =>
      import("./pages/student-detail-page").then((m) => m.StudentDetailPage),
    titleKey: "pages.studentDetail",
  }),
  defineRoute({
    path: "/organization/members",
    access: ["ORGANIZATION_ADMIN"],
    page: () => import("./pages/members-page").then((m) => m.MembersPage),
    titleKey: "nav.members",
  }),
  defineRoute({
    path: "/organization/invites",
    access: ["ORGANIZATION_ADMIN"],
    page: () => import("./pages/invites-page").then((m) => m.InvitesPage),
    titleKey: "nav.invites",
  }),
  defineRoute({
    path: "/organization/requests",
    access: ["ORGANIZATION_ADMIN"],
    page: () => import("./pages/requests-page").then((m) => m.RequestsPage),
    titleKey: "nav.requests",
  }),
  defineRoute({
    path: "/organization/settings",
    access: ["ORGANIZATION_ADMIN"],
    page: () =>
      import("./pages/organization-settings-page").then(
        (m) => m.OrganizationSettingsPage
      ),
    titleKey: "nav.organizationSettings",
  }),
];
