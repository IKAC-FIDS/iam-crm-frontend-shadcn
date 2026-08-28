import { useQueryScope } from "@/lib/queryScope"
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  createActivity,
  getActivities,
  getActivityTypes,
  getActivityOpportunityOptions,
  getActivityOwnerOptions,
  getActivityPeopleOptions,
  updateActivity,
} from "../api/activities.api"
import type {
  ActivityListQuery,
  CreateActivityPayload,
  UpdateActivityPayload,
} from "../types/activity.types"

export const activityQueryKeys = {
  all: ["activities"] as const,
  list: (query: ActivityListQuery) => ["activities", "list", query] as const,
}

export function useActivityTypes(enabled = true) {
  return useQuery({
    queryKey: [...["activities", "type-options"], useQueryScope()],
    queryFn: getActivityTypes,
    enabled,
  })
}

export function useActivities(query: ActivityListQuery, enabled = true) {
  return useQuery({
    queryKey: [...activityQueryKeys.list(query), useQueryScope()],
    queryFn: () => getActivities(query),
    enabled,
    placeholderData: keepPreviousData,
  })
}

export function useActivityPeopleOptions(
  companyId: string,
  search: string,
  enabled = true
) {
  return useQuery({
    queryKey: [
      ...["activities", "people-options", companyId, search],
      useQueryScope(),
    ],
    queryFn: () => getActivityPeopleOptions(companyId, search),
    enabled,
    staleTime: 30_000,
  })
}

export function useActivityOpportunityOptions(
  companyId: string,
  search: string,
  enabled = true
) {
  return useQuery({
    queryKey: [
      ...["activities", "opportunity-options", companyId, search],
      useQueryScope(),
    ],
    queryFn: () => getActivityOpportunityOptions(companyId, search),
    enabled: enabled && Boolean(companyId),
    staleTime: 30_000,
  })
}

export function useActivityOwnerOptions(enabled = true) {
  return useQuery({
    queryKey: [...["activities", "owner-options"], useQueryScope()],
    queryFn: getActivityOwnerOptions,
    enabled,
    staleTime: 60_000,
  })
}

function useInvalidateActivities() {
  const client = useQueryClient()
  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: ["activities"] }),
      client.invalidateQueries({ queryKey: ["follow-ups"] }),
      client.invalidateQueries({ queryKey: ["dashboard"] }),
      client.invalidateQueries({ queryKey: ["reports"] }),
      client.invalidateQueries({ queryKey: ["companies"] }),
    ])
}

export function useCreateActivity() {
  const invalidate = useInvalidateActivities()
  return useMutation({
    mutationFn: (payload: CreateActivityPayload) => createActivity(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateActivity() {
  const invalidate = useInvalidateActivities()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateActivityPayload
    }) => updateActivity(id, payload),
    onSuccess: invalidate,
  })
}
