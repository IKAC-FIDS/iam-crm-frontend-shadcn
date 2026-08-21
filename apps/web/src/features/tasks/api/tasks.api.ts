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
} from "../types/task.types"

function clean<T extends object>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined && item !== "")
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
  const body = response.data as TaskPage
  return {
    data: Array.isArray(body.data) ? body.data : [],
    meta: body.meta,
  } satisfies TaskPage
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

export async function getTaskAssignees(search: string, page: number) {
  const response = await api.get("/users/assignee-options", {
    params: {
      search: search.trim() || undefined,
      page,
      limit: 25,
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
