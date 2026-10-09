import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"

import type { IndustryRef, SourceRef } from "../types/company.types"

export async function getLeadSources() {
  const response = await api.get("/lead-sources")
  return unwrapApiResponse<SourceRef[]>(response.data)
}

export async function getIndustries() {
  const response = await api.get("/industries")
  return unwrapApiResponse<IndustryRef[]>(response.data)
}
