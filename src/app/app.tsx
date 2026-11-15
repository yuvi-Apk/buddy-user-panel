// The app's root component: the shared providers around the router, and the "new version ready"
// prompt of the service worker.
import { RouterProvider } from "react-router/dom";
import { queryClient } from "@/api/query-client";
import { UpdatePrompt } from "@/pwa/update-prompt";
import { Providers } from "./providers";
import type { AppRouter } from "./router";

export function App({ router }: { router: AppRouter }) {
  return (
    <Providers queryClient={queryClient}>
      <RouterProvider router={router} />
      <UpdatePrompt />
    </Providers>
  );
}
