import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"

export type QuotaMetricName = "ACTIVE_USERS" | "COMPANIES" | "OPPORTUNITIES" | "FILES" | "STORAGE_BYTES" | "API_CALLS" | "WORKFLOW_RUNS" | "WEBHOOK_DELIVERIES" | "EMAIL_SENDS" | "AI_REQUESTS"
export type QuotaState = "ENFORCED" | "UNLIMITED" | "DISABLED" | "UNCONFIGURED" | "LEGACY_COMPATIBILITY" | "INACTIVE_ORGANIZATION" | "INACTIVE_SUBSCRIPTION"
export type QuotaResetPeriod = "NONE" | "DAILY" | "MONTHLY" | "SUBSCRIPTION_TERM"
export type QuotaMetric = { metric: QuotaMetricName; state: QuotaState; current: string; softLimit: string | null; hardLimit: string | null; resetPeriod: QuotaResetPeriod; resetAt: string | null; threshold: 80 | 90 | null }
export type QuotaSummary = { organizationId: string; generatedAt: string; metrics: QuotaMetric[] }

export async function getCurrentUsage() {
  const response = await api.get("/quota/current")
  const value = unwrapApiResponse<QuotaSummary>(response.data)
  return { ...value, metrics: Array.isArray(value?.metrics) ? value.metrics : [] }
}
