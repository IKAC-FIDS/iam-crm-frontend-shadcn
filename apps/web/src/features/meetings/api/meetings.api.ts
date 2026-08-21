import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"
import { getOpportunities } from "@/features/opportunities/api/opportunities.api"
import { getPeopleDirectory } from "@/features/people/api/people.api"

import type {
  AssigneeOption,
  Meeting,
  MeetingPage,
  MeetingPayload,
  MeetingQuery,
} from "../types/meeting.types"

function clean<T extends object>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(
      ([, item]) => item !== undefined && item !== ""
    )
  )
}

export async function getMeetings(query: MeetingQuery) {
  const response = await api.get("/meetings", { params: clean(query) })
  const body = response.data as MeetingPage
  return {
    data: Array.isArray(body.data) ? body.data : [],
    meta: body.meta,
  } satisfies MeetingPage
}

export async function getMeeting(id: string) {
  const response = await api.get(`/meetings/${id}`)
  return unwrapApiResponse<Meeting>(response.data)
}

export async function createMeeting(payload: MeetingPayload) {
  const response = await api.post("/meetings", clean(payload))
  return unwrapApiResponse<Meeting>(response.data)
}

export async function updateMeeting(
  id: string,
  payload: Partial<MeetingPayload>
) {
  const response = await api.patch(`/meetings/${id}`, clean(payload))
  return unwrapApiResponse<Meeting>(response.data)
}

export async function completeMeeting(id: string, completionNote?: string) {
  const response = await api.patch(`/meetings/${id}/complete`, {
    completionNote: completionNote?.trim() || undefined,
  })
  return unwrapApiResponse<Meeting>(response.data)
}

export async function cancelMeeting(id: string, cancellationReason?: string) {
  const response = await api.patch(`/meetings/${id}/cancel`, {
    cancellationReason: cancellationReason?.trim() || undefined,
  })
  return unwrapApiResponse<Meeting>(response.data)
}

export async function getMeetingAssignees(search: string, page: number) {
  const response = await api.get("/users/assignee-options", {
    params: { search: search.trim() || undefined, page, limit: 25 },
  })
  const body = response.data as {
    data: AssigneeOption[]
    meta: MeetingPage["meta"]
  }
  return { data: Array.isArray(body.data) ? body.data : [], meta: body.meta }
}

export function getMeetingOpportunities(
  companyId: string,
  search: string,
  page: number
) {
  return getOpportunities({
    page,
    limit: 25,
    search: search.trim() || undefined,
    companyId,
    ownershipScope: "all",
    archiveState: "active",
  })
}

export function getMeetingPeople(
  companyId: string,
  search: string,
  page: number
) {
  return getPeopleDirectory({
    page,
    limit: 25,
    search: search.trim() || undefined,
    companyId,
  })
}
