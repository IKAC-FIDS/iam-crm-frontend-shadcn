import { useMutation, useQuery } from "@tanstack/react-query"

import { queryClient } from "@/lib/queryClient"

import {
  archiveCompany,
  changeCompanyOwner,
  createCompany,
  getCompanyOwnerOptions,
  restoreCompany,
  updateCompany,
  updateCompanyEngagement,
  updateCompanyPin,
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
      await queryClient.invalidateQueries({
        queryKey: companyQueryKeys.lists(),
      })
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
      await queryClient.invalidateQueries({
        queryKey: companyQueryKeys.lists(),
      })
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
    queryClient.invalidateQueries({
      queryKey: ["company-360-overview", companyId],
    }),
  ])
}

export function useChangeCompanyOwner(companyId: string) {
  return useMutation({
    mutationFn: (newOwnerId: string) =>
      changeCompanyOwner(companyId, newOwnerId),
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

export function useUpdateCompanyEngagement(companyId: string) {
  return useMutation({
    mutationFn: (payload: Parameters<typeof updateCompanyEngagement>[1]) =>
      updateCompanyEngagement(companyId, payload),
    onSuccess: async (updated) => {
      queryClient.setQueryData(
        companyQueryKeys.detail(companyId),
        (company: import("../types/company.types").Company | undefined) =>
          company
            ? { ...company, ...updated, isPinned: company.isPinned }
            : company
      )
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: companyQueryKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: ["company-360-overview", companyId],
        }),
        queryClient.invalidateQueries({ queryKey: ["operations"] }),
      ])
    },
  })
}

export function useUpdateCompanyPin(companyId: string) {
  return useMutation({
    mutationFn: (isPinned: boolean) => updateCompanyPin(companyId, isPinned),
    onSuccess: async ({ isPinned }) => {
      queryClient.setQueryData(
        companyQueryKeys.detail(companyId),
        (company: import("../types/company.types").Company | undefined) =>
          company ? { ...company, isPinned } : company
      )
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: companyQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: ["operations"] }),
      ])
    },
  })
}

export function useSetCompanyPin() {
  return useMutation({
    mutationFn: ({
      companyId,
      isPinned,
    }: {
      companyId: string
      isPinned: boolean
    }) => updateCompanyPin(companyId, isPinned),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: companyQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["operations"] }),
      ])
    },
  })
}

export function useSetCompanyEngagement() {
  return useMutation({
    mutationFn: ({
      companyId,
      payload,
    }: {
      companyId: string
      payload: Parameters<typeof updateCompanyEngagement>[1]
    }) => updateCompanyEngagement(companyId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: companyQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["operations"] }),
      ])
    },
  })
}
