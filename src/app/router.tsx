// The browser router. When the person signs in or out (in this tab or another, or because a
// refresh was refused), the current route's loader runs again, so a signed-out person lands on
// /login and a new role lands on its own home.
import { createBrowserRouter } from "react-router";
import { sessionStore } from "@/lib/auth/session-store";
import { buildRoutes } from "./routes";

export function createAppRouter() {
  const router = createBrowserRouter(buildRoutes());

  sessionStore.subscribe((state, previous) => {
    // The first answer at start-up is awaited by the loaders themselves.
    if (previous.status === "restoring") return;
    if (
      state.status !== previous.status ||
      state.user?.role !== previous.user?.role
    ) {
      void router.revalidate();
    }
  });

  return router;
}

export type AppRouter = ReturnType<typeof createAppRouter>;
