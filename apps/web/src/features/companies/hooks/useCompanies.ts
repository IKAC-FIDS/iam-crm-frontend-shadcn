import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { getCompanies, getCompany } from "../api/companies.api"
import type { CompaniesQuery } from "../types/company.types"

export const companyQueryKeys = {
  all: ["companies"] as const,
  lists: () => [...companyQueryKeys.all, "list"] as const,
  list: (query: CompaniesQuery) => [...companyQueryKeys.lists(), query] as const,
  details: () => [...companyQueryKeys.all, "detail"] as const,
  detail: (companyId: string) =>
    [...companyQueryKeys.details(), companyId] as const,
}

export function useCompanies(query: CompaniesQuery) {
  return useQuery({
    queryKey: companyQueryKeys.list(query),
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
