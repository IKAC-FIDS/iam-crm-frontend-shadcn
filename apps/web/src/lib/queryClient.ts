import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query"
import { normalizeAppError } from "./appError"
import { observability } from "./observability"

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) =>
      observability.captureError(error, {
        source: "query",
        queryKey: query.queryKey,
      }),
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) =>
      observability.captureError(error, {
        source: "mutation",
        mutationKey: mutation.options.mutationKey,
      }),
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (count, error) => count < 1 && normalizeAppError(error).retryable,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})
