// The app's root component: the shared providers around the router.
import { RouterProvider } from "react-router/dom";
import { queryClient } from "@/lib/api/query-client";
import { Providers } from "./providers";
import type { AppRouter } from "./router";

export function App({ router }: { router: AppRouter }) {
  return (
    <Providers queryClient={queryClient}>
      <RouterProvider router={router} />
    </Providers>
  );
}
