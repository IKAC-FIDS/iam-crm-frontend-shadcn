import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"

export type ReportFilters = {
  startDate?: string
  endDate?: string
  ownershipScope?: "all" | "mine"
}

export type PipelineStage = {
  stage?: string
  stageName?: string
  name?: string
  count?: number
  value?: number
  totalValue?: number
}

export type PipelineSummary = {
  stages?: PipelineStage[]
  summary?: {
    totalCompanies?: number
    activeCompanies?: number
    lostCompanies?: number
    lostRate?: number
    totalValue?: number
    openValue?: number
    wonValue?: number
  }
}

export type ConversionRates = {
  stages?: Array<{
    stage?: string
    stageName?: string
    name?: string
    count?: number
    conversionRate?: number
    rate?: number
  }>
  summary?: {
    totalCompanies?: number
    completedCompanies?: number
    overallConversionRate?: number
  }
}

export type StageDuration = {
  stage?: string
  stageName?: string
  name?: string
  averageDays?: number
  avgDays?: number
  duration?: number
}

export type PipelineOwner = {
  ownerId?: string
  ownerName?: string
  fullName?: string
  name?: string
  totalOpportunities?: number
  opportunityCount?: number
  totalValue?: number
  pipelineValue?: number
  wonValue?: number
}

function params(filters: ReportFilters) {
  const p: Record<string, string> = {}
  if (filters.startDate) p.startDate = filters.startDate
  if (filters.endDate) p.endDate = filters.endDate
  if (filters.ownershipScope && filters.ownershipScope !== "all") p.ownershipScope = filters.ownershipScope
  return p
}

export async function getPipelineSummary(filters: ReportFilters) {
  const response = await api.get("/reports/pipeline-summary", { params: params(filters) })
  return unwrapApiResponse<PipelineSummary>(response.data)
}

export async function getConversionRates(filters: ReportFilters) {
  const response = await api.get("/reports/conversion-rates", { params: params(filters) })
  return unwrapApiResponse<ConversionRates>(response.data)
}

export async function getStageDurations(filters: ReportFilters) {
  const response = await api.get("/reports/stage-durations", { params: params(filters) })
  return unwrapApiResponse<StageDuration[]>(response.data)
}

export async function getPipelineByOwner(filters: ReportFilters) {
  const response = await api.get("/reports/pipeline/by-owner", { params: params(filters) })
  return unwrapApiResponse<PipelineOwner[]>(response.data)
}
