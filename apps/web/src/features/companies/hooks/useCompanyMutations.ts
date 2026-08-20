import { useMutation } from "@tanstack/react-query"

import { queryClient } from "@/lib/queryClient"

import { createCompany, updateCompany } from "../api/companies.api"
import type {
  CreateCompanyPayload,
  UpdateCompanyPayload,
} from "../types/company.types"
import { companyQueryKeys } from "./useCompanies"

export function useCreateCompany() {
  return useMutation({
    mutationFn: (payload: CreateCompanyPayload) => createCompany(payload),
    onSuccess: async (company) => {
      await queryClient.invalidateQueries({ queryKey: companyQueryKeys.lists() })
      queryClient.setQueryData(companyQueryKeys.detail(company.id), company)
    },
  })
}

export function useUpdateCompany(companyId: string) {
  return useMutation({
    mutationFn: (payload: UpdateCompanyPayload) =>
      updateCompany(companyId, payload),
    onSuccess: async (company) => {
      queryClient.setQueryData(companyQueryKeys.detail(companyId), company)
      await queryClient.invalidateQueries({ queryKey: companyQueryKeys.lists() })
    },
  })
}
