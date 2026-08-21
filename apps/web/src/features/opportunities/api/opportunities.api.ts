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
  const response = await api.get("/opportunities", { params: opportunityParams(query) })
  const body = response.data as OpportunityPage
  return { data: Array.isArray(body.data) ? body.data : [], meta: body.meta } satisfies OpportunityPage
}

export async function getOpportunity(id: string) {
  const response = await api.get(`/opportunities/${id}`)
  return unwrapApiResponse<Opportunity>(response.data)
}

export async function createOpportunity(payload: OpportunityPayload) {
  const response = await api.post("/opportunities", payload)
  return unwrapApiResponse<Opportunity>(response.data)
}

export async function updateOpportunity(id: string, payload: OpportunityUpdatePayload) {
  const response = await api.patch(`/opportunities/${id}`, payload)
  return unwrapApiResponse<Opportunity>(response.data)
}

export async function changeOpportunityStage(id: string, stageId: string, note?: string) {
  const response = await api.patch(`/opportunities/${id}/stage`, { stageId, note: note?.trim() || undefined })
  return unwrapApiResponse<Opportunity>(response.data)
}

export async function changeOpportunityOwner(id: string, ownerId: string | null) {
  const response = await api.patch(`/opportunities/${id}/owner`, { ownerId })
  return unwrapApiResponse<Opportunity>(response.data)
}

export async function archiveOpportunity(id: string, reason?: string) {
  const response = await api.patch(`/opportunities/${id}/archive`, { reason: reason?.trim() || undefined })
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
  const response = await api.get("/lookups/opportunity-sources", { params: { active: "true" } })
  const data = unwrapApiResponse<OpportunitySourceOption[]>(response.data)
  return Array.isArray(data) ? data : []
}

export async function getOpportunityOwnerOptions() {
  const response = await api.get("/users/owner-options")
  const data = unwrapApiResponse<OpportunityOwnerOption[]>(response.data)
  return Array.isArray(data) ? data : []
}

export async function getCompanyPeople(companyId: string) {
  const response = await api.get("/people", { params: { companyId, page: 1, limit: 100 } })
  const body = response.data as { data?: PersonDirectoryItem[] }
  return Array.isArray(body.data) ? body.data : []
}
