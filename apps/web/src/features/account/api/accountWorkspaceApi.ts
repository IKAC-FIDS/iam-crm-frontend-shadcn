import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"
import type { AccountWorkspace } from "../types/accountWorkspace.types"

export type AccountWorkspaceFilters = {
  startDate?: string
  endDate?: string
  recentLimit?: number
}
export async function getAccountWorkspace(filters: AccountWorkspaceFilters) {
  const response = await api.get("/account/workspace", { params: filters })
  return unwrapApiResponse<AccountWorkspace>(response.data)
}
