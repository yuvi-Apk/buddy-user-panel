// Screens for an Organization's teachers and admins. Teachers see only their own classes; the server enforces it.
import { STAFF_ROLES } from "@/auth/roles";
import { defineRoute } from "@/routing/define-route";

export const organizationManagementRoutes = [
  defineRoute({
    path: "/organization/dashboard",
    access: STAFF_ROLES,
    page: () =>
      import("./pages/dashboard-page").then((file) => file.DashboardPage),
    titleKey: "nav.dashboard",
  }),
  defineRoute({
    path: "/organization/classes",
    access: STAFF_ROLES,
    page: () => import("./pages/classes-page").then((file) => file.ClassesPage),
    titleKey: "nav.classes",
  }),
  defineRoute({
    path: "/organization/classes/:classId",
    access: STAFF_ROLES,
    page: () =>
      import("./pages/class-detail-page").then((file) => file.ClassDetailPage),
    titleKey: "pages.classDetail",
  }),
  defineRoute({
    path: "/organization/students/:studentId",
    access: STAFF_ROLES,
    page: () =>
      import("./pages/student-detail-page").then(
        (file) => file.StudentDetailPage
      ),
    titleKey: "pages.studentDetail",
  }),
  defineRoute({
    path: "/organization/members",
    access: ["ORGANIZATION_ADMIN"],
    page: () => import("./pages/members-page").then((file) => file.MembersPage),
    titleKey: "nav.members",
  }),
  defineRoute({
    path: "/organization/invites",
    access: ["ORGANIZATION_ADMIN"],
    page: () => import("./pages/invites-page").then((file) => file.InvitesPage),
    titleKey: "nav.invites",
  }),
  defineRoute({
    path: "/organization/requests",
    access: ["ORGANIZATION_ADMIN"],
    page: () =>
      import("./pages/requests-page").then((file) => file.RequestsPage),
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
