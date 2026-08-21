import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"
import type { PersonDirectoryItem } from "@/features/people/types/person.types"

import type {
  Opportunity,
  OpportunityListQuery,
  OpportunityOwnerOption,
  OpportunityPage,
  OpportunityPayload,
  OpportunitySourceOption,
  OpportunityStage,
  OpportunityTransition,
  OpportunityUpdatePayload,
  OpportunityLineItem,
  OpportunityLineItemPayload,
  CommercialDocument,
  CommercialDocumentPayload,
  CommercialDocumentStatus,
  OpportunityPayment,
  OpportunityPaymentPayload,
  PaymentMethod,
  OpportunityTask,
  OpportunityTaskPayload,
  OpportunityAttachment,
  PaginatedResource,
  ProductCatalogOption,
} from "../types/opportunity.types"

function opportunityParams(query: OpportunityListQuery) {
  return {
    page: query.page,
    limit: query.limit,
    search: query.search?.trim() || undefined,
    ownershipScope: query.ownershipScope || undefined,
    companyId: query.companyId || undefined,
    ownerId: query.ownerId || undefined,
    teamId: query.teamId || undefined,
    team: query.team?.trim() || undefined,
    stageId: query.stageId || undefined,
    priority: query.priority || undefined,
    sourceOptionId: query.sourceOptionId || undefined,
    primaryContactId: query.primaryContactId || undefined,
    expectedCloseFrom: query.expectedCloseFrom || undefined,
    expectedCloseTo: query.expectedCloseTo || undefined,
    includeArchived: query.archiveState === "all" ? "true" : undefined,
    archivedOnly: query.archiveState === "archived" ? "true" : undefined,
  }
}

export async function getOpportunities(query: OpportunityListQuery) {
  const response = await api.get("/opportunities", {
    params: opportunityParams(query),
  })
  const body = response.data as OpportunityPage
  return {
    data: Array.isArray(body.data) ? body.data : [],
    meta: body.meta,
  } satisfies OpportunityPage
}

export async function getOpportunity(id: string) {
  const response = await api.get(`/opportunities/${id}`)
  return unwrapApiResponse<Opportunity>(response.data)
}

export async function createOpportunity(payload: OpportunityPayload) {
  const response = await api.post("/opportunities", payload)
  return unwrapApiResponse<Opportunity>(response.data)
}

export async function updateOpportunity(
  id: string,
  payload: OpportunityUpdatePayload
) {
  const response = await api.patch(`/opportunities/${id}`, payload)
  return unwrapApiResponse<Opportunity>(response.data)
}

export async function changeOpportunityStage(
  id: string,
  stageId: string,
  note?: string
) {
  const response = await api.patch(`/opportunities/${id}/stage`, {
    stageId,
    note: note?.trim() || undefined,
  })
  return unwrapApiResponse<Opportunity>(response.data)
}

export async function changeOpportunityOwner(
  id: string,
  ownerId: string | null
) {
  const response = await api.patch(`/opportunities/${id}/owner`, { ownerId })
  return unwrapApiResponse<Opportunity>(response.data)
}

export async function archiveOpportunity(id: string, reason?: string) {
  const response = await api.patch(`/opportunities/${id}/archive`, {
    reason: reason?.trim() || undefined,
  })
  return unwrapApiResponse<Opportunity>(response.data)
}

export async function restoreOpportunity(id: string) {
  const response = await api.patch(`/opportunities/${id}/restore`)
  return unwrapApiResponse<Opportunity>(response.data)
}

export async function getPipelineStages() {
  const response = await api.get("/pipeline/stages")
  const data = unwrapApiResponse<OpportunityStage[]>(response.data)
  return Array.isArray(data) ? data : []
}

export async function getPipelineTransitions() {
  const response = await api.get("/pipeline/transitions")
  const data = unwrapApiResponse<OpportunityTransition[]>(response.data)
  return Array.isArray(data) ? data : []
}

export async function getOpportunitySources() {
  const response = await api.get("/lookups/opportunity-sources", {
    params: { active: "true" },
  })
  const data = unwrapApiResponse<OpportunitySourceOption[]>(response.data)
  return Array.isArray(data) ? data : []
}

export async function getOpportunityOwnerOptions() {
  const response = await api.get("/users/owner-options")
  const data = unwrapApiResponse<OpportunityOwnerOption[]>(response.data)
  return Array.isArray(data) ? data : []
}

export async function getCompanyPeople(companyId: string) {
  const response = await api.get("/people", {
    params: { companyId, page: 1, limit: 100 },
  })
  const body = response.data as { data?: PersonDirectoryItem[] }
  return Array.isArray(body.data) ? body.data : []
}

function paginated<T>(value: unknown): PaginatedResource<T> {
  const body = value as { data?: T[]; meta?: PaginatedResource<T>["meta"] }
  return {
    data: Array.isArray(body.data) ? body.data : [],
    meta: body.meta ?? { total: 0, page: 1, limit: 20, totalPages: 0 },
  }
}

const lineItemsPath = (id: string) => `/opportunities/${id}/line-items`
export async function getOpportunityLineItems(id: string) {
  const response = await api.get(lineItemsPath(id))
  const data = unwrapApiResponse<OpportunityLineItem[]>(response.data)
  return Array.isArray(data) ? data : []
}
export async function createOpportunityLineItem(
  id: string,
  payload: OpportunityLineItemPayload
) {
  const response = await api.post(lineItemsPath(id), payload)
  return unwrapApiResponse<OpportunityLineItem>(response.data)
}
export async function updateOpportunityLineItem(
  id: string,
  lineItemId: string,
  payload: Partial<OpportunityLineItemPayload>
) {
  const response = await api.patch(
    `${lineItemsPath(id)}/${lineItemId}`,
    payload
  )
  return unwrapApiResponse<OpportunityLineItem>(response.data)
}
export async function deleteOpportunityLineItem(
  id: string,
  lineItemId: string
) {
  await api.delete(`${lineItemsPath(id)}/${lineItemId}`)
}

export async function getProductCatalogOptions() {
  const response = await api.get("/product-catalog", {
    params: { page: 1, limit: 100, active: "true" },
  })
  return paginated<ProductCatalogOption>(response.data).data
}

const documentsPath = (id: string) =>
  `/opportunities/${id}/commercial-documents`
export async function getCommercialDocuments(id: string, page = 1) {
  const response = await api.get(documentsPath(id), {
    params: { page, limit: 20 },
  })
  return paginated<CommercialDocument>(response.data)
}
function documentBody(payload: Partial<CommercialDocumentPayload>) {
  const body = { ...payload }
  delete body.file
  return body
}
export async function createCommercialDocument(
  id: string,
  payload: CommercialDocumentPayload
) {
  if (payload.file) {
    const form = new FormData()
    form.append("file", payload.file)
    Object.entries(documentBody(payload)).forEach(([key, value]) => {
      if (value !== undefined && value !== "") form.append(key, String(value))
    })
    const response = await api.post(`${documentsPath(id)}/upload`, form)
    return unwrapApiResponse<CommercialDocument>(response.data)
  }
  const response = await api.post(documentsPath(id), documentBody(payload))
  return unwrapApiResponse<CommercialDocument>(response.data)
}
export async function updateCommercialDocument(
  id: string,
  documentId: string,
  payload: Partial<CommercialDocumentPayload>
) {
  const response = await api.patch(
    `${documentsPath(id)}/${documentId}`,
    documentBody(payload)
  )
  return unwrapApiResponse<CommercialDocument>(response.data)
}
export async function changeCommercialDocumentStatus(
  id: string,
  documentId: string,
  status: CommercialDocumentStatus,
  notes?: string
) {
  const response = await api.patch(
    `${documentsPath(id)}/${documentId}/status`,
    { status, notes: notes?.trim() || undefined }
  )
  return unwrapApiResponse<CommercialDocument>(response.data)
}
export async function deleteCommercialDocument(id: string, documentId: string) {
  await api.delete(`${documentsPath(id)}/${documentId}`)
}

const paymentsPath = (id: string) => `/opportunities/${id}/payments`
export async function getOpportunityPayments(id: string, page = 1) {
  const response = await api.get(paymentsPath(id), {
    params: { page, limit: 20 },
  })
  return paginated<OpportunityPayment>(response.data)
}
export async function createOpportunityPayment(
  id: string,
  payload: OpportunityPaymentPayload
) {
  const response = await api.post(paymentsPath(id), payload)
  return unwrapApiResponse<OpportunityPayment>(response.data)
}
export async function updateOpportunityPayment(
  id: string,
  paymentId: string,
  payload: Partial<OpportunityPaymentPayload>
) {
  const response = await api.patch(`${paymentsPath(id)}/${paymentId}`, payload)
  return unwrapApiResponse<OpportunityPayment>(response.data)
}
export async function markOpportunityPaymentPaid(
  id: string,
  paymentId: string,
  payload: {
    paidAt?: string
    method?: PaymentMethod
    referenceNumber?: string
    notes?: string
  } = {}
) {
  const response = await api.patch(
    `${paymentsPath(id)}/${paymentId}/mark-paid`,
    payload
  )
  return unwrapApiResponse<OpportunityPayment>(response.data)
}
export async function cancelOpportunityPayment(id: string, paymentId: string) {
  const response = await api.patch(`${paymentsPath(id)}/${paymentId}/cancel`)
  return unwrapApiResponse<OpportunityPayment>(response.data)
}
export async function deleteOpportunityPayment(id: string, paymentId: string) {
  await api.delete(`${paymentsPath(id)}/${paymentId}`)
}

export async function getOpportunityTasks(id: string, page = 1) {
  const response = await api.get("/tasks", {
    params: { opportunityId: id, page, limit: 20 },
  })
  return paginated<OpportunityTask>(response.data)
}
export async function createOpportunityTask(payload: OpportunityTaskPayload) {
  const response = await api.post("/tasks", payload)
  return unwrapApiResponse<OpportunityTask>(response.data)
}
export async function updateOpportunityTask(
  taskId: string,
  payload: Partial<OpportunityTaskPayload>
) {
  const response = await api.patch(`/tasks/${taskId}`, payload)
  return unwrapApiResponse<OpportunityTask>(response.data)
}
export async function completeOpportunityTask(
  taskId: string,
  completionNote?: string
) {
  const response = await api.patch(`/tasks/${taskId}/complete`, {
    completionNote: completionNote?.trim() || undefined,
  })
  return unwrapApiResponse<OpportunityTask>(response.data)
}
export async function deleteOpportunityTask(taskId: string) {
  await api.delete(`/tasks/${taskId}`)
}

export async function getOpportunityAttachments(id: string, page = 1) {
  const response = await api.get("/attachments", {
    params: { entityType: "OPPORTUNITY", entityId: id, page, limit: 20 },
  })
  return paginated<OpportunityAttachment>(response.data)
}
export async function uploadOpportunityAttachment(
  id: string,
  file: File,
  description?: string
) {
  const form = new FormData()
  form.append("file", file)
  form.append("entityType", "OPPORTUNITY")
  form.append("entityId", id)
  if (description?.trim()) form.append("description", description.trim())
  const response = await api.post("/attachments", form)
  return unwrapApiResponse<OpportunityAttachment>(response.data)
}
export async function deleteOpportunityAttachment(attachmentId: string) {
  await api.delete(`/attachments/${attachmentId}`)
}
export async function downloadOpportunityAttachment(
  attachmentId: string,
  fileName: string
) {
  const response = await api.get<Blob>(
    `/attachments/${attachmentId}/download`,
    { responseType: "blob" }
  )
  const url = window.URL.createObjectURL(response.data)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => window.URL.revokeObjectURL(url), 0)
}
