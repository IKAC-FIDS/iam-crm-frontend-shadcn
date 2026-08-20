import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"

export interface CompanyCatalogOption {
  id: string
  name: string
  code?: string | null
}

export async function getCompanySources() {
  const response = await api.get("/catalogs/company-sources")
  return unwrapApiResponse<CompanyCatalogOption[]>(response.data)
}

export async function getCompanyIndustries() {
  const response = await api.get("/catalogs/company-industries")
  return unwrapApiResponse<CompanyCatalogOption[]>(response.data)
}
