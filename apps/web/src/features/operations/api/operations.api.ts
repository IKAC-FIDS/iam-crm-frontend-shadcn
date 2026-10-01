import { z } from "zod"

import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"
import { parsePaginatedResponse } from "@/lib/pagination"
import type {
  OperationsCompaniesQuery,
  OperationsCompanyRow,
  OperationsWorkspace,
} from "../types/operations.types"

const operationsCompanySchema = z.custom<OperationsCompanyRow>(
  (value) =>
    Boolean(value) &&
    typeof value === "object" &&
    "company" in (value as object) &&
    "attention" in (value as object)
)

export async function getOperationsWorkspace() {
  const response = await api.get("/operations/workspace", {
    params: { recentLimit: 5 },
  })
  return unwrapApiResponse<OperationsWorkspace>(response.data)
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
    },
  })
  return parsePaginatedResponse(response.data, operationsCompanySchema)
}
