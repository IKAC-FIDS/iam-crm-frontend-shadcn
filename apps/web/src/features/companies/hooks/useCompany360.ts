import { useQuery } from "@tanstack/react-query"

import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"

export type Company360Overview = {
  companyId: string
  generatedAt: string
  summary: {
    peopleCount: number
    branchCount: number
    socialChannelCount: number
    opportunityCount: number
    openOpportunityCount: number
    taskCount: number
    activeTaskCount: number
    meetingCount: number
    upcomingMeetingCount: number
    activityCount: number
    legalDocumentCount: number
  }
}

export const company360OverviewQueryKeys = {
  detail: (companyId: string) => ["company-360-overview", companyId] as const,
}

export function useCompany360Overview(companyId: string) {
  return useQuery({
    queryKey: company360OverviewQueryKeys.detail(companyId),
    queryFn: async () => {
      const response = await api.get(`/companies/${companyId}/overview`)
      return unwrapApiResponse<Company360Overview>(response.data)
    },
    enabled: Boolean(companyId),
  })
}
