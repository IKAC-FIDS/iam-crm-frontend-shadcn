import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"

export type AuditActor = { id: string; fullName: string | null; email: string | null }
export type AuditRequest = { requestId: string | null; ipAddress: string | null; userAgent: string | null; method: string | null; path: string | null }
export type AuditLog = {
  id: string
  organizationId: string | null
  actorId: string | null
  actor: AuditActor | null
  entityType: string
  entityId: string | null
  action: string
  scope: string
  actorType: string | null
  actorMembershipId: string | null
  source: string | null
  result: string | null
  durationMs: number | null
  errorCode: string | null
  createdAt: string
  changedFields: string[]
  request: AuditRequest
  before?: unknown
  after?: unknown
  metadata?: unknown
}
export type AuditLogParams = {
  page?: number; limit?: number; actorId?: string; entityType?: string; entityId?: string
  action?: string; source?: string; result?: string; requestId?: string; ipAddress?: string
  requestMethod?: string; requestPath?: string; search?: string; startDate?: string; endDate?: string
  compact?: boolean; sortBy?: "createdAt" | "durationMs"; sortOrder?: "asc" | "desc"
}
export type AuditMeta = { total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrevious: boolean }
export type AuditSummary = {
  period: { startDate: string | null; endDate: string | null }
  totalEvents: number; uniqueActors: number
  byAction: Array<{ action: string; count: number }>
  byEntityType: Array<{ entityType: string; count: number }>
  byActor: Array<{ actorId: string | null; actorName: string; count: number }>
  trend: Array<{ periodStart: string; periodEnd: string; count: number }>
}
export type AuditFilterOptions = { actors: AuditActor[]; entityTypes: string[]; actions: string[]; requestMethods: string[] }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function paginatedAuditResponse(value: unknown): { data: AuditLog[]; meta: AuditMeta } {
  if (isRecord(value) && Array.isArray(value.data) && isRecord(value.meta)) {
    return { data: value.data as AuditLog[], meta: value.meta as AuditMeta }
  }

  const unwrapped = unwrapApiResponse<unknown>(value)
  if (isRecord(unwrapped) && Array.isArray(unwrapped.data) && isRecord(unwrapped.meta)) {
    return { data: unwrapped.data as AuditLog[], meta: unwrapped.meta as AuditMeta }
  }

  const data = Array.isArray(unwrapped) ? unwrapped as AuditLog[] : []
  return {
    data,
    meta: { total: data.length, page: 1, limit: data.length || 20, totalPages: data.length ? 1 : 0, hasNext: false, hasPrevious: false },
  }
}

export async function getAuditLogs(params: AuditLogParams) {
  const response = await api.get("/admin/audit-logs", { params })
  return paginatedAuditResponse(response.data)
}
export async function getAuditLog(id: string) {
  const response = await api.get(`/admin/audit-logs/${id}`)
  return unwrapApiResponse<AuditLog>(response.data)
}
export async function getAuditSummary(params: AuditLogParams) {
  const response = await api.get("/admin/audit-logs/summary", { params })
  return unwrapApiResponse<AuditSummary>(response.data)
}
export async function getAuditFilterOptions(params: AuditLogParams) {
  const response = await api.get("/admin/audit-logs/filter-options", { params })
  return unwrapApiResponse<AuditFilterOptions>(response.data)
}
export async function exportAuditLogs(params: AuditLogParams & { format: "csv" | "xlsx" | "json"; includePayload?: boolean }) {
  const response = await api.get("/admin/audit-logs/export", { params, responseType: "blob" })
  const extension = params.format === "xlsx" ? "xlsx" : params.format
  const url = window.URL.createObjectURL(response.data)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.${extension}`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.URL.revokeObjectURL(url)
}
