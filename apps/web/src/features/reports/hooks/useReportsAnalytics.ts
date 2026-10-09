import { useQuery } from "@tanstack/react-query"
import {
  getConversionHealth,
  getReportFilterOptions,
  getUserPerformance,
  type ReportFilters,
  type UserPerformanceFilters,
} from "../api/reportsApi"

export function useReportsAnalytics(filters: ReportFilters, enabled = true) {
  return useQuery({
    queryKey: ["reports", "analytics", filters],
    queryFn: () => getConversionHealth(filters),
    enabled,
  })
}

export function useUserPerformanceReport(
  filters: UserPerformanceFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["reports", "user-performance", filters],
    queryFn: () => getUserPerformance(filters),
    enabled,
  })
}

export function useReportFilterOptions(enabled = true) {
  return useQuery({
    queryKey: ["reports", "filter-options"],
    queryFn: getReportFilterOptions,
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}


