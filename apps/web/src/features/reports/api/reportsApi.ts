import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"

export type ReportFilters = {
  startDate?: string
  endDate?: string
  ownershipScope?: "all" | "mine" | "team" | "unassigned"
}

export type ComparisonMetric = {
  current: number
  previous: number
  delta: number
}

export type ConversionHealth = {
  definition: { cohort: string; conversion: string }
  period: { startDate: string; endDate: string; defaultedToLast90Days: boolean }
  comparisonPeriod: { startDate: string; endDate: string }
  summary: {
    totalLeads: number
    won: number
    lost: number
    onHold: number
    active: number
    leadToCustomer: ComparisonMetric
    lostRate: ComparisonMetric
    medianTimeToWinDays: ComparisonMetric
    recoveryRate: ComparisonMetric
  }
  outcomes: Array<{
    key: "won" | "lost" | "onHold" | "active"
    label: string
    count: number
    rate: number
  }>
  milestones: Array<{ key: string; label: string; reached: number; reachRate: number }>
  biggestLeakage: {
    fromKey: string
    fromLabel: string
    toKey: string
    toLabel: string
    dropCount: number
    dropRate: number
  } | null
  trend: Array<{ month: string; leads: number; won: number }>
  owners: Array<{
    ownerId: string
    ownerName: string
    total: number
    won: number
    pipelineValue: number
    conversionRate: number
    avgOpportunityValue: number
  }>
  recovery: { enteredOnHold: number; recovered: number; rate: number }
}

function params(filters: ReportFilters) {
  const value: Record<string, string> = {}
  if (filters.startDate) value.startDate = filters.startDate
  if (filters.endDate) value.endDate = filters.endDate
  if (filters.ownershipScope && filters.ownershipScope !== "all") {
    value.ownershipScope = filters.ownershipScope
  }
  return value
}

export async function getConversionHealth(filters: ReportFilters) {
  const response = await api.get("/reports/conversion-health", { params: params(filters) })
  return unwrapApiResponse<ConversionHealth>(response.data)
}


