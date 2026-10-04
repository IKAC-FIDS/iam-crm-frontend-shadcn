import { z } from "zod"

import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"
import { parsePaginatedResponse } from "@/lib/pagination"
import type {
  OperationsCompaniesQuery,
  OperationsCompanyRow,
  OperationsOpportunity,
  OperationsWorkspace,
} from "../types/operations.types"

const operationsCompanySchema = z.custom<OperationsCompanyRow>(
  (value) =>
    Boolean(value) &&
    typeof value === "object" &&
    "company" in (value as object) &&
    "attention" in (value as object)
)

export async function getOperationsWorkspace(userId?: string, recentLimit = 5) {
  const response = await api.get("/operations/workspace", {
    params: { recentLimit, userId },
  })
  return unwrapApiResponse<OperationsWorkspace>(response.data)
}

export async function getOperationsCompanyOpportunities(companyId: string) {
  const response = await api.get(
    `/operations/companies/${companyId}/opportunities`
  )
  return unwrapApiResponse<{ data: OperationsOpportunity[]; total: number }>(
    response.data
  )
}

export async function getOperationsCompanies(query: OperationsCompaniesQuery) {
  const response = await api.get("/operations/companies", {
    params: {
      ...query,
      hasUnreadMessages:
        query.hasUnreadMessages == null
          ? undefined
          : String(query.hasUnreadMessages),
      hasActiveOpportunity:
        query.hasActiveOpportunity == null
          ? undefined
          : String(query.hasActiveOpportunity),
      hasNoNextAction:
        query.hasNoNextAction == null
          ? undefined
          : String(query.hasNoNextAction),
      pinnedOnly:
        query.pinnedOnly == null ? undefined : String(query.pinnedOnly),
      includeInactivePortfolio:
        query.includeInactivePortfolio == null
          ? undefined
          : String(query.includeInactivePortfolio),
    },
  })
  return parsePaginatedResponse(response.data, operationsCompanySchema)
}

export async function updateCompanyEngagement(
  companyId: string,
  payload: {
    status: import("../types/operations.types").CompanyEngagementStatus
    reason?: string
    nextReviewAt?: string
  }
) {
  const response = await api.patch(
    `/companies/${companyId}/engagement`,
    payload
  )
  return unwrapApiResponse<OperationsCompanyRow["company"]>(response.data)
}

export async function updateCompanyPin(companyId: string, isPinned: boolean) {
  const response = await api.patch(`/companies/${companyId}/pin`, { isPinned })
  return unwrapApiResponse<{ companyId: string; isPinned: boolean }>(
    response.data
  )
}
