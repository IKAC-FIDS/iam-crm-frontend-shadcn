import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"

export type ReportFilters = {
  startDate?: string
  endDate?: string
  ownershipScope?: "all" | "mine" | "team" | "unassigned"
}

export type UserPerformanceFilters = {
  startDate?: string
  endDate?: string
  teamId?: string
}

export type ReportUserOption = {
  id: string
  fullName: string
  email?: string | null
  isActive?: boolean
  teamId?: string | null
  teamRef?: { id: string; code: string; name: string } | null
}

export type ReportTeamOption = {
  id: string
  value: string
  code: string
  name: string
  label: string
}

export type UserPerformanceMetrics = {
  activity: {
    total: number
    breakdown: Array<{ code: string; label: string; count: number; percentage?: number }>
  }
  companiesCreated: number
  tasksCreated: number
  tasksAssigned: { total: number; completed: number; incomplete: number }
  opportunities: UserPerformanceReport["opportunities"]
}

export type UserPerformanceReport = {
  period: {
    startDate: string | null
    endDate: string | null
    dateBasis: Record<string, string>
  }
  users: ReportUserOption[]
  members: Array<UserPerformanceMetrics & { user: ReportUserOption }>
  activity: {
    total: number
    breakdown: Array<{ code: string; label: string; count: number }>
    uncataloguedCount: number
  }
  companiesCreated: number
  tasksCreated: number
  tasksAssigned: { total: number; completed: number; incomplete: number }
  opportunities: {
    total: number
    active: number
    won: number
    lost: number
    totalValue: number | null
    activeValue: number | null
    wonValue: number | null
    lostValue: number | null
  }
  financialVisible: boolean
}

export type ReportFilterOptions = {
  users: ReportUserOption[]
  teams: ReportTeamOption[]
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

export async function getUserPerformance(filters: UserPerformanceFilters) {
  const response = await api.get("/reports/user-performance", {
    params: {
      ...(filters.startDate ? { startDate: filters.startDate } : {}),
      ...(filters.endDate ? { endDate: filters.endDate } : {}),
      ...(filters.teamId ? { teams: filters.teamId } : {}),
    },
  })
  return unwrapApiResponse<UserPerformanceReport>(response.data)
}

export async function getReportFilterOptions() {
  const response = await api.get("/reports/filter-options")
  return unwrapApiResponse<ReportFilterOptions>(response.data)
}


