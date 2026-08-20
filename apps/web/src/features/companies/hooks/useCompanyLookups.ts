import { useQuery } from "@tanstack/react-query"

import { getLeadSources } from "../api/companyLookups.api"

export const companyLookupKeys = {
  leadSources: ["company-lookups", "lead-sources"] as const,
}

export function useLeadSources(enabled = true) {
  return useQuery({
    queryKey: companyLookupKeys.leadSources,
    queryFn: getLeadSources,
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}
