import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"

import type {
  CompaniesQuery,
  Company,
  PaginatedCompanies,
} from "../types/company.types"

export async function getCompanies(query: CompaniesQuery) {
  const response = await api.get("/companies", {
    params: {
      page: query.page,
      limit: query.limit,
      search: query.search || undefined,
      priority: query.priority || undefined,
      ownershipScope:
        query.ownershipScope && query.ownershipScope !== "ALL"
          ? query.ownershipScope
          : undefined,
      includeArchived: query.includeArchived ? "true" : undefined,
      archivedOnly: query.archivedOnly ? "true" : undefined,
    },
  })

  return unwrapApiResponse<PaginatedCompanies>(response.data)
}

export async function getCompany(companyId: string) {
  const response = await api.get(`/companies/${companyId}`)
  return unwrapApiResponse<Company>(response.data)
}
