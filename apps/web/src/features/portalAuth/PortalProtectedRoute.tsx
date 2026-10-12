import { Navigate, Outlet, useLocation } from "react-router-dom"
import { usePortalAuthStore } from "./portalAuth.store"
export function PortalProtectedRoute() {
  const status = usePortalAuthStore((s) => s.status), location = useLocation()
  if (status === "selection") return <Navigate to="/portal/select-company" replace />
  if (status !== "authenticated") return <Navigate to="/portal/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}
