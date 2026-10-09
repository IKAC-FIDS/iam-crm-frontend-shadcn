import type { AuthUser } from "@/store/authStore"
import type { RouteAccessPolicy } from "./routeRegistry"

function hasPermission(user: AuthUser, permission: string) {
  return user.permissions.includes(permission)
}

export function canAccessRoute(user: AuthUser | null | undefined, policy: RouteAccessPolicy) {
  if (!user) return false
  if (policy.type === "authenticated") return true
  return policy.mode === "all"
    ? policy.permissions.every((permission) => hasPermission(user, permission))
    : policy.permissions.some((permission) => hasPermission(user, permission))
}
