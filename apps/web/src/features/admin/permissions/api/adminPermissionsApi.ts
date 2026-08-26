import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"

export type UserRole = "ADMIN" | "MANAGER" | "REP" | "BOARDS"

export type ManagedPermission = {
  id: string
  action: string
  name?: string | null
  description?: string | null
  group?: string | null
  isActive: boolean
  isSystem: boolean
  createdAt?: string
  updatedAt?: string
}

export type ManagedRole = {
  id: string
  code: string
  name: string
  description?: string | null
  baseRole: UserRole
  scope?: string
  isSystem: boolean
  isActive: boolean
  _count?: {
    users?: number
    permissions?: number
  }
}

export type RolePermissions = {
  role: {
    id: string
    code: string
    name: string
  }
  assignedPermissionIds: string[]
  assignedActions: string[]
  permissions: Array<ManagedPermission & { assigned: boolean }>
}

export async function getPermissions() {
  const response = await api.get("/permissions")
  return unwrapApiResponse<ManagedPermission[]>(response.data)
}

export async function getPermission(id: string) {
  const response = await api.get(`/permissions/${id}`)
  return unwrapApiResponse<ManagedPermission>(response.data)
}

export async function createPermission(payload: {
  action: string
  name?: string
  description?: string
  group?: string
  isActive?: boolean
}) {
  const response = await api.post("/permissions", payload)
  return unwrapApiResponse<ManagedPermission>(response.data)
}

export async function updatePermission(
  id: string,
  payload: {
    action?: string
    name?: string
    description?: string
    group?: string
    isActive?: boolean
  },
) {
  const response = await api.patch(`/permissions/${id}`, payload)
  return unwrapApiResponse<ManagedPermission>(response.data)
}

export async function deletePermission(id: string) {
  const response = await api.delete(`/permissions/${id}`)
  return unwrapApiResponse<ManagedPermission>(response.data)
}

export async function getRoles() {
  const response = await api.get("/roles")
  return unwrapApiResponse<ManagedRole[]>(response.data)
}

export async function getRole(id: string) {
  const response = await api.get(`/roles/${id}`)
  return unwrapApiResponse<ManagedRole>(response.data)
}

export async function updateRole(
  id: string,
  payload: {
    name?: string
    description?: string
    baseRole?: UserRole
    isActive?: boolean
  },
) {
  const response = await api.patch(`/roles/${id}`, payload)
  return unwrapApiResponse<ManagedRole>(response.data)
}

export async function deleteRole(id: string) {
  const response = await api.delete(`/roles/${id}`)
  return unwrapApiResponse<ManagedRole>(response.data)
}

export async function getRolePermissions(id: string) {
  const response = await api.get(`/roles/${id}/permissions`)
  return unwrapApiResponse<RolePermissions>(response.data)
}

export async function replaceRolePermissions(id: string, permissionIds: string[]) {
  const response = await api.put(`/roles/${id}/permissions`, { permissionIds })
  return unwrapApiResponse<RolePermissions>(response.data)
}
