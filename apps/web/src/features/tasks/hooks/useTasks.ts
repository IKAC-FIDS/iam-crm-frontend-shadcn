import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  assignTask,
  changeTaskStatus,
  completeTask,
  createTask,
  deleteTask,
  getTask,
  getTaskAssignees,
  getTaskDocuments,
  getTaskOpportunities,
  getTaskPayments,
  getTaskPeople,
  getTasks,
  rescheduleTask,
  updateTask,
} from "../api/tasks.api"
import type { Task, TaskListQuery, TaskPayload } from "../types/task.types"

export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (query: TaskListQuery) => [...taskKeys.lists(), query] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  assignees: (search: string) => [...taskKeys.all, "assignees", search] as const,
  opportunities: (companyId: string, search: string) =>
    [...taskKeys.all, "opportunities", companyId, search] as const,
  people: (companyId: string, search: string) =>
    [...taskKeys.all, "people", companyId, search] as const,
  documents: (opportunityId: string) =>
    [...taskKeys.all, "documents", opportunityId] as const,
  payments: (opportunityId: string) =>
    [...taskKeys.all, "payments", opportunityId] as const,
}

export function useTasks(query: TaskListQuery, enabled = true) {
  return useQuery({
    queryKey: taskKeys.list(query),
    queryFn: () => getTasks(query),
    enabled,
    placeholderData: keepPreviousData,
  })
}

export function useTask(id: string, enabled = true) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => getTask(id),
    enabled: enabled && Boolean(id),
  })
}

function useInvalidateTaskDomain() {
  const client = useQueryClient()
  return async (task?: Task, previous?: Task) => {
    const affected = [task, previous].filter(Boolean) as Task[]
    const requests: Promise<unknown>[] = [
      client.invalidateQueries({ queryKey: taskKeys.lists() }),
      client.invalidateQueries({ queryKey: ["dashboard"] }),
      client.invalidateQueries({ queryKey: ["notifications"] }),
      client.invalidateQueries({ queryKey: ["opportunities"] }),
      client.invalidateQueries({ queryKey: ["pipeline"] }),
    ]

    for (const item of affected) {
      requests.push(
        client.invalidateQueries({ queryKey: taskKeys.detail(item.id) })
      )
      if (item.companyId) {
        requests.push(
          client.invalidateQueries({
            queryKey: ["companies", "detail", item.companyId],
          })
        )
        requests.push(
          client.invalidateQueries({
            queryKey: ["company-360-overview", item.companyId],
          })
        )
        requests.push(
          client.invalidateQueries({
            queryKey: ["company-tasks", item.companyId],
          })
        )
      }
      if (item.opportunityId) {
        requests.push(
          client.invalidateQueries({
            queryKey: ["opportunities", "detail", item.opportunityId],
          })
        )
      }
    }

    await Promise.all(requests)
  }
}

export function useCreateTask() {
  const invalidate = useInvalidateTaskDomain()
  return useMutation({ mutationFn: createTask, onSuccess: (task) => invalidate(task) })
}

export function useUpdateTask() {
  const invalidate = useInvalidateTaskDomain()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Partial<TaskPayload>
      previous?: Task
    }) => updateTask(id, payload),
    onSuccess: (task, vars) => invalidate(task, vars.previous),
  })
}

export function useChangeTaskStatus() {
  const invalidate = useInvalidateTaskDomain()
  return useMutation({
    mutationFn: ({
      id,
      status,
      note,
    }: {
      id: string
      status: Task["status"]
      note?: string
    }) => changeTaskStatus(id, status, note),
    onSuccess: (task) => invalidate(task),
  })
}

export function useAssignTask() {
  const invalidate = useInvalidateTaskDomain()
  return useMutation({
    mutationFn: ({
      id,
      assignedToId,
    }: {
      id: string
      assignedToId: string
    }) => assignTask(id, assignedToId),
    onSuccess: (task) => invalidate(task),
  })
}

export function useCompleteTask() {
  const invalidate = useInvalidateTaskDomain()
  return useMutation({
    mutationFn: ({
      id,
      completionNote,
    }: {
      id: string
      completionNote?: string
    }) => completeTask(id, completionNote),
    onSuccess: (task) => invalidate(task),
  })
}

export function useRescheduleTask() {
  const invalidate = useInvalidateTaskDomain()
  return useMutation({
    mutationFn: ({
      id,
      dueAt,
      reminderAt,
    }: {
      id: string
      dueAt: string
      reminderAt?: string
    }) => rescheduleTask(id, dueAt, reminderAt),
    onSuccess: (task) => invalidate(task),
  })
}

export function useDeleteTask() {
  const invalidate = useInvalidateTaskDomain()
  return useMutation({
    mutationFn: async (task: Task) => {
      await deleteTask(task.id)
      return task
    },
    onSuccess: (task) => invalidate(undefined, task),
  })
}

export function useTaskAssignees(search: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: taskKeys.assignees(search.trim()),
    queryFn: ({ pageParam }) => getTaskAssignees(search, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.hasNext ? last.meta.page + 1 : undefined,
    enabled,
    staleTime: 120_000,
  })
}

export function useTaskOpportunityOptions(
  companyId: string,
  search: string,
  enabled = true
) {
  return useInfiniteQuery({
    queryKey: taskKeys.opportunities(companyId, search.trim()),
    queryFn: ({ pageParam }) =>
      getTaskOpportunities(companyId, search, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.hasNext ? last.meta.page + 1 : undefined,
    enabled,
    staleTime: 120_000,
  })
}

export function useTaskPeopleOptions(
  companyId: string,
  search: string,
  enabled = true
) {
  return useInfiniteQuery({
    queryKey: taskKeys.people(companyId, search.trim()),
    queryFn: ({ pageParam }) => getTaskPeople(companyId, search, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.hasNext ? last.meta.page + 1 : undefined,
    enabled: enabled && Boolean(companyId),
    staleTime: 120_000,
  })
}

export function useTaskDocuments(opportunityId: string, enabled = true) {
  return useQuery({
    queryKey: taskKeys.documents(opportunityId),
    queryFn: () => getTaskDocuments(opportunityId, 1),
    enabled: enabled && Boolean(opportunityId),
  })
}

export function useTaskPayments(opportunityId: string, enabled = true) {
  return useQuery({
    queryKey: taskKeys.payments(opportunityId),
    queryFn: () => getTaskPayments(opportunityId, 1),
    enabled: enabled && Boolean(opportunityId),
  })
}
