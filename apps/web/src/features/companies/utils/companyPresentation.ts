import type { StatusTone } from "@/components/shared/StatusBadge"

import type {
  CompanyEngagementStatus,
  CompanyPriority,
} from "../types/company.types"

export const companyEngagementLabels: Record<CompanyEngagementStatus, string> =
  {
    ACTIVE: "فعال",
    NEEDS_ACTION: "نیازمند اقدام",
    NURTURE: "پرورش",
    SNOOZED: "پیگیری در آینده",
    DORMANT: "راکد",
    DISQUALIFIED: "نامناسب",
  }

export const companyEngagementTones: Record<
  CompanyEngagementStatus,
  StatusTone
> = {
  ACTIVE: "success",
  NEEDS_ACTION: "warning",
  NURTURE: "info",
  SNOOZED: "neutral",
  DORMANT: "neutral",
  DISQUALIFIED: "error",
}

export const companyPriorityTone: Record<CompanyPriority, StatusTone> = {
  LOW: "neutral",
  MEDIUM: "info",
  HIGH: "warning",
  STRATEGIC: "primary",
}
