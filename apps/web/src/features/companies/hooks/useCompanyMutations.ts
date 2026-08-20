import { useMutation, useQuery } from "@tanstack/react-query"

import { queryClient } from "@/lib/queryClient"

import {
  archiveCompany,
  changeCompanyOwner,
  createCompany,
  getCompanyOwnerOptions,
  restoreCompany,
  updateCompany,
} from "../api/companies.api"
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

export function useCompanyOwnerOptions(enabled = true) {
  return useQuery({
    queryKey: ["company-owner-options"],
    queryFn: getCompanyOwnerOptions,
    enabled,
    staleTime: 60_000,
  })
}

function invalidateCompany(companyId: string, company: unknown) {
  queryClient.setQueryData(companyQueryKeys.detail(companyId), company)
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: companyQueryKeys.lists() }),
    queryClient.invalidateQueries({ queryKey: ["company-360-overview", companyId] }),
  ])
}

export function useChangeCompanyOwner(companyId: string) {
  return useMutation({
    mutationFn: (newOwnerId: string) => changeCompanyOwner(companyId, newOwnerId),
    onSuccess: (company) => invalidateCompany(companyId, company),
  })
}

export function useArchiveCompany(companyId: string) {
  return useMutation({
    mutationFn: (reason?: string) => archiveCompany(companyId, reason),
    onSuccess: (company) => invalidateCompany(companyId, company),
  })
}

export function useRestoreCompany(companyId: string) {
  return useMutation({
    mutationFn: () => restoreCompany(companyId),
    onSuccess: (company) => invalidateCompany(companyId, company),
  })
}
