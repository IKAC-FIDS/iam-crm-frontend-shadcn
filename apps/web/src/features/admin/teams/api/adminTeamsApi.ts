import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"

export type TeamManager = {
  id: string
  fullName: string
  email: string
  role: string
  team?: string | null
  teamId?: string | null
}

export type Team = {
  id: string
  code: string
  name: string
  description?: string | null
  managerId?: string | null
  manager?: TeamManager | null
  memberCount: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export type TeamMember = {
  id: string
  fullName: string
  email: string
  role: string
  team?: string | null
  teamId?: string | null
  isActive: boolean
  teamRef?: {
    id: string
    code: string
    name: string
  } | null
}

export type PageMeta = {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export type TeamFilters = {
  page: number
  limit: number
  search?: string
  isActive?: boolean
  includeInactive?: boolean
  managerId?: string
}

export type AdminUser = {
  id: string
  fullName: string
  email: string
  role: string
  isActive: boolean
  teamId?: string | null
  team?: string | null
}

export type AuditLog = {
  id: string
  action?: string
  entityType?: string
  entityId?: string
  createdAt?: string
  actor?: { id?: string; fullName?: string; email?: string } | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function normalizePage<T>(value: unknown): { data: T[]; meta: PageMeta } {
  if (
    isRecord(value) &&
    Array.isArray(value.data) &&
    value.meta &&
    typeof value.meta === "object"
  ) {
    return {
      data: value.data as T[],
      meta: value.meta as PageMeta,
    }
  }

  const unwrapped = unwrapApiResponse<unknown>(value)

  if (Array.isArray(unwrapped)) {
    return {
      data: unwrapped as T[],
      meta: {
        total: unwrapped.length,
        page: 1,
        limit: unwrapped.length || 20,
        totalPages: unwrapped.length ? 1 : 0,
        hasNext: false,
        hasPrevious: false,
      },
    }
  }

  return {
    data: [],
    meta: {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    },
  }
}

export async function getTeams(filters: TeamFilters) {
  const params: Record<string, string | number | boolean> = {
    page: filters.page,
    limit: filters.limit,
  }

  if (filters.search?.trim()) params.search = filters.search.trim()
  if (filters.isActive !== undefined) params.isActive = filters.isActive
  if (filters.includeInactive !== undefined) params.includeInactive = filters.includeInactive
  if (filters.managerId) params.managerId = filters.managerId

  const response = await api.get("/teams", { params })
  return normalizePage<Team>(response.data)
}

export async function getTeam(id: string) {
  const response = await api.get(`/teams/${id}`)
  return unwrapApiResponse<Team>(response.data)
}

export async function createTeam(payload: {
  code: string
  name: string
  description?: string
  managerId?: string
}) {
  const response = await api.post("/teams", payload)
  return unwrapApiResponse<Team>(response.data)
}

export async function updateTeam(
  id: string,
  payload: {
    code?: string
    name?: string
    description?: string | null
    managerId?: string | null
    isActive?: boolean
  },
) {
  const response = await api.patch(`/teams/${id}`, payload)
  return unwrapApiResponse<Team>(response.data)
}

export async function activateTeam(id: string) {
  const response = await api.patch(`/teams/${id}/activate`)
  return unwrapApiResponse<Team>(response.data)
}

export async function deactivateTeam(id: string) {
  const response = await api.patch(`/teams/${id}/deactivate`)
  return unwrapApiResponse<Team>(response.data)
}

export async function getTeamMembers(id: string) {
  const response = await api.get(`/teams/${id}/members`)
  return unwrapApiResponse<TeamMember[]>(response.data)
}

export async function addTeamMember(id: string, userId: string) {
  const response = await api.post(`/teams/${id}/members`, { userId })
  return unwrapApiResponse<TeamMember>(response.data)
}

export async function removeTeamMember(id: string, userId: string) {
  const response = await api.delete(`/teams/${id}/members/${userId}`)
  return unwrapApiResponse<TeamMember>(response.data)
}

export async function getAllUsers() {
  const response = await api.get("/users", {
    params: { page: 1, limit: 100 },
  })
  return normalizePage<AdminUser>(response.data).data
}

export async function getTeamAuditLogs(teamId: string) {
  const response = await api.get("/admin/audit-logs", {
    params: {
      page: 1,
      limit: 20,
      entityType: "team",
      entityId: teamId,
      sortBy: "createdAt",
      sortOrder: "desc",
      compact: true,
    },
  })
  return normalizePage<AuditLog>(response.data).data
}
