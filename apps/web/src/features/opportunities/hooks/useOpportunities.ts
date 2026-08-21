import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query"

import {
  archiveOpportunity,
  changeOpportunityOwner,
  changeOpportunityStage,
  createOpportunity,
  getCompanyPeople,
  getOpportunity,
  getOpportunityOwnerOptions,
  getOpportunities,
  getOpportunitySources,
  getPipelineStages,
  getPipelineTransitions,
  restoreOpportunity,
  updateOpportunity,
  getOpportunityLineItems,
  createOpportunityLineItem,
  updateOpportunityLineItem,
  deleteOpportunityLineItem,
  getProductCatalogOptions,
  getCommercialDocuments,
  createCommercialDocument,
  updateCommercialDocument,
  changeCommercialDocumentStatus,
  deleteCommercialDocument,
  getOpportunityPayments,
  createOpportunityPayment,
  updateOpportunityPayment,
  markOpportunityPaymentPaid,
  cancelOpportunityPayment,
  deleteOpportunityPayment,
  getOpportunityTasks,
  createOpportunityTask,
  updateOpportunityTask,
  completeOpportunityTask,
  deleteOpportunityTask,
  getOpportunityAttachments,
  uploadOpportunityAttachment,
  deleteOpportunityAttachment,
} from "../api/opportunities.api"
import type {
  Opportunity,
  OpportunityFilters,
  OpportunityListQuery,
  OpportunityPage,
  OpportunityPayload,
  OpportunityUpdatePayload,
  OpportunityLineItemPayload,
  CommercialDocumentPayload,
  CommercialDocumentStatus,
  OpportunityPaymentPayload,
  PaymentMethod,
  OpportunityTaskPayload,
} from "../types/opportunity.types"

export const opportunityQueryKeys = {
  all: ["opportunities"] as const,
  workspace: () => [...opportunityQueryKeys.all, "workspace"] as const,
  lists: () => [...opportunityQueryKeys.workspace(), "list"] as const,
  list: (query: OpportunityListQuery) =>
    [...opportunityQueryKeys.lists(), query] as const,
  pipeline: () => [...opportunityQueryKeys.workspace(), "pipeline"] as const,
  pipelineColumn: (stageId: string, filters: OpportunityFilters) =>
    [...opportunityQueryKeys.pipeline(), stageId, filters] as const,
  details: () => [...opportunityQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...opportunityQueryKeys.details(), id] as const,
  stages: ["pipeline", "stages"] as const,
  transitions: ["pipeline", "transitions"] as const,
  sources: ["opportunities", "sources"] as const,
  owners: ["opportunities", "owners"] as const,
  companyPeople: (companyId: string) =>
    ["opportunities", "company-people", companyId] as const,
  lineItems: (id: string) =>
    [...opportunityQueryKeys.detail(id), "line-items"] as const,
  products: ["opportunities", "product-options"] as const,
  documents: (id: string, page = 1) =>
    [...opportunityQueryKeys.detail(id), "documents", page] as const,
  payments: (id: string, page = 1) =>
    [...opportunityQueryKeys.detail(id), "payments", page] as const,
  tasks: (id: string, page = 1) =>
    [...opportunityQueryKeys.detail(id), "tasks", page] as const,
  attachments: (id: string, page = 1) =>
    [...opportunityQueryKeys.detail(id), "attachments", page] as const,
}

export function useOpportunityList(
  query: OpportunityListQuery,
  enabled = true
) {
  return useQuery({
    queryKey: opportunityQueryKeys.list(query),
    queryFn: () => getOpportunities(query),
    placeholderData: keepPreviousData,
    enabled,
  })
}

export function usePipelineColumn(
  stageId: string,
  filters: OpportunityFilters,
  enabled = true
) {
  return useInfiniteQuery({
    queryKey: opportunityQueryKeys.pipelineColumn(stageId, filters),
    queryFn: ({ pageParam }) =>
      getOpportunities({ ...filters, stageId, page: pageParam, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined,
    enabled: enabled && Boolean(stageId),
  })
}

export function useOpportunity(id: string, enabled = true) {
  return useQuery({
    queryKey: opportunityQueryKeys.detail(id),
    queryFn: () => getOpportunity(id),
    enabled: enabled && Boolean(id),
  })
}

export function usePipelineStages(enabled = true) {
  return useQuery({
    queryKey: opportunityQueryKeys.stages,
    queryFn: getPipelineStages,
    enabled,
    staleTime: 5 * 60_000,
  })
}

export function usePipelineTransitions(enabled = true) {
  return useQuery({
    queryKey: opportunityQueryKeys.transitions,
    queryFn: getPipelineTransitions,
    enabled,
    staleTime: 60_000,
  })
}

export function useOpportunitySources(enabled = true) {
  return useQuery({
    queryKey: opportunityQueryKeys.sources,
    queryFn: getOpportunitySources,
    enabled,
    staleTime: 5 * 60_000,
  })
}

export function useOpportunityOwners(enabled = true) {
  return useQuery({
    queryKey: opportunityQueryKeys.owners,
    queryFn: getOpportunityOwnerOptions,
    enabled,
    staleTime: 60_000,
  })
}

export function useOpportunityCompanyPeople(
  companyId?: string,
  enabled = true
) {
  return useQuery({
    queryKey: opportunityQueryKeys.companyPeople(companyId ?? ""),
    queryFn: () => getCompanyPeople(companyId ?? ""),
    enabled: enabled && Boolean(companyId),
    staleTime: 60_000,
  })
}

function useWorkspaceInvalidation() {
  const queryClient = useQueryClient()
  return async (id?: string) => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: opportunityQueryKeys.workspace(),
      }),
      id
        ? queryClient.invalidateQueries({
            queryKey: opportunityQueryKeys.detail(id),
          })
        : Promise.resolve(),
    ])
  }
}

export function useCreateOpportunity() {
  const invalidate = useWorkspaceInvalidation()
  return useMutation({
    mutationFn: (payload: OpportunityPayload) => createOpportunity(payload),
    onSuccess: (data) => invalidate(data.id),
  })
}

export function useUpdateOpportunity() {
  const invalidate = useWorkspaceInvalidation()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: OpportunityUpdatePayload
    }) => updateOpportunity(id, payload),
    onSuccess: (_data, variables) => invalidate(variables.id),
  })
}

type StageMutation = {
  opportunity: Opportunity
  stageId: string
  note?: string
  optimistic?: boolean
}
type StageContext = {
  snapshots: Array<
    [readonly unknown[], InfiniteData<OpportunityPage> | undefined]
  >
}

export function useChangeOpportunityStage() {
  const queryClient = useQueryClient()
  return useMutation<Opportunity, Error, StageMutation, StageContext>({
    mutationFn: ({ opportunity, stageId, note }) =>
      changeOpportunityStage(opportunity.id, stageId, note),
    onMutate: async ({ opportunity, stageId, optimistic = true }) => {
      await queryClient.cancelQueries({
        queryKey: opportunityQueryKeys.workspace(),
      })
      const snapshots = queryClient.getQueriesData<
        InfiniteData<OpportunityPage>
      >({ queryKey: opportunityQueryKeys.pipeline() })
      if (!optimistic) return { snapshots }

      const matchingFilters = new Set(
        snapshots
          .filter(
            ([key, data]) =>
              key[3] === opportunity.stageId &&
              Boolean(
                data?.pages.some((page) =>
                  page.data.some((item) => item.id === opportunity.id)
                )
              )
          )
          .map(([key]) => JSON.stringify(key[4]))
      )

      for (const [key, data] of snapshots) {
        if (!data) continue
        const keyStageId = key[3]
        if (keyStageId !== opportunity.stageId && keyStageId !== stageId)
          continue
        if (!matchingFilters.has(JSON.stringify(key[4]))) continue
        queryClient.setQueryData<InfiniteData<OpportunityPage>>(key, {
          ...data,
          pages: data.pages.map((page, pageIndex) => {
            const without = page.data.filter(
              (item) => item.id !== opportunity.id
            )
            const isSource = keyStageId === opportunity.stageId
            const isTarget = keyStageId === stageId
            const nextItem = {
              ...opportunity,
              stageId,
              stage: { ...opportunity.stage, id: stageId },
            }
            return {
              ...page,
              data:
                isTarget && pageIndex === 0 ? [nextItem, ...without] : without,
              meta: {
                ...page.meta,
                total: Math.max(
                  0,
                  page.meta.total + (isTarget ? 1 : 0) - (isSource ? 1 : 0)
                ),
              },
            }
          }),
        })
      }
      return { snapshots }
    },
    onError: (_error, _variables, context) => {
      context?.snapshots.forEach(([key, value]) =>
        queryClient.setQueryData(key, value)
      )
    },
    onSettled: async (_data, _error, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: opportunityQueryKeys.workspace(),
        }),
        queryClient.invalidateQueries({
          queryKey: opportunityQueryKeys.detail(variables.opportunity.id),
        }),
      ])
    },
  })
}

export function useChangeOpportunityOwner() {
  const invalidate = useWorkspaceInvalidation()
  return useMutation({
    mutationFn: ({ id, ownerId }: { id: string; ownerId: string | null }) =>
      changeOpportunityOwner(id, ownerId),
    onSuccess: (_data, variables) => invalidate(variables.id),
  })
}

export function useArchiveOpportunity() {
  const invalidate = useWorkspaceInvalidation()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      archiveOpportunity(id, reason),
    onSuccess: (_data, variables) => invalidate(variables.id),
  })
}

export function useRestoreOpportunity() {
  const invalidate = useWorkspaceInvalidation()
  return useMutation({
    mutationFn: (id: string) => restoreOpportunity(id),
    onSuccess: (_data, id) => invalidate(id),
  })
}

function useDetailResourceInvalidation(
  id: string,
  keys: readonly (readonly unknown[])[]
) {
  const queryClient = useQueryClient()
  return async () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: opportunityQueryKeys.detail(id),
        exact: true,
      }),
      ...keys.map((key) => queryClient.invalidateQueries({ queryKey: key })),
    ])
}

export function useOpportunityLineItems(id: string, enabled = true) {
  return useQuery({
    queryKey: opportunityQueryKeys.lineItems(id),
    queryFn: () => getOpportunityLineItems(id),
    enabled: enabled && Boolean(id),
  })
}
export function useProductCatalogOptions(enabled = true) {
  return useQuery({
    queryKey: opportunityQueryKeys.products,
    queryFn: getProductCatalogOptions,
    enabled,
    staleTime: 5 * 60_000,
  })
}
export function useCreateOpportunityLineItem(id: string) {
  const invalidate = useDetailResourceInvalidation(id, [
    opportunityQueryKeys.lineItems(id),
    opportunityQueryKeys.workspace(),
  ])
  return useMutation({
    mutationFn: (payload: OpportunityLineItemPayload) =>
      createOpportunityLineItem(id, payload),
    onSuccess: invalidate,
  })
}
export function useUpdateOpportunityLineItem(id: string) {
  const invalidate = useDetailResourceInvalidation(id, [
    opportunityQueryKeys.lineItems(id),
    opportunityQueryKeys.workspace(),
  ])
  return useMutation({
    mutationFn: ({
      lineItemId,
      payload,
    }: {
      lineItemId: string
      payload: Partial<OpportunityLineItemPayload>
    }) => updateOpportunityLineItem(id, lineItemId, payload),
    onSuccess: invalidate,
  })
}
export function useDeleteOpportunityLineItem(id: string) {
  const invalidate = useDetailResourceInvalidation(id, [
    opportunityQueryKeys.lineItems(id),
    opportunityQueryKeys.workspace(),
  ])
  return useMutation({
    mutationFn: (lineItemId: string) =>
      deleteOpportunityLineItem(id, lineItemId),
    onSuccess: invalidate,
  })
}

export function useCommercialDocuments(id: string, page = 1, enabled = true) {
  return useQuery({
    queryKey: opportunityQueryKeys.documents(id, page),
    queryFn: () => getCommercialDocuments(id, page),
    enabled: enabled && Boolean(id),
    placeholderData: keepPreviousData,
  })
}
export function useCreateCommercialDocument(id: string) {
  const invalidate = useDetailResourceInvalidation(id, [
    [...opportunityQueryKeys.detail(id), "documents"],
  ])
  return useMutation({
    mutationFn: (payload: CommercialDocumentPayload) =>
      createCommercialDocument(id, payload),
    onSuccess: invalidate,
  })
}
export function useUpdateCommercialDocument(id: string) {
  const invalidate = useDetailResourceInvalidation(id, [
    [...opportunityQueryKeys.detail(id), "documents"],
  ])
  return useMutation({
    mutationFn: ({
      documentId,
      payload,
    }: {
      documentId: string
      payload: Partial<CommercialDocumentPayload>
    }) => updateCommercialDocument(id, documentId, payload),
    onSuccess: invalidate,
  })
}
export function useChangeCommercialDocumentStatus(id: string) {
  const invalidate = useDetailResourceInvalidation(id, [
    [...opportunityQueryKeys.detail(id), "documents"],
    [...opportunityQueryKeys.detail(id), "payments"],
  ])
  return useMutation({
    mutationFn: ({
      documentId,
      status,
      notes,
    }: {
      documentId: string
      status: CommercialDocumentStatus
      notes?: string
    }) => changeCommercialDocumentStatus(id, documentId, status, notes),
    onSuccess: invalidate,
  })
}
export function useDeleteCommercialDocument(id: string) {
  const invalidate = useDetailResourceInvalidation(id, [
    [...opportunityQueryKeys.detail(id), "documents"],
  ])
  return useMutation({
    mutationFn: (documentId: string) =>
      deleteCommercialDocument(id, documentId),
    onSuccess: invalidate,
  })
}

export function useOpportunityPayments(id: string, page = 1, enabled = true) {
  return useQuery({
    queryKey: opportunityQueryKeys.payments(id, page),
    queryFn: () => getOpportunityPayments(id, page),
    enabled: enabled && Boolean(id),
    placeholderData: keepPreviousData,
  })
}
export function useCreateOpportunityPayment(id: string) {
  const invalidate = useDetailResourceInvalidation(id, [
    [...opportunityQueryKeys.detail(id), "payments"],
    [...opportunityQueryKeys.detail(id), "documents"],
  ])
  return useMutation({
    mutationFn: (payload: OpportunityPaymentPayload) =>
      createOpportunityPayment(id, payload),
    onSuccess: invalidate,
  })
}
export function useUpdateOpportunityPayment(id: string) {
  const invalidate = useDetailResourceInvalidation(id, [
    [...opportunityQueryKeys.detail(id), "payments"],
    [...opportunityQueryKeys.detail(id), "documents"],
  ])
  return useMutation({
    mutationFn: ({
      paymentId,
      payload,
    }: {
      paymentId: string
      payload: Partial<OpportunityPaymentPayload>
    }) => updateOpportunityPayment(id, paymentId, payload),
    onSuccess: invalidate,
  })
}
export function useMarkOpportunityPaymentPaid(id: string) {
  const invalidate = useDetailResourceInvalidation(id, [
    [...opportunityQueryKeys.detail(id), "payments"],
    [...opportunityQueryKeys.detail(id), "documents"],
  ])
  return useMutation({
    mutationFn: ({
      paymentId,
      payload,
    }: {
      paymentId: string
      payload?: {
        paidAt?: string
        method?: PaymentMethod
        referenceNumber?: string
        notes?: string
      }
    }) => markOpportunityPaymentPaid(id, paymentId, payload),
    onSuccess: invalidate,
  })
}
export function useCancelOpportunityPayment(id: string) {
  const invalidate = useDetailResourceInvalidation(id, [
    [...opportunityQueryKeys.detail(id), "payments"],
    [...opportunityQueryKeys.detail(id), "documents"],
  ])
  return useMutation({
    mutationFn: (paymentId: string) => cancelOpportunityPayment(id, paymentId),
    onSuccess: invalidate,
  })
}
export function useDeleteOpportunityPayment(id: string) {
  const invalidate = useDetailResourceInvalidation(id, [
    [...opportunityQueryKeys.detail(id), "payments"],
    [...opportunityQueryKeys.detail(id), "documents"],
  ])
  return useMutation({
    mutationFn: (paymentId: string) => deleteOpportunityPayment(id, paymentId),
    onSuccess: invalidate,
  })
}

export function useOpportunityTasks(id: string, page = 1, enabled = true) {
  return useQuery({
    queryKey: opportunityQueryKeys.tasks(id, page),
    queryFn: () => getOpportunityTasks(id, page),
    enabled: enabled && Boolean(id),
    placeholderData: keepPreviousData,
  })
}
export function useCreateOpportunityTask(id: string) {
  const invalidate = useDetailResourceInvalidation(id, [
    [...opportunityQueryKeys.detail(id), "tasks"],
  ])
  return useMutation({
    mutationFn: (payload: OpportunityTaskPayload) =>
      createOpportunityTask(payload),
    onSuccess: invalidate,
  })
}
export function useUpdateOpportunityTask(id: string) {
  const invalidate = useDetailResourceInvalidation(id, [
    [...opportunityQueryKeys.detail(id), "tasks"],
  ])
  return useMutation({
    mutationFn: ({
      taskId,
      payload,
    }: {
      taskId: string
      payload: Partial<OpportunityTaskPayload>
    }) => updateOpportunityTask(taskId, payload),
    onSuccess: invalidate,
  })
}
export function useCompleteOpportunityTask(id: string) {
  const invalidate = useDetailResourceInvalidation(id, [
    [...opportunityQueryKeys.detail(id), "tasks"],
  ])
  return useMutation({
    mutationFn: ({ taskId, note }: { taskId: string; note?: string }) =>
      completeOpportunityTask(taskId, note),
    onSuccess: invalidate,
  })
}
export function useDeleteOpportunityTask(id: string) {
  const invalidate = useDetailResourceInvalidation(id, [
    [...opportunityQueryKeys.detail(id), "tasks"],
  ])
  return useMutation({
    mutationFn: deleteOpportunityTask,
    onSuccess: invalidate,
  })
}

export function useOpportunityAttachments(
  id: string,
  page = 1,
  enabled = true
) {
  return useQuery({
    queryKey: opportunityQueryKeys.attachments(id, page),
    queryFn: () => getOpportunityAttachments(id, page),
    enabled: enabled && Boolean(id),
    placeholderData: keepPreviousData,
  })
}
export function useUploadOpportunityAttachment(id: string) {
  const invalidate = useDetailResourceInvalidation(id, [
    [...opportunityQueryKeys.detail(id), "attachments"],
  ])
  return useMutation({
    mutationFn: ({ file, description }: { file: File; description?: string }) =>
      uploadOpportunityAttachment(id, file, description),
    onSuccess: invalidate,
  })
}
export function useDeleteOpportunityAttachment(id: string) {
  const invalidate = useDetailResourceInvalidation(id, [
    [...opportunityQueryKeys.detail(id), "attachments"],
  ])
  return useMutation({
    mutationFn: deleteOpportunityAttachment,
    onSuccess: invalidate,
  })
}
