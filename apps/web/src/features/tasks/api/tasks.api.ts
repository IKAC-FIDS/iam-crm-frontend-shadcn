import { z } from "zod"
import { parsePaginatedResponse } from "@/lib/pagination"
import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"
import { getPeopleDirectory } from "@/features/people/api/people.api"
import {
  getCommercialDocuments,
  getOpportunities,
  getOpportunityPayments,
} from "@/features/opportunities/api/opportunities.api"

import type {
  Task,
  TaskAssigneeOption,
  TaskListQuery,
  TaskPage,
  TaskPayload,
  TaskOption,
  TaskReassignPayload,
  TaskSubtaskPayload,
  TaskEntityType,
  TaskReviewRound,
} from "../types/task.types"

function clean<T extends object>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(
      ([, item]) => item !== undefined && item !== ""
    )
  )
}

export async function getTasks(query: TaskListQuery) {
  const response = await api.get("/tasks", {
    params: clean({
      ...query,
      overdueOnly:
        query.overdueOnly === undefined ? undefined : String(query.overdueOnly),
    }),
  })
  return parsePaginatedResponse(
    response.data,
    z.custom<Task>(
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

export async function getTask(id: string) {
  const response = await api.get(`/tasks/${id}`)
  return unwrapApiResponse<Task>(response.data)
}

export async function createTask(payload: TaskPayload) {
  const response = await api.post("/tasks", clean(payload))
  return unwrapApiResponse<Task>(response.data)
}

export async function updateTask(id: string, payload: Partial<TaskPayload>) {
  const response = await api.patch(`/tasks/${id}`, clean(payload))
  return unwrapApiResponse<Task>(response.data)
}

export async function changeTaskStatus(
  id: string,
  status: Task["status"],
  note?: string
) {
  const response = await api.patch(`/tasks/${id}/status`, {
    status,
    note: note?.trim() || undefined,
  })
  return unwrapApiResponse<Task>(response.data)
}

export async function assignTask(id: string, assignedToId: string) {
  const response = await api.patch(`/tasks/${id}/assign`, { assignedToId })
  return unwrapApiResponse<Task>(response.data)
}

export async function completeTask(id: string, completionNote?: string) {
  const response = await api.patch(`/tasks/${id}/complete`, {
    completionNote: completionNote?.trim() || undefined,
  })
  return unwrapApiResponse<Task>(response.data)
}

export async function rescheduleTask(
  id: string,
  dueAt: string,
  reminderAt?: string
) {
  const response = await api.patch(`/tasks/${id}/reschedule`, {
    dueAt,
    reminderAt,
  })
  return unwrapApiResponse<Task>(response.data)
}

export async function deleteTask(id: string) {
  await api.delete(`/tasks/${id}`)
}

export async function getTaskAssignees(search: string, page: number, teamId?: string) {
  const response = await api.get("/users/assignee-options", {
    params: {
      search: search.trim() || undefined,
      page,
      limit: 25,
      teamId: teamId || undefined,
    },
  })
  const body = response.data as {
    data?: TaskAssigneeOption[]
    meta?: TaskPage["meta"]
  }
  return {
    data: Array.isArray(body.data) ? body.data : [],
    meta:
      body.meta ??
      ({
        total: 0,
        page,
        limit: 25,
        totalPages: 0,
        hasNext: false,
        hasPrevious: page > 1,
      } satisfies TaskPage["meta"]),
  }
}

export async function getTaskTeamOptions(search: string, page: number) {
  const response = await api.get("/tasks/options/teams", { params: { search: search.trim() || undefined, page, limit: 25 } })
  return optionPage(response.data, page)
}

export async function getTaskEntityOptions(type: TaskEntityType, search: string, page: number) {
  const response = await api.get("/tasks/options/entities", { params: { type, search: search.trim() || undefined, page, limit: 25 } })
  return optionPage(response.data, page)
}

export async function reassignTask(id: string, payload: TaskReassignPayload) {
  const response = await api.post(`/tasks/${id}/reassign`, clean(payload))
  return unwrapApiResponse<Task>(response.data)
}

export async function createSubtask(id: string, payload: TaskSubtaskPayload) {
  const response = await api.post(`/tasks/${id}/subtasks`, clean(payload))
  return unwrapApiResponse<Task>(response.data)
}

export async function getSubtasks(id: string) {
  const response = await api.get(`/tasks/${id}/subtasks`)
  return unwrapApiResponse<Task[]>(response.data)
}

export async function getTaskReviews(id: string) {
  const response = await api.get(`/tasks/${id}/reviews`)
  return unwrapApiResponse<TaskReviewRound[]>(response.data)
}

export async function submitTaskReview(id: string, payload: { reviewerId?: string; note?: string; artifactIds?: string[] }) {
  const response = await api.post(`/tasks/${id}/submit-review`, clean(payload))
  return unwrapApiResponse<Task>(response.data)
}

export async function decideTaskReview(id: string, decision: "approve" | "request-changes", comment?: string) {
  const response = await api.post(`/tasks/${id}/review/${decision}`, { comment: comment?.trim() || undefined })
  return unwrapApiResponse<Task>(response.data)
}

function optionPage(body: unknown, page: number) {
  const value = body as { data?: TaskOption[]; meta?: TaskPage["meta"] }
  return {
    data: Array.isArray(value.data) ? value.data : [],
    meta: value.meta ?? { total: 0, page, limit: 25, totalPages: 0, hasNext: false, hasPrevious: page > 1 },
  }
}

export function getTaskOpportunities(
  companyId: string,
  search: string,
  page: number
) {
  return getOpportunities({
    page,
    limit: 25,
    search: search.trim() || undefined,
    companyId: companyId || undefined,
    ownershipScope: "all",
    archiveState: "active",
  })
}

export function getTaskPeople(companyId: string, search: string, page: number) {
  return getPeopleDirectory({
    page,
    limit: 25,
    search: search.trim() || undefined,
    companyId,
  })
}

export function getTaskDocuments(opportunityId: string, page = 1) {
  return getCommercialDocuments(opportunityId, page)
}

export function getTaskPayments(opportunityId: string, page = 1) {
  return getOpportunityPayments(opportunityId, page)
}
