import { useQuery } from "@tanstack/react-query"
import {
  getConversionRates,
  getPipelineByOwner,
  getPipelineSummary,
  getStageDurations,
  type ReportFilters,
} from "../api/reportsApi"

export function useReportsOverview(filters: ReportFilters, enabled = true) {
  const pipeline = useQuery({
    queryKey: ["reports", "overview", "pipeline", filters],
    queryFn: () => getPipelineSummary(filters),
    enabled,
  })
  const conversion = useQuery({
    queryKey: ["reports", "overview", "conversion", filters],
    queryFn: () => getConversionRates(filters),
    enabled,
  })
  const durations = useQuery({
    queryKey: ["reports", "overview", "durations", filters],
    queryFn: () => getStageDurations(filters),
    enabled,
  })
  const owners = useQuery({
    queryKey: ["reports", "overview", "owners", filters],
    queryFn: () => getPipelineByOwner(filters),
    enabled,
  })
  return { pipeline, conversion, durations, owners }
}
