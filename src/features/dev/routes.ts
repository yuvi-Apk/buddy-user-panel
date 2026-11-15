// Tools for building the app, in dev builds only. The literal `import.meta.env.DEV` check lets
// the bundler drop these pages from production entirely: they are not even downloaded.
import { defineRoute } from "@/lib/routing/define-route";

export const devRoutes = import.meta.env.DEV
  ? [
      defineRoute({
        path: "/dev/ui",
        access: "public",
        page: () =>
          import("./pages/ui-gallery-page").then((m) => m.UiGalleryPage),
        titleKey: "pages.devUi",
      }),
      defineRoute({
        path: "/dev/session",
        access: "public",
        page: () =>
          import("./pages/dev-session-page").then((m) => m.DevSessionPage),
        titleKey: "pages.devSession",
      }),
    ]
  : [];
