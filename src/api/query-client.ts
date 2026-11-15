// TanStack Query, set up once:
//   - data counts as fresh for 30 seconds, and refreshes when the person comes back to the tab
//   - no retry on 4xx (the request itself was refused); at most 2 retries on 5xx or network errors
//   - requests wait while offline (networkMode "online") and run once the connection is back
//   - a failed mutation shows a toast, unless the form shows field errors or `meta.toast` is false
import { MutationCache, QueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui";
import { getLang } from "@/lang";
import { getErrorMessage, isApiError } from "./api-error";

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      /** false: the screen shows the error itself, so no toast. */
      toast?: boolean;
    };
  }
}

const MAX_RETRIES = 2;

export function shouldRetryQuery(
  failureCount: number,
  error: unknown
): boolean {
  if (failureCount >= MAX_RETRIES) return false;
  if (!isApiError(error)) return false;
  if (error.kind === "http") return error.status >= 500;
  return error.kind === "network" || error.kind === "timeout";
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: shouldRetryQuery,
        refetchOnWindowFocus: true,
        networkMode: "online",
      },
      mutations: { retry: false, networkMode: "online" },
    },
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (mutation.meta?.toast === false) return;
        if (isApiError(error) && error.hasFieldErrors) return;
        toast({
          title: getLang().errors.toastTitle,
          description: getErrorMessage(error),
          tone: "destructive",
        });
      },
    }),
  });
}

/** The app's one query client. Signing out and every membership change clear it. */
export const queryClient = createQueryClient();
