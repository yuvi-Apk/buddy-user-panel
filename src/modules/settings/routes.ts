// The person's settings. Every signed-in role may open them.
import { USER_ROLES } from "@/auth/roles";
import { defineRoute } from "@/routing/define-route";

export const settingsRoutes = [
  defineRoute({
    path: "/settings",
    access: USER_ROLES,
    page: () =>
      import("./pages/settings-page").then((file) => file.SettingsPage),
    titleKey: "nav.settings",
  }),
];
