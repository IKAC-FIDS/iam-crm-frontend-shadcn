import type { ReactNode } from "react"
import { uiText } from "@/config/uiText"
import { normalizeAppError } from "@/lib/appError"
import { ErrorState } from "./ErrorState"
import { LoadingState } from "./LoadingState"

/** Composes with tables, cards or lists; no columns or domain behavior belong here. */
export function QueryContent({
  query,
  children,
  errorTitle = uiText.common.table.loadError,
}: {
  query: {
    isLoading: boolean
    isError: boolean
    error: unknown
    refetch: () => unknown
  }
  children: ReactNode
  errorTitle?: string
}) {
  if (query.isLoading) return <LoadingState />
  if (query.isError)
    return (
      <ErrorState
        title={errorTitle}
        description={normalizeAppError(query.error).message}
        retryLabel={uiText.common.retry}
        onRetry={() => void query.refetch()}
      />
    )
  return <>{children}</>
}
