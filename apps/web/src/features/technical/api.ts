import { z } from "zod"
import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"
import { parsePaginatedResponse } from "@/lib/pagination"
import type {
  DocumentPayload,
  DocumentVersion,
  KnowledgeArticle,
  KnowledgePayload,
  ReleasePayload,
  RequirementPayload,
  ResourcePayload,
  TechnicalDocument,
  TechnicalKind,
  TechnicalListParams,
  TechnicalRelease,
  TechnicalResource,
  Tender,
  TenderDeliverable,
  TenderPayload,
  TenderQualificationPayload,
  TenderRequirement,
  TenderReadiness,
  TenderReview,
  TenderReviewStatus,
  TenderReviewType,
} from "./types"
const root = "/technical"
async function list<T>(kind: TechnicalKind, params: TechnicalListParams) {
  const r = await api.get(`${root}/${kind}`, { params })
  return parsePaginatedResponse<T>(r.data, z.unknown() as z.ZodType<T>)
}
async function get<T>(kind: TechnicalKind, id: string) {
  const r = await api.get(`${root}/${kind}/${id}`)
  return unwrapApiResponse<T>(r.data)
}
async function save<T, P>(kind: TechnicalKind, payload: P, id?: string) {
  const r = id
    ? await api.patch(`${root}/${kind}/${id}`, payload)
    : await api.post(`${root}/${kind}`, payload)
  return unwrapApiResponse<T>(r.data)
}
async function transition<T>(
  kind: Exclude<TechnicalKind, "resources">,
  id: string,
  status: string,
  revision?: number,
  reason?: string
) {
  const r = await api.post(`${root}/${kind}/${id}/transition`, {
    status,
    revision,
    reason: reason?.trim() || undefined,
  })
  return unwrapApiResponse<T>(r.data)
}
export const technicalApi = {
  releases: {
    list: (p: TechnicalListParams) => list<TechnicalRelease>("releases", p),
    get: (id: string) => get<TechnicalRelease>("releases", id),
    save: (p: ReleasePayload, id?: string) =>
      save<TechnicalRelease, ReleasePayload>("releases", p, id),
    transition: (
      id: string,
      status: string,
      revision?: number,
      reason?: string
    ) => transition<TechnicalRelease>("releases", id, status, revision, reason),
  },
  knowledge: {
    list: (p: TechnicalListParams) =>
      list<KnowledgeArticle>("knowledge-base", p),
    get: (id: string) => get<KnowledgeArticle>("knowledge-base", id),
    save: (p: KnowledgePayload, id?: string) =>
      save<KnowledgeArticle, KnowledgePayload>("knowledge-base", p, id),
    transition: (id: string, status: string, reason?: string) =>
      transition<KnowledgeArticle>(
        "knowledge-base",
        id,
        status,
        undefined,
        reason
      ),
  },
  documents: {
    list: (p: TechnicalListParams) => list<TechnicalDocument>("documents", p),
    get: (id: string) => get<TechnicalDocument>("documents", id),
    save: (p: DocumentPayload, id?: string) =>
      save<TechnicalDocument, DocumentPayload>("documents", p, id),
    transition: (
      id: string,
      status: string,
      revision?: number,
      reason?: string
    ) =>
      transition<TechnicalDocument>("documents", id, status, revision, reason),
    versions: async (id: string) => {
      const r = await api.get(`${root}/documents/${id}/versions`)
      return unwrapApiResponse<DocumentVersion[]>(r.data)
    },
    addVersion: async (
      id: string,
      p: { version: string; attachmentId?: string; contentHash?: string }
    ) => {
      const r = await api.post(`${root}/documents/${id}/versions`, p)
      return unwrapApiResponse<DocumentVersion>(r.data)
    },
    uploadVersion: async (
      id: string,
      input: { version: string; file: File; contentHash?: string; onProgress?: (percent: number) => void }
    ) => {
      const form = new FormData()
      form.append("version", input.version.trim())
      form.append("file", input.file)
      if (input.contentHash?.trim()) form.append("contentHash", input.contentHash.trim())
      const r = await api.post(`${root}/documents/${id}/versions/upload`, form, {
        onUploadProgress: (event) => input.onProgress?.(
          event.total ? Math.round((event.loaded / event.total) * 100) : 0
        ),
      })
      return unwrapApiResponse<DocumentVersion>(r.data)
    },
  },
  resources: {
    list: (p: TechnicalListParams) => list<TechnicalResource>("resources", p),
    get: (id: string) => get<TechnicalResource>("resources", id),
    save: (p: ResourcePayload, id?: string) =>
      save<TechnicalResource, ResourcePayload>("resources", p, id),
  },
  tenders: {
    list: (p: TechnicalListParams) => list<Tender>("tenders", p),
    get: (id: string) => get<Tender>("tenders", id),
    save: (p: TenderPayload, id?: string) =>
      save<Tender, TenderPayload>("tenders", p, id),
    transition: (
      id: string,
      status: string,
      revision?: number,
      reason?: string
    ) => transition<Tender>("tenders", id, status, revision, reason),
    saveQualification: async (id: string, p: TenderQualificationPayload) => {
      const r = await api.patch(`${root}/tenders/${id}/qualification`, p)
      return unwrapApiResponse<Tender>(r.data)
    },
    requirements: async (id: string) => {
      const r = await api.get(`${root}/tenders/${id}/requirements`)
      return unwrapApiResponse<TenderRequirement[]>(r.data)
    },
    readiness: async (id: string) => {
      const r = await api.get(`${root}/tenders/${id}/readiness`)
      return unwrapApiResponse<TenderReadiness>(r.data)
    },
    reviews: async (id: string) => {
      const r = await api.get(`${root}/tenders/${id}/reviews`)
      return unwrapApiResponse<TenderReview[]>(r.data)
    },
    history: async (id: string) => {
      const r = await api.get(`${root}/tenders/${id}/history`)
      return unwrapApiResponse<Array<{ id: string; action: string; actorId?: string; createdAt: string; metadata?: { reason?: string } }>>(r.data)
    },
    requestReview: async (id: string, p: { type: TenderReviewType; reviewerId?: string; comment?: string; revision?: number }) => {
      const r = await api.post(`${root}/tenders/${id}/reviews`, p)
      return unwrapApiResponse<TenderReview>(r.data)
    },
    decideReview: async (id: string, reviewId: string, p: { status: TenderReviewStatus; comment?: string; revision?: number }) => {
      const r = await api.post(`${root}/tenders/${id}/reviews/${reviewId}/decision`, p)
      return unwrapApiResponse<TenderReview>(r.data)
    },
    saveRequirement: async (
      id: string,
      p: RequirementPayload,
      rid?: string
    ) => {
      const r = rid
        ? await api.patch(`${root}/tenders/${id}/requirements/${rid}`, p)
        : await api.post(`${root}/tenders/${id}/requirements`, p)
      return unwrapApiResponse<TenderRequirement>(r.data)
    },
    removeRequirement: (id: string, rid: string) =>
      api.delete(`${root}/tenders/${id}/requirements/${rid}`),
    addDependency: async (id: string, rid: string, dependsOnRequirementId: string) => {
      const r = await api.post(`${root}/tenders/${id}/requirements/${rid}/dependencies`, { dependsOnRequirementId })
      return unwrapApiResponse<{ id: string }>(r.data)
    },
    removeDependency: (id: string, rid: string, dependencyId: string) =>
      api.delete(`${root}/tenders/${id}/requirements/${rid}/dependencies/${dependencyId}`),
    linkTask: async (id: string, rid: string, taskId: string) => {
      const r = await api.post(`${root}/tenders/${id}/requirements/${rid}/link-task`, { taskId })
      return unwrapApiResponse<TenderRequirement>(r.data)
    },
    createTask: async (id: string, rid: string, p: { title?: string; description?: string; priority?: string; dueAt?: string; assignedToId?: string }) => {
      const r = await api.post(`${root}/tenders/${id}/requirements/${rid}/create-task`, p)
      return unwrapApiResponse<{ requirement: TenderRequirement; task: { id: string; title: string } }>(r.data)
    },
    unlinkTask: (id: string, rid: string) =>
      api.delete(`${root}/tenders/${id}/requirements/${rid}/task`),
    addDeliverable: async (
      id: string,
      p: { documentId: string; label?: string; required?: boolean }
    ) => {
      const r = await api.post(`${root}/tenders/${id}/deliverables`, p)
      return unwrapApiResponse<TenderDeliverable>(r.data)
    },
    removeDeliverable: (id: string, did: string) =>
      api.delete(`${root}/tenders/${id}/deliverables/${did}`),
  },
}
export type LookupOption = { id: string; label: string; companyId?: string }
function rows(value: unknown): Record<string, unknown>[] {
  const data = unwrapApiResponse<unknown>(value)
  if (Array.isArray(data)) return data as Record<string, unknown>[]
  if (
    data &&
    typeof data === "object" &&
    "data" in data &&
    Array.isArray((data as { data: unknown }).data)
  )
    return (data as { data: Record<string, unknown>[] }).data
  return []
}
export async function technicalLookups(
  kind:
    | "products"
    | "companies"
    | "opportunities"
    | "users"
    | "tender-users"
    | "teams"
    | "currencies"
    | "documents"
    | "tenders"
    | "tasks",
  search = "",
  companyId?: string,
  teamId?: string
): Promise<LookupOption[]> {
  const endpoint = {
    products: "/product-catalog",
    companies: "/companies",
    opportunities: "/opportunities",
    users: "/users/owner-options",
    "tender-users": "/users/assignee-options",
    teams: "/teams",
    currencies: "/technical/tenders/currency-options",
    documents: "/technical/documents",
    tenders: "/technical/tenders",
    tasks: "/tasks",
  }[kind]
  const r = await api.get(endpoint, {
    params: {
      page: 1,
      limit: 50,
      search: search || undefined,
      companyId: companyId || undefined,
      teamId: teamId || undefined,
    },
  })
  return rows(r.data).map((x) => ({
    id: String(x.id),
    label: String(
      x.name ??
        x.title ??
        x.brandName ??
        x.legalName ??
        x.fullName ??
        x.email ??
        x.id
    ),
    companyId: typeof x.companyId === "string" ? x.companyId : undefined,
  }))
}
