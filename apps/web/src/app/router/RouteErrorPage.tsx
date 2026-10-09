import { isRouteErrorResponse, useRouteError } from "react-router-dom"
import { useEffect } from "react"
import { normalizeAppError } from "@/lib/appError"
import { observability } from "@/lib/observability"
import { AppErrorPage } from "./AppErrorPage"
export function RouteErrorPage() {
  const error = useRouteError()
  const normalized = normalizeAppError(error)
  const status = isRouteErrorResponse(error) ? error.status : normalized.status
  useEffect(() => {
    observability.captureError(error, { source: "route-boundary", status })
  }, [error, status])
  return (
    <AppErrorPage
      status={status}
      message={
        status === 403 || status === 404 ? undefined : normalized.message
      }
      onRetry={() => window.location.reload()}
    />
  )
}
