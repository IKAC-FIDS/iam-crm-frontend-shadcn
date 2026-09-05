import { create } from "zustand"
import { queryClient } from "@/lib/queryClient"
export interface AuthUser {
  id: string
  fullName: string
  email: string
  role: string
  team: string | null
  teamId: string | null
  teamCode: string | null
  teamName: string | null
  permissions: string[]
  organizationId: string | null
  roleId: string | null
  roleCode: string
  roleName: string
  avatarObjectKey: string | null
}
export type SessionStatus = "loading" | "authenticated" | "anonymous" | "error"
interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  status: SessionStatus
  revision: number
  setSession: (user: AuthUser, accessToken: string, replace?: boolean) => void
  setStatus: (status: SessionStatus) => void
  clearUser: () => void
  patchUser: (patch: Partial<AuthUser>) => void
}
function nullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null
}
export function normalizeAuthUser(value: unknown): AuthUser | null {
  if (!value || typeof value !== "object") return null
  const c = value as Record<string, unknown>
  if (
    typeof c.id !== "string" ||
    typeof c.fullName !== "string" ||
    typeof c.email !== "string" ||
    typeof c.role !== "string"
  )
    return null
  const permissions = Array.isArray(c.permissions)
    ? c.permissions.filter((p): p is string => typeof p === "string")
    : []
  const team = nullableString(c.team)
  return {
    id: c.id,
    fullName: c.fullName,
    email: c.email,
    role: c.role,
    team,
    teamId: nullableString(c.teamId),
    teamCode: nullableString(c.teamCode),
    teamName: nullableString(c.teamName) ?? team,
    permissions,
    organizationId: nullableString(c.organizationId),
    roleId: nullableString(c.roleId),
    roleCode: typeof c.roleCode === "string" ? c.roleCode : c.role,
    roleName: typeof c.roleName === "string" ? c.roleName : c.role,
    avatarObjectKey: nullableString(c.avatarObjectKey),
  }
}
export function removeLegacySessionStorage() {
  try {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("auth-storage")
  } catch {
    // Storage can be disabled; sessions do not depend on it.
  }
}
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  status: "loading",
  revision: 0,
  setSession: (user, accessToken, replace = true) =>
    set((state) => ({
      user,
      accessToken,
      status: "authenticated",
      revision: state.revision + Number(replace),
    })),
  setStatus: (status) => set({ status }),
  patchUser: (patch) => set((state) => ({ user: state.user ? { ...state.user, ...patch } : null })),
  clearUser: () => {
    removeLegacySessionStorage()
    queryClient.clear()
    set((state) => ({
      user: null,
      accessToken: null,
      status: "anonymous",
      revision: state.revision + 1,
    }))
  },
}))
