import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  cancelMeeting,
  completeMeeting,
  createMeeting,
  getMeeting,
  getMeetingAssignees,
  getMeetingOpportunities,
  getMeetingPeople,
  getMeetings,
  updateMeeting,
} from "../api/meetings.api"
import type {
  Meeting,
  MeetingPayload,
  MeetingQuery,
} from "../types/meeting.types"

export const meetingKeys = {
  all: ["meetings"] as const,
  lists: () => [...meetingKeys.all, "list"] as const,
  list: (query: MeetingQuery) => [...meetingKeys.lists(), query] as const,
  details: () => [...meetingKeys.all, "detail"] as const,
  detail: (id: string) => [...meetingKeys.details(), id] as const,
  assignees: (search: string) =>
    [...meetingKeys.all, "assignees", search] as const,
  opportunities: (companyId: string, search: string) =>
    [...meetingKeys.all, "opportunities", companyId, search] as const,
  people: (companyId: string, search: string) =>
    [...meetingKeys.all, "people", companyId, search] as const,
}

export function useMeetings(query: MeetingQuery, enabled = true) {
  return useQuery({
    queryKey: meetingKeys.list(query),
    queryFn: () => getMeetings(query),
    enabled,
    placeholderData: keepPreviousData,
  })
}

export function useMeeting(id: string, enabled = true) {
  return useQuery({
    queryKey: meetingKeys.detail(id),
    queryFn: () => getMeeting(id),
    enabled: enabled && Boolean(id),
  })
}

function useInvalidateMeeting() {
  const queryClient = useQueryClient()
  return async (meeting?: Meeting) => {
    const requests = [
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() }),
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
    ]
    if (meeting?.id)
      requests.push(
        queryClient.invalidateQueries({
          queryKey: meetingKeys.detail(meeting.id),
        })
      )
    if (meeting?.companyId) {
      requests.push(
        queryClient.invalidateQueries({
          queryKey: ["companies", "detail", meeting.companyId],
        })
      )
      requests.push(
        queryClient.invalidateQueries({
          queryKey: ["company-360-overview", meeting.companyId],
        })
      )
      requests.push(
        queryClient.invalidateQueries({
          queryKey: ["company-meetings", meeting.companyId],
        })
      )
    }
    if (meeting?.opportunityId)
      requests.push(
        queryClient.invalidateQueries({
          queryKey: ["opportunities", "detail", meeting.opportunityId],
        })
      )
    await Promise.all(requests)
  }
}

export function useCreateMeeting() {
  const invalidate = useInvalidateMeeting()
  return useMutation({ mutationFn: createMeeting, onSuccess: invalidate })
}

export function useUpdateMeeting() {
  const invalidate = useInvalidateMeeting()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Partial<MeetingPayload>
      previous?: Meeting
    }) => updateMeeting(id, payload),
    onSuccess: async (updated, variables) => {
      await Promise.all([invalidate(updated), invalidate(variables.previous)])
    },
  })
}

export function useCompleteMeeting() {
  const invalidate = useInvalidateMeeting()
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      completeMeeting(id, note),
    onSuccess: invalidate,
  })
}

export function useCancelMeeting() {
  const invalidate = useInvalidateMeeting()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      cancelMeeting(id, reason),
    onSuccess: invalidate,
  })
}

export function useMeetingAssignees(search: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: meetingKeys.assignees(search.trim()),
    queryFn: ({ pageParam }) => getMeetingAssignees(search, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta?.hasNext ? last.meta.page + 1 : undefined,
    enabled,
    staleTime: 120_000,
  })
}

export function useMeetingOpportunityOptions(
  companyId: string,
  search: string,
  enabled = true
) {
  return useInfiniteQuery({
    queryKey: meetingKeys.opportunities(companyId, search.trim()),
    queryFn: ({ pageParam }) =>
      getMeetingOpportunities(companyId, search, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.hasNext ? last.meta.page + 1 : undefined,
    enabled: enabled && Boolean(companyId),
    staleTime: 120_000,
  })
}

export function useMeetingPeopleOptions(
  companyId: string,
  search: string,
  enabled = true
) {
  return useInfiniteQuery({
    queryKey: meetingKeys.people(companyId, search.trim()),
    queryFn: ({ pageParam }) => getMeetingPeople(companyId, search, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.hasNext ? last.meta.page + 1 : undefined,
    enabled: enabled && Boolean(companyId),
    staleTime: 120_000,
  })
}
