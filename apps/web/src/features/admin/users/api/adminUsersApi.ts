import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"

export const USER_ROLES = ["ADMIN", "MANAGER", "REP", "BOARDS"] as const
export type UserRole = (typeof USER_ROLES)[number]
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "ادمین",
  MANAGER: "مدیر فروش",
  REP: "کارشناس فروش",
  BOARDS: "برد / مشاهده‌گر",
}

export type AdminUser = {
  id: string
  fullName: string
  email: string
  role: UserRole
  roleId?: string | null
  assignedRole?: { id: string; code: string; name: string; baseRole: UserRole; isSystem?: boolean; isActive?: boolean } | null
  team?: string | null
  teamId?: string | null
  teamRef?: { id: string; code: string; name: string; isActive?: boolean } | null
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export type PageMeta = { total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrevious: boolean }
export type Team = { id: string; code: string; name: string; isActive?: boolean }
export type Role = { id: string; code: string; name: string; baseRole: UserRole; isSystem?: boolean; isActive?: boolean; _count?: { users?: number; permissions?: number } }
export type RolePermissions = { role: { id: string; code: string; name: string }; assignedPermissionIds: string[]; assignedActions: string[] }
export type AuditLog = { id: string; action?: string; createdAt?: string; actorId?: string | null }
export type QuotaSummary = { metrics?: Array<{ metric: string; current: string; softLimit: string | null; hardLimit: string | null; threshold?: number | null }> }
export type UserFilters = { page: number; limit: number; search?: string; role?: UserRole; teamId?: string; isActive?: boolean }

function rec(v: unknown): Record<string, unknown> | null { return v && typeof v === "object" ? v as Record<string, unknown> : null }
function page<T>(value: unknown): { data: T[]; meta: PageMeta } {
  const v = unwrapApiResponse<unknown>(value)
  const r = rec(v)
  if (r && Array.isArray(r.data) && r.meta && typeof r.meta === "object") return { data: r.data as T[], meta: r.meta as PageMeta }
  if (Array.isArray(v)) return { data: v as T[], meta: { total: v.length, page: 1, limit: v.length || 20, totalPages: 1, hasNext: false, hasPrevious: false } }
  return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0, hasNext: false, hasPrevious: false } }
}

export async function getUsers(filters: UserFilters) {
  const params: Record<string, string | number | boolean> = { page: filters.page, limit: filters.limit }
  if (filters.search?.trim()) params.search = filters.search.trim()
  if (filters.role) params.role = filters.role
  if (filters.teamId) params.teamId = filters.teamId
  if (filters.isActive !== undefined) params.isActive = filters.isActive
  const response = await api.get("/users", { params })
  return page<AdminUser>(response.data)
}
export async function getUser(id: string) { const r = await api.get(`/users/${id}`); return unwrapApiResponse<AdminUser>(r.data) }
export async function createUser(payload: { fullName: string; email: string; password: string; role: UserRole; teamId?: string }) { const r = await api.post("/users", payload); return unwrapApiResponse<AdminUser>(r.data) }
export async function updateUserRole(id: string, payload: { role?: UserRole; roleId?: string; teamId?: string | null }) { const r = await api.patch(`/users/${id}/role`, payload); return unwrapApiResponse<AdminUser>(r.data) }
export async function activateUser(id: string) { const r = await api.patch(`/users/${id}/activate`); return unwrapApiResponse<AdminUser>(r.data) }
export async function deactivateUser(id: string) { const r = await api.patch(`/users/${id}/deactivate`); return unwrapApiResponse<AdminUser>(r.data) }
export async function getTeams() { const r = await api.get("/teams", { params: { page: 1, limit: 100, isActive: true } }); return page<Team>(r.data).data }
export async function getRoles() { const r = await api.get("/roles"); const v = unwrapApiResponse<unknown>(r.data); return Array.isArray(v) ? v as Role[] : [] }
export async function getRolePermissions(roleId: string) { const r = await api.get(`/roles/${roleId}/permissions`); return unwrapApiResponse<RolePermissions>(r.data) }
export async function getUserAuditLogs(userId: string) { const r = await api.get("/admin/audit-logs", { params: { page: 1, limit: 8, entityType: "user", entityId: userId, sortBy: "createdAt", sortOrder: "desc", compact: true } }); return page<AuditLog>(r.data).data }
export async function getQuotaSummary() { const r = await api.get("/quota/current"); return unwrapApiResponse<QuotaSummary>(r.data) }
