import { useQuery } from "@tanstack/react-query"

import {
  getCompanyIndustries,
  getCompanySources,
} from "../api/companyCatalogs.api"

export const companyCatalogKeys = {
  sources: ["company-catalogs", "sources"] as const,
  industries: ["company-catalogs", "industries"] as const,
}

export function useCompanySources() {
  return useQuery({
    queryKey: companyCatalogKeys.sources,
    queryFn: getCompanySources,
  })
}

export function useCompanyIndustries() {
  return useQuery({
    queryKey: companyCatalogKeys.industries,
    queryFn: getCompanyIndustries,
  })
}
