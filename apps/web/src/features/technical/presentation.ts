import type { StatusTone } from "@/components/shared/StatusBadge"
import type {
  DocumentStatus,
  KnowledgeStatus,
  ReleaseStatus,
  RequirementStatus,
  ResourceStatus,
  ResourceType,
  TenderStatus,
  TenderType,
} from "./types"

export const confidentialityLabels = {
  INTERNAL: "داخلی",
  CONFIDENTIAL: "محرمانه",
  RESTRICTED: "محدود",
} as const
type Present<T extends string> = {
  label: Record<T, string>
  tone: Record<T, StatusTone>
}
const tone = {
  draft: "neutral",
  info: "info",
  success: "success",
  warning: "warning",
  error: "error",
  primary: "primary",
} as const
export const releasePresentation: Present<ReleaseStatus> = {
  label: {
    DRAFT: "پیش‌نویس",
    PLANNED: "برنامه‌ریزی‌شده",
    RELEASED: "منتشرشده",
    DEPRECATED: "منسوخ",
    END_OF_LIFE: "پایان عمر",
    ARCHIVED: "بایگانی‌شده",
  },
  tone: {
    DRAFT: tone.draft,
    PLANNED: tone.info,
    RELEASED: tone.success,
    DEPRECATED: tone.warning,
    END_OF_LIFE: tone.error,
    ARCHIVED: tone.draft,
  },
}
export const knowledgePresentation: Present<KnowledgeStatus> = {
  label: {
    DRAFT: "پیش‌نویس",
    IN_REVIEW: "در بازبینی",
    PUBLISHED: "منتشرشده",
    ARCHIVED: "بایگانی‌شده",
  },
  tone: {
    DRAFT: tone.draft,
    IN_REVIEW: tone.warning,
    PUBLISHED: tone.success,
    ARCHIVED: tone.draft,
  },
}
export const documentPresentation: Present<DocumentStatus> = {
  label: {
    DRAFT: "پیش‌نویس",
    IN_REVIEW: "در بازبینی",
    APPROVED: "تأییدشده",
    ACTIVE: "فعال",
    SUPERSEDED: "جایگزین‌شده",
    EXPIRED: "منقضی",
    ARCHIVED: "بایگانی‌شده",
  },
  tone: {
    DRAFT: tone.draft,
    IN_REVIEW: tone.warning,
    APPROVED: tone.info,
    ACTIVE: tone.success,
    SUPERSEDED: tone.warning,
    EXPIRED: tone.error,
    ARCHIVED: tone.draft,
  },
}
export const resourcePresentation: Present<ResourceStatus> = {
  label: {
    DRAFT: "پیش‌نویس",
    ACTIVE: "فعال",
    DEPRECATED: "منسوخ",
    ARCHIVED: "بایگانی‌شده",
  },
  tone: {
    DRAFT: tone.draft,
    ACTIVE: tone.success,
    DEPRECATED: tone.warning,
    ARCHIVED: tone.draft,
  },
}
export const tenderPresentation: Present<TenderStatus> = {
  label: {
    DRAFT: "پیش‌نویس",
    IDENTIFIED: "شناسایی‌شده",
    QUALIFICATION: "ارزیابی اولیه",
    PREPARING: "در حال آماده‌سازی",
    TECHNICAL_REVIEW: "بازبینی فنی",
    COMMERCIAL_REVIEW: "بازبینی تجاری",
    READY_FOR_SUBMISSION: "آماده ارسال",
    SUBMITTED: "ارسال‌شده",
    UNDER_EVALUATION: "در ارزیابی",
    CLARIFICATION: "رفع ابهام",
    WON: "برنده",
    LOST: "از دست رفته",
    CANCELLED: "لغوشده",
    ARCHIVED: "بایگانی‌شده",
  },
  tone: {
    DRAFT: tone.draft,
    IDENTIFIED: tone.info,
    QUALIFICATION: tone.info,
    PREPARING: tone.warning,
    TECHNICAL_REVIEW: tone.warning,
    COMMERCIAL_REVIEW: tone.warning,
    READY_FOR_SUBMISSION: tone.primary,
    SUBMITTED: tone.primary,
    UNDER_EVALUATION: tone.info,
    CLARIFICATION: tone.warning,
    WON: tone.success,
    LOST: tone.error,
    CANCELLED: tone.error,
    ARCHIVED: tone.draft,
  },
}
export const requirementPresentation: Present<RequirementStatus> = {
  label: {
    OPEN: "باز",
    IN_PROGRESS: "در حال انجام",
    READY: "آماده",
    VERIFIED: "تأییدشده",
    NOT_APPLICABLE: "نامرتبط",
    BLOCKED: "مسدود",
  },
  tone: {
    OPEN: tone.info,
    IN_PROGRESS: tone.warning,
    READY: tone.primary,
    VERIFIED: tone.success,
    NOT_APPLICABLE: tone.draft,
    BLOCKED: tone.error,
  },
}
export const resourceTypeLabels: Record<ResourceType, string> = {
  SDK: "SDK",
  SAMPLE_CODE: "کد نمونه",
  API_COLLECTION: "مجموعه API",
  CONFIGURATION: "پیکربندی",
  DRIVER: "درایور",
  FIRMWARE: "Firmware",
  SCRIPT: "اسکریپت",
  TEMPLATE: "قالب",
  EXTERNAL_LINK: "پیوند خارجی",
  OTHER: "سایر",
}
export const tenderTypeLabels: Record<TenderType, string> = {
  RFP: "RFP",
  RFQ: "RFQ",
  RFI: "RFI",
  PUBLIC_TENDER: "مناقصه عمومی",
  PRIVATE_TENDER: "مناقصه خصوصی",
  TECHNICAL_EVALUATION: "ارزیابی فنی",
  OTHER: "سایر",
}
export const releaseTransitions: Record<ReleaseStatus, ReleaseStatus[]> = {
  DRAFT: ["PLANNED", "ARCHIVED"],
  PLANNED: ["DRAFT", "RELEASED", "ARCHIVED"],
  RELEASED: ["DEPRECATED", "ARCHIVED"],
  DEPRECATED: ["END_OF_LIFE", "ARCHIVED"],
  END_OF_LIFE: ["ARCHIVED"],
  ARCHIVED: [],
}
export const knowledgeTransitions: Record<KnowledgeStatus, KnowledgeStatus[]> =
  {
    DRAFT: ["IN_REVIEW", "ARCHIVED"],
    IN_REVIEW: ["DRAFT", "PUBLISHED", "ARCHIVED"],
    PUBLISHED: ["IN_REVIEW", "ARCHIVED"],
    ARCHIVED: [],
  }
export const documentTransitions: Record<DocumentStatus, DocumentStatus[]> = {
  DRAFT: ["IN_REVIEW", "ARCHIVED"],
  IN_REVIEW: ["DRAFT", "APPROVED", "ARCHIVED"],
  APPROVED: ["ACTIVE", "ARCHIVED"],
  ACTIVE: ["SUPERSEDED", "EXPIRED", "ARCHIVED"],
  SUPERSEDED: ["ARCHIVED"],
  EXPIRED: ["ARCHIVED"],
  ARCHIVED: [],
}
export const tenderTransitions: Record<TenderStatus, TenderStatus[]> = {
  DRAFT: ["IDENTIFIED", "CANCELLED"],
  IDENTIFIED: ["QUALIFICATION", "CANCELLED"],
  QUALIFICATION: ["PREPARING", "CANCELLED"],
  PREPARING: ["TECHNICAL_REVIEW", "CANCELLED"],
  TECHNICAL_REVIEW: ["PREPARING", "COMMERCIAL_REVIEW", "CANCELLED"],
  COMMERCIAL_REVIEW: ["TECHNICAL_REVIEW", "READY_FOR_SUBMISSION", "CANCELLED"],
  READY_FOR_SUBMISSION: ["COMMERCIAL_REVIEW", "SUBMITTED", "CANCELLED"],
  SUBMITTED: ["UNDER_EVALUATION", "CANCELLED"],
  UNDER_EVALUATION: ["CLARIFICATION", "WON", "LOST", "CANCELLED"],
  CLARIFICATION: ["UNDER_EVALUATION", "CANCELLED"],
  WON: ["ARCHIVED"],
  LOST: ["ARCHIVED"],
  CANCELLED: ["ARCHIVED"],
  ARCHIVED: [],
}
export function faDate(value?: string | null) {
  if (!value) return "—"
  const d = new Date(value)
  return Number.isNaN(d.getTime())
    ? "—"
    : new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(d)
}
export function relationName(
  ref?: {
    title?: string
    name?: string
    legalName?: string
    brandName?: string
    fullName?: string
    email?: string
  } | null
) {
  return ref?.title || ref?.name || ref?.fullName || ref?.brandName || ref?.legalName || ref?.email || "—"
}
