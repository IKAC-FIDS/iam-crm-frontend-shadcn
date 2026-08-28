import { z } from "zod"
import { parsePaginatedResponse } from "@/lib/pagination"
import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"
import { getOpportunities } from "@/features/opportunities/api/opportunities.api"
import { getPeopleDirectory } from "@/features/people/api/people.api"

import type {
  AssigneeOption,
  Meeting,
  MeetingAttachment,
  MeetingAttachmentPage,
  MeetingPage,
  MeetingPayload,
  MeetingQuery,
  MeetingTypeOption,
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
  return parsePaginatedResponse(
    response.data,
    z.custom<Meeting>(
      (value) =>
        !!value &&
        typeof value === "object" &&
        "id" in value &&
        typeof value.id === "string" &&
        "title" in value &&
        typeof value.title === "string"
    )
  )
}

export async function getMeeting(id: string) {
  const response = await api.get(`/meetings/${id}`)
  return unwrapApiResponse<Meeting>(response.data)
}

export async function getMeetingTypes() {
  const response = await api.get("/meetings/types/options")
  const data = unwrapApiResponse<MeetingTypeOption[]>(response.data)
  return Array.isArray(data) ? data : []
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

function attachmentPage(value: unknown): MeetingAttachmentPage {
  const body = value as {
    data?: MeetingAttachment[]
    meta?: MeetingAttachmentPage["meta"]
  }
  return {
    data: Array.isArray(body.data) ? body.data : [],
    meta: body.meta ?? {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    },
  }
}

export async function getMeetingAttachments(id: string, page = 1) {
  const response = await api.get("/attachments", {
    params: { entityType: "MEETING", entityId: id, page, limit: 20 },
  })
  return attachmentPage(response.data)
}

export async function uploadMeetingAttachment(
  id: string,
  file: File,
  description?: string
) {
  const form = new FormData()
  form.append("file", file)
  form.append("entityType", "MEETING")
  form.append("entityId", id)
  if (description?.trim()) form.append("description", description.trim())
  const response = await api.post("/attachments", form)
  return unwrapApiResponse<MeetingAttachment>(response.data)
}

export async function deleteMeetingAttachment(attachmentId: string) {
  await api.delete(`/attachments/${attachmentId}`)
}

export async function downloadMeetingAttachment(
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
