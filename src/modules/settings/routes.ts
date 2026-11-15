// The person's settings. Every signed-in role may open them.
import { USER_ROLES } from "@/auth/roles";
import { createPageRoute } from "@/routing/page-route";

export const settingsRoutes = [
  createPageRoute({
    path: "/settings",
    access: USER_ROLES,
    page: () =>
      import("./pages/settings-page").then((file) => file.SettingsPage),
    titleKey: "nav.settings",
  }),
];
