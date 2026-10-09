import { formatJalaliDate } from "@/lib/date/jalali"
import { uiText } from "@/config/uiText"
import type { Opportunity, OpportunityPriority } from "../types/opportunity.types"

export function opportunityCompanyName(opportunity: Opportunity) {
  return opportunity.company?.brandName || opportunity.company?.legalName || uiText.common.notAvailable
}

export function formatOpportunityValue(value?: number | string | null) {
  if (value === null || value === undefined || value === "") return uiText.common.notAvailable
  const number = Number(value)
  return Number.isFinite(number) ? number.toLocaleString("fa-IR") : uiText.common.notAvailable
}

export function formatOpportunityDate(value?: string | null) {
  return formatJalaliDate(value) || uiText.common.notAvailable
}

export function priorityLabel(value?: OpportunityPriority | null) {
  return value ? uiText.opportunities.priorities[value] : uiText.common.notAvailable
}

