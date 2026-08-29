import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useQueryScope } from "@/lib/queryScope"
import { technicalApi } from "./api"
import type {
  DocumentPayload,
  KnowledgeArticle,
  KnowledgePayload,
  Page,
  ReleasePayload,
  RequirementPayload,
  ResourcePayload,
  TechnicalDocument,
  TechnicalKind,
  TechnicalListParams,
  TechnicalRelease,
  TechnicalResource,
  Tender,
  TenderPayload,
  TenderReviewStatus,
  TenderReviewType,
} from "./types"
export const technicalKeys = {
  all: ["technical-center"] as const,
  list: (kind: TechnicalKind, p: TechnicalListParams) =>
    [...technicalKeys.all, kind, "list", p] as const,
  detail: (kind: TechnicalKind, id: string) =>
    [...technicalKeys.all, kind, "detail", id] as const,
  requirements: (id: string) =>
    [...technicalKeys.all, "tenders", id, "requirements"] as const,
  readiness: (id: string) => [...technicalKeys.all, "tenders", id, "readiness"] as const,
  reviews: (id: string) => [...technicalKeys.all, "tenders", id, "reviews"] as const,
  history: (id: string) => [...technicalKeys.all, "tenders", id, "history"] as const,
  versions: (id: string) =>
    [...technicalKeys.all, "documents", id, "versions"] as const,
}
const clients = {
  releases: technicalApi.releases,
  "knowledge-base": technicalApi.knowledge,
  documents: technicalApi.documents,
  resources: technicalApi.resources,
  tenders: technicalApi.tenders,
}
type EntityByKind = {
  releases: TechnicalRelease
  "knowledge-base": KnowledgeArticle
  documents: TechnicalDocument
  resources: TechnicalResource
  tenders: Tender
}
export function useTechnicalList<K extends TechnicalKind>(
  kind: K,
  p: TechnicalListParams,
  enabled = true
) {
  const scope = useQueryScope()
  return useQuery<Page<EntityByKind[K]>>({
    queryKey: [...technicalKeys.list(kind, p), scope],
    queryFn: () => clients[kind].list(p) as Promise<Page<EntityByKind[K]>>,
    enabled,
    placeholderData: (previous) => previous,
  })
}
export function useTechnicalDetail<K extends TechnicalKind>(
  kind: K,
  id?: string
) {
  const scope = useQueryScope()
  return useQuery<EntityByKind[K]>({
    queryKey: [...technicalKeys.detail(kind, id || ""), scope],
    queryFn: () => clients[kind].get(id!) as Promise<EntityByKind[K]>,
    enabled: Boolean(id),
  })
}
type Payload =
  | ReleasePayload
  | KnowledgePayload
  | DocumentPayload
  | ResourcePayload
  | TenderPayload
export function useTechnicalSave(kind: TechnicalKind) {
  const q = useQueryClient()
  return useMutation<{ id: string }, Error, { payload: unknown; id?: string }>({
    mutationFn: ({ payload, id }) =>
      (
        clients[kind].save as (
          p: Payload,
          id?: string
        ) => Promise<{ id: string }>
      )(payload as Payload, id),
    onSuccess: (row) => {
      void q.invalidateQueries({
        queryKey: [...technicalKeys.all, kind, "list"],
      })
      void q.invalidateQueries({ queryKey: technicalKeys.detail(kind, row.id) })
    },
  })
}
export function useTechnicalTransition(
  kind: Exclude<TechnicalKind, "resources">
) {
  const q = useQueryClient()
  return useMutation<
    unknown,
    Error,
    { id: string; status: string; revision?: number; reason?: string }
  >({
    mutationFn: ({ id, status, revision, reason }) =>
      (
        clients[kind].transition as (
          id: string,
          status: string,
          revision?: number,
          reason?: string
        ) => Promise<unknown>
      )(id, status, revision, reason),
    onSuccess: (_, v) => {
      void q.invalidateQueries({
        queryKey: [...technicalKeys.all, kind, "list"],
      })
      void q.invalidateQueries({ queryKey: technicalKeys.detail(kind, v.id) })
    },
  })
}
export function useRequirements(id: string) {
  const scope = useQueryScope()
  return useQuery({
    queryKey: [...technicalKeys.requirements(id), scope],
    queryFn: () => technicalApi.tenders.requirements(id),
    enabled: Boolean(id),
  })
}
export function useTenderWorkflow(id: string) {
  const scope = useQueryScope()
  return {
    readiness: useQuery({ queryKey: [...technicalKeys.readiness(id), scope], queryFn: () => technicalApi.tenders.readiness(id), enabled: Boolean(id) }),
    reviews: useQuery({ queryKey: [...technicalKeys.reviews(id), scope], queryFn: () => technicalApi.tenders.reviews(id), enabled: Boolean(id) }),
    history: useQuery({ queryKey: [...technicalKeys.history(id), scope], queryFn: () => technicalApi.tenders.history(id), enabled: Boolean(id) }),
  }
}
export function useTenderWorkflowMutations(id: string) {
  const q = useQueryClient()
  const invalidate = () => {
    void q.invalidateQueries({ queryKey: technicalKeys.detail("tenders", id) })
    void q.invalidateQueries({ queryKey: technicalKeys.readiness(id) })
    void q.invalidateQueries({ queryKey: technicalKeys.reviews(id) })
    void q.invalidateQueries({ queryKey: technicalKeys.history(id) })
    void q.invalidateQueries({ queryKey: [...technicalKeys.all, "tenders", "list"] })
  }
  return {
    requestReview: useMutation({ mutationFn: (payload: { type: TenderReviewType; reviewerId?: string; comment?: string; revision?: number }) => technicalApi.tenders.requestReview(id, payload), onSuccess: invalidate }),
    decideReview: useMutation({ mutationFn: ({ reviewId, ...payload }: { reviewId: string; status: TenderReviewStatus; comment?: string; revision?: number }) => technicalApi.tenders.decideReview(id, reviewId, payload), onSuccess: invalidate }),
  }
}
export function useRequirementMutations(id: string) {
  const q = useQueryClient(),
    invalidate = () => {
      void q.invalidateQueries({ queryKey: technicalKeys.requirements(id) })
      void q.invalidateQueries({
        queryKey: technicalKeys.detail("tenders", id),
      })
    }
  return {
    save: useMutation({
      mutationFn: ({
        payload,
        requirementId,
      }: {
        payload: RequirementPayload
        requirementId?: string
      }) => technicalApi.tenders.saveRequirement(id, payload, requirementId),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (requirementId: string) =>
        technicalApi.tenders.removeRequirement(id, requirementId),
      onSuccess: invalidate,
    }),
    deliver: useMutation({
      mutationFn: (payload: { documentId: string; label?: string; required?: boolean }) =>
        technicalApi.tenders.addDeliverable(id, payload),
      onSuccess: invalidate,
    }),
    removeDeliverable: useMutation({
      mutationFn: (did: string) =>
        technicalApi.tenders.removeDeliverable(id, did),
      onSuccess: invalidate,
    }),
  }
}
