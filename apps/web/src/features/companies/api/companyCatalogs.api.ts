import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"

export interface CompanySourceOption {
  id: string
  name: string
  code?: string
}

export async function getCompanySources() {
  const response = await api.get("/catalogs/company-sources")
  return unwrapApiResponse<CompanySourceOption[]>(response.data)
}
