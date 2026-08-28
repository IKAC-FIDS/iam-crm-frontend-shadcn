import { QueryClient } from "@tanstack/react-query"
import { normalizeAppError } from "./appError"

export const queryClient = new QueryClient({
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
