// Tools for building the app, in dev builds only. The literal `import.meta.env.DEV` check lets
// the bundler drop these pages from production entirely: they are not even downloaded.
import { defineRoute } from "@/routing/define-route";

export const devRoutes = import.meta.env.DEV
  ? [
      defineRoute({
        path: "/dev/ui",
        access: "public",
        page: () =>
          import("./pages/ui-gallery-page").then((file) => file.UiGalleryPage),
        titleKey: "pages.devUi",
      }),
      defineRoute({
        path: "/dev/session",
        access: "public",
        page: () =>
          import("./pages/dev-session-page").then(
            (file) => file.DevSessionPage
          ),
        titleKey: "pages.devSession",
      }),
    ]
  : [];
