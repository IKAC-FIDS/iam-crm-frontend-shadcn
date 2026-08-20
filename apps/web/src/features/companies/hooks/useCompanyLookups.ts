import { useQuery } from "@tanstack/react-query"

import {
  getIndustries,
  getLeadSources,
} from "../api/companyLookups.api"

export const companyLookupKeys = {
  leadSources: ["company-lookups", "lead-sources"] as const,
  industries: ["company-lookups", "industries"] as const,
}

export function useLeadSources(enabled = true) {
  return useQuery({
    queryKey: companyLookupKeys.leadSources,
    queryFn: getLeadSources,
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useIndustries(enabled = true) {
  return useQuery({
    queryKey: companyLookupKeys.industries,
    queryFn: getIndustries,
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}
