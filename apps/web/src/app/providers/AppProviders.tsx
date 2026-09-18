import type { ReactNode } from "react"

import { QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"

import { TooltipProvider } from "@workspace/ui/components/tooltip"

import { queryClient } from "@/lib/queryClient"
import { SessionBoundary } from "@/features/auth/components/SessionBoundary"
import { ThemeProvider, useTheme } from "@/components/theme-provider"

type AppProvidersProps = {
  children: ReactNode
}

function AppToaster() {
  const { theme } = useTheme()
  return <Toaster richColors position="top-center" dir="rtl" theme={theme} />
}

export function AppProviders({
  children,
}: AppProvidersProps) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="iam-crm-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SessionBoundary>{children}</SessionBoundary>
          <AppToaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
