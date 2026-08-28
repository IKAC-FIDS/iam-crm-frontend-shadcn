import { isRouteErrorResponse, useRouteError } from "react-router-dom"
import { normalizeAppError } from "@/lib/appError"
import { AppErrorPage } from "./AppErrorPage"
export function RouteErrorPage() {
  const error = useRouteError()
  const normalized = normalizeAppError(error)
  const status = isRouteErrorResponse(error) ? error.status : normalized.status
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
