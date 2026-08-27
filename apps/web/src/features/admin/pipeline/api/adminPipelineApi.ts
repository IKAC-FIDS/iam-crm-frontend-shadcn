import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"

export type TerminalType = "NONE" | "WON" | "LOST" | "ON_HOLD"
export type PipelineRole = "ADMIN" | "MANAGER" | "REP" | "BOARDS"

export type PipelineStage = {
  id: string
  code: string
  label: string
  description?: string | null
  sortOrder: number
  color?: string | null
  isActive: boolean
  isTerminal: boolean
  terminalType: TerminalType
  isDefault: boolean
  createdAt?: string
  updatedAt?: string
}

export type PipelineStageRef = {
  id: string
  code: string
  label: string
}

export type PipelineTransition = {
  id: string
  fromStageId?: string | null
  toStageId: string
  fromStage?: PipelineStageRef | null
  toStage?: PipelineStageRef
  role?: PipelineRole | null
  isAllowed: boolean
}

export type CreateStagePayload = {
  code: string
  label: string
  description?: string
  sortOrder?: number
  color?: string
  isActive?: boolean
  isTerminal?: boolean
  terminalType?: TerminalType
  isDefault?: boolean
}

export type UpdateStagePayload = Omit<CreateStagePayload, "code">

export type TransitionPayload = {
  fromStageId?: string | null
  toStageId: string
  role?: PipelineRole | null
  isAllowed: boolean
}

function normalizeList<T>(payload: unknown): T[] {
  const data = unwrapApiResponse<unknown>(payload)
  if (Array.isArray(data)) return data as T[]
  if (
    data &&
    typeof data === "object" &&
    "items" in data &&
    Array.isArray((data as { items: unknown }).items)
  ) {
    return (data as { items: T[] }).items
  }
  return []
}

function normalizeStage(item: unknown): PipelineStage {
  const row = item as Record<string, unknown>
  return {
    id: String(row.id),
    code: String(row.code),
    label: String(row.label ?? row.code),
    description: row.description == null ? null : String(row.description),
    sortOrder: Number(row.sortOrder ?? 0),
    color: row.color == null ? null : String(row.color),
    isActive: Boolean(row.isActive),
    isTerminal: Boolean(row.isTerminal),
    terminalType: (row.terminalType ?? "NONE") as TerminalType,
    isDefault: Boolean(row.isDefault),
    createdAt: row.createdAt == null ? undefined : String(row.createdAt),
    updatedAt: row.updatedAt == null ? undefined : String(row.updatedAt),
  }
}

function normalizeRef(value: unknown): PipelineStageRef | undefined {
  if (!value || typeof value !== "object") return undefined
  const row = value as Record<string, unknown>
  return {
    id: String(row.id),
    code: String(row.code),
    label: String(row.label ?? row.code),
  }
}

function normalizeTransition(item: unknown): PipelineTransition {
  const row = item as Record<string, unknown>
  const from = normalizeRef(row.fromStage)
  const to = normalizeRef(row.toStage)

  return {
    id: String(row.id),
    fromStageId: row.fromStageId == null ? from?.id ?? null : String(row.fromStageId),
    toStageId: String(row.toStageId ?? to?.id),
    fromStage: from ?? null,
    toStage: to,
    role: row.role == null ? null : (row.role as PipelineRole),
    isAllowed: Boolean(row.isAllowed ?? row.allowed),
  }
}

export async function getPipelineStages() {
  const response = await api.get("/admin/pipeline/stages")
  return normalizeList<unknown>(response.data)
    .map(normalizeStage)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.code.localeCompare(b.code))
}

export async function createPipelineStage(payload: CreateStagePayload) {
  const response = await api.post("/admin/pipeline/stages", payload)
  return normalizeStage(unwrapApiResponse<unknown>(response.data))
}

export async function updatePipelineStage(id: string, payload: UpdateStagePayload) {
  const response = await api.patch(`/admin/pipeline/stages/${id}`, payload)
  return normalizeStage(unwrapApiResponse<unknown>(response.data))
}

export async function deactivatePipelineStage(id: string, replacementStageId?: string) {
  const response = await api.delete(`/admin/pipeline/stages/${id}`, {
    params: replacementStageId ? { replacementStageId } : undefined,
  })
  return normalizeStage(unwrapApiResponse<unknown>(response.data))
}

export async function reorderPipelineStages(items: Array<{ id: string; sortOrder: number }>) {
  const response = await api.patch("/admin/pipeline/stages/reorder", { items })
  return normalizeList<unknown>(response.data).map(normalizeStage)
}

export async function getPipelineTransitions() {
  const response = await api.get("/admin/pipeline/transitions")
  return normalizeList<unknown>(response.data).map(normalizeTransition)
}

export async function createPipelineTransition(payload: TransitionPayload) {
  const response = await api.post("/admin/pipeline/transitions", payload)
  return normalizeTransition(unwrapApiResponse<unknown>(response.data))
}

export async function updatePipelineTransition(id: string, payload: TransitionPayload) {
  const response = await api.patch(`/admin/pipeline/transitions/${id}`, payload)
  return normalizeTransition(unwrapApiResponse<unknown>(response.data))
}

export async function deletePipelineTransition(id: string) {
  await api.delete(`/admin/pipeline/transitions/${id}`)
}
