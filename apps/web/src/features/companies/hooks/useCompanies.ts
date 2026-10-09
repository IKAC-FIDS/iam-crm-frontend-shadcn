import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useQueryScope } from "@/lib/queryScope"

import { getCompanies, getCompany } from "../api/companies.api"
import type { CompaniesQuery } from "../types/company.types"

export const companyQueryKeys = {
  all: ["companies"] as const,
  lists: () => [...companyQueryKeys.all, "list"] as const,
  list: (query: CompaniesQuery, scope: string) =>
    [...companyQueryKeys.lists(), scope, query] as const,
  details: () => [...companyQueryKeys.all, "detail"] as const,
  detail: (companyId: string) =>
    [...companyQueryKeys.details(), companyId] as const,
}

export function useCompanies(query: CompaniesQuery) {
  const scope = useQueryScope()
  return useQuery({
    queryKey: companyQueryKeys.list(query, scope),
    queryFn: () => getCompanies(query),
    placeholderData: keepPreviousData,
  })
}

export function useCompany(companyId: string) {
  return useQuery({
    queryKey: companyQueryKeys.detail(companyId),
    queryFn: () => getCompany(companyId),
    enabled: Boolean(companyId),
  })
}
