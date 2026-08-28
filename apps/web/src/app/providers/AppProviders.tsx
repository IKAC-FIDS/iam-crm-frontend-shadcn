import type { ReactNode } from "react"

import { QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"

import { TooltipProvider } from "@workspace/ui/components/tooltip"

import { queryClient } from "@/lib/queryClient"
import { SessionBoundary } from "@/features/auth/components/SessionBoundary"

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({
  children,
}: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SessionBoundary>{children}</SessionBoundary>
        <Toaster
          richColors
          position="top-center"
          dir="rtl"
        />
      </TooltipProvider>
    </QueryClientProvider>
  )
}
