import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"

export type ExchangeRateStatus = "ACTIVE" | "HISTORICAL"

export type ExchangeRate = {
  id: string
  baseCurrency?: string
  quoteCurrency?: string
  rate: string | number
  validFrom: string
  validTo?: string | null
  note?: string | null
  status: ExchangeRateStatus
  createdAt?: string
  createdById?: string | null
  createdBy?: {
    id: string
    fullName: string
    email: string
  } | null
}

export type PageMeta = {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export type CreateExchangeRateResult = {
  rate: ExchangeRate
  recalculatedProductCount: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function normalizePage<T>(value: unknown): { data: T[]; meta: PageMeta } {
  if (
    isRecord(value) &&
    Array.isArray(value.data) &&
    value.meta &&
    typeof value.meta === "object"
  ) {
    return {
      data: value.data as T[],
      meta: value.meta as PageMeta,
    }
  }

  const unwrapped = unwrapApiResponse<unknown>(value)

  if (Array.isArray(unwrapped)) {
    return {
      data: unwrapped as T[],
      meta: {
        total: unwrapped.length,
        page: 1,
        limit: unwrapped.length || 20,
        totalPages: unwrapped.length ? 1 : 0,
        hasNext: false,
        hasPrevious: false,
      },
    }
  }

  return {
    data: [],
    meta: {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    },
  }
}

export async function getCurrentExchangeRate() {
  const response = await api.get("/admin/exchange-rates/current")
  return unwrapApiResponse<ExchangeRate | null>(response.data)
}

export async function getExchangeRates(page: number, limit: number) {
  const response = await api.get("/admin/exchange-rates", {
    params: { page, limit },
  })

  return normalizePage<ExchangeRate>(response.data)
}

export async function createExchangeRate(payload: {
  rate: string
  effectiveFrom?: string
  note?: string
}) {
  const response = await api.post("/admin/exchange-rates", payload)
  return unwrapApiResponse<CreateExchangeRateResult>(response.data)
}
