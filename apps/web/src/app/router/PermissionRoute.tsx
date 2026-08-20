import { Navigate, Outlet, useLocation } from "react-router-dom"
import { canAccessRoute } from "@/app/navigation/routeAccess"
import type { RouteAccessPolicy } from "@/app/navigation/routeRegistry"
import { useAuthStore } from "@/store/authStore"

export function PermissionRoute({ policy }: { policy: RouteAccessPolicy }) {
  const user = useAuthStore((state) => state.user); const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (!canAccessRoute(user, policy)) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
