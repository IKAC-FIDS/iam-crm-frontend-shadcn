import { useQuery } from "@tanstack/react-query"
import { getConversionHealth, type ReportFilters } from "../api/reportsApi"

export function useReportsAnalytics(filters: ReportFilters, enabled = true) {
  return useQuery({
    queryKey: ["reports", "analytics", filters],
    queryFn: () => getConversionHealth(filters),
    enabled,
  })
}

