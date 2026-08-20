import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"

import type {
  CompaniesQuery,
  Company,
  PaginatedCompanies,
} from "../types/company.types"

interface PaginatedCompaniesEnvelope {
  success?: boolean
  data: Company[]
  meta: PaginatedCompanies["meta"]
  requestId?: string | null
  timestamp?: string
}

export async function getCompanies(query: CompaniesQuery) {
  const response = await api.get<PaginatedCompaniesEnvelope | PaginatedCompanies>(
    "/companies",
    {
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
    },
  )

  const payload = response.data

  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray(payload.data) &&
    payload.meta
  ) {
    return {
      data: payload.data,
      meta: payload.meta,
    } satisfies PaginatedCompanies
  }

  return unwrapApiResponse<PaginatedCompanies>(payload)
}

export async function getCompany(companyId: string) {
  const response = await api.get(`/companies/${companyId}`)
  return unwrapApiResponse<Company>(response.data)
}
