import { useQuery } from "@tanstack/react-query"

import {
  getDashboardLatestActivities,
  getDashboardSummary,
} from "../api/dashboardApi"

export function useDashboardSummary(enabled: boolean) {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: getDashboardSummary,
    enabled,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })
}

export function useDashboardLatestActivities(enabled: boolean) {
  return useQuery({
    queryKey: ["dashboard", "latest-activities"],
    queryFn: getDashboardLatestActivities,
    enabled,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })
}
