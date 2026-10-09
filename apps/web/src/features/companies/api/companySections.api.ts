import { z } from "zod"
import { api } from "@/lib/api"
import { parsePaginatedResponse } from "@/lib/pagination"

export async function getCompanySection<T>(
  url: string,
  page: number,
  limit: number,
  params?: Record<string, unknown>
) {
  const response = await api.get(url, { params: { page, limit, ...params } })
  return parsePaginatedResponse(
    response.data,
    z.custom<T>(
      (value) =>
        !!value &&
        typeof value === "object" &&
        "id" in value &&
        typeof value.id === "string"
    )
  )
}
