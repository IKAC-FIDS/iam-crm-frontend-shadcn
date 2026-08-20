import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"

import type { SourceRef } from "../types/company.types"

export async function getLeadSources() {
  const response = await api.get("/lead-sources")
  return unwrapApiResponse<SourceRef[]>(response.data)
}
