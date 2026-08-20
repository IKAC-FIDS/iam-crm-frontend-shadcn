import { useQuery } from "@tanstack/react-query"

import { api } from "@/lib/api"

export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export type PaginatedSection<T> = {
  data: T[]
  meta: PaginationMeta
}

type PaginatedEnvelope<T> = {
  success?: boolean
  data: T[]
  meta: PaginationMeta
}

function useCompanySection<T>(
  key: string,
  url: string,
  companyId: string,
  page = 1,
  limit = 10,
) {
  return useQuery({
    queryKey: [key, companyId, page, limit],
    queryFn: async () => {
      const response = await api.get<PaginatedEnvelope<T>>(url, {
        params: { page, limit },
      })

      return {
        data: response.data.data,
        meta: response.data.meta,
      } satisfies PaginatedSection<T>
    },
    enabled: Boolean(companyId),
  })
}

export function useCompanyBranches<T = unknown>(
  companyId: string,
  page = 1,
  limit = 10,
) {
  return useCompanySection<T>(
    "company-branches",
    `/companies/${companyId}/branches`,
    companyId,
    page,
    limit,
  )
}

export function useCompanySocialChannels<T = unknown>(
  companyId: string,
  page = 1,
  limit = 10,
) {
  return useCompanySection<T>(
    "company-social-channels",
    `/companies/${companyId}/social-channels`,
    companyId,
    page,
    limit,
  )
}

export function useCompanyLegalDocuments<T = unknown>(
  companyId: string,
  page = 1,
  limit = 10,
) {
  return useCompanySection<T>(
    "company-legal-documents",
    `/companies/${companyId}/legal-documents`,
    companyId,
    page,
    limit,
  )
}
