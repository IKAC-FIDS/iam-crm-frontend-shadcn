import { create } from "zustand"
import { persist } from "zustand/middleware"
import { queryClient } from "@/lib/queryClient"
export interface AuthUser {
  id: string; fullName: string; email: string; role: string; team: string | null;
  teamId: string | null; teamCode: string | null; teamName: string | null;
  permissions: string[]; organizationId: string | null; roleId: string | null;
  roleCode: string; roleName: string;
}
interface AuthState { user: AuthUser | null; setUser: (user: AuthUser) => void; clearUser: () => void }
function nullableString(value: unknown): string | null { return typeof value === "string" ? value : null }
export function normalizeAuthUser(value: unknown): AuthUser | null {
  if (!value || typeof value !== "object") return null
  const c = value as Record<string, unknown>
  if (typeof c.id !== "string" || typeof c.fullName !== "string" || typeof c.email !== "string" || typeof c.role !== "string") return null
  const permissions = Array.isArray(c.permissions) ? c.permissions.filter((p): p is string => typeof p === "string") : []
  const team = nullableString(c.team)
  return { id:c.id, fullName:c.fullName, email:c.email, role:c.role, team,
    teamId:nullableString(c.teamId), teamCode:nullableString(c.teamCode), teamName:nullableString(c.teamName) ?? team,
    permissions, organizationId:nullableString(c.organizationId), roleId:nullableString(c.roleId),
    roleCode:typeof c.roleCode === "string" ? c.roleCode : c.role,
    roleName:typeof c.roleName === "string" ? c.roleName : c.role }
}
function migrate(value: unknown): Pick<AuthState,"user"> {
  if (!value || typeof value !== "object") return { user:null }
  return { user: normalizeAuthUser((value as Record<string,unknown>).user) }
}
export const useAuthStore = create<AuthState>()(persist((set)=>({
  user:null,
  setUser:(user)=>set({user}),
  clearUser:()=>{ localStorage.removeItem("accessToken"); queryClient.clear(); set({user:null}) },
}),{ name:"auth-storage", version:2, migrate:(s)=>migrate(s), merge:(s,c)=>({...c,...migrate(s)}) }))