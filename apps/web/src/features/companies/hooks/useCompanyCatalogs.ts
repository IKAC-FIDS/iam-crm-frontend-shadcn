import { useQuery } from "@tanstack/react-query"

import { getCompanySources } from "../api/companyCatalogs.api"

export const companyCatalogKeys = {
  sources: ["company-catalogs", "sources"] as const,
}

export function useCompanySources() {
  return useQuery({
    queryKey: companyCatalogKeys.sources,
    queryFn: getCompanySources,
  })
}
