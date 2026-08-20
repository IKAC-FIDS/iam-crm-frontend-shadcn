import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"

import type {
  CompaniesQuery,
  Company,
  PaginatedCompanies,
  CreateCompanyPayload,
  UpdateCompanyPayload,
} from "../types/company.types"

interface PaginatedCompaniesEnvelope {
  success?: boolean
  data: Company[]
  meta: PaginatedCompanies["meta"]
}

export async function getCompanies(query: CompaniesQuery) {
  const response = await api.get<PaginatedCompaniesEnvelope>(
    "/companies",
    {
      params: {
        page: query.page,
        limit: query.limit,
        search: query.search || undefined,
        priority: query.priority || undefined,
        ownershipScope:
          query.ownershipScope && query.ownershipScope !== "ALL"
            ? query.ownershipScope.toLowerCase()
            : undefined,
        includeArchived: query.includeArchived ? "true" : undefined,
        archivedOnly: query.archivedOnly ? "true" : undefined,
      },
    },
  )

  return {
    data: response.data.data,
    meta: response.data.meta,
  } satisfies PaginatedCompanies
}

export async function getCompany(companyId: string) {
  const response = await api.get(`/companies/${companyId}`)
  return unwrapApiResponse<Company>(response.data)
}

export async function createCompany(payload: CreateCompanyPayload) {
  const response = await api.post("/companies", payload)
  return unwrapApiResponse<Company>(response.data)
}

export async function updateCompany(
  companyId: string,
  payload: UpdateCompanyPayload,
) {
  const response = await api.patch(`/companies/${companyId}`, payload)
  return unwrapApiResponse<Company>(response.data)
}
