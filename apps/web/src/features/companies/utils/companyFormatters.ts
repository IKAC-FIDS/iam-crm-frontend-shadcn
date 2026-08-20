import type {
  CompanyActivityStatus,
  CompanyPriority,
} from "../types/company.types"

const faNumber = new Intl.NumberFormat("fa-IR")

export function companyDisplayName(legalName: string, brandName?: string | null) {
  return brandName?.trim() || legalName
}

export function formatCompanyNumber(value?: number | string | null) {
  if (value === null || value === undefined || value === "") return "-"
  const numeric = Number(value)
  return Number.isFinite(numeric) ? faNumber.format(numeric) : String(value)
}

export function formatCompanyDate(value?: string | null) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

export function formatCompanyDateTime(value?: string | null) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export const priorityLabel: Record<CompanyPriority, string> = {
  LOW: "کم",
  MEDIUM: "متوسط",
  HIGH: "زیاد",
  STRATEGIC: "استراتژیک",
}

export const activityStatusLabel: Record<CompanyActivityStatus, string> = {
  ACTIVE: "فعال",
  INACTIVE: "غیرفعال",
  MERGED: "ادغام‌شده",
  UNKNOWN: "نامشخص",
}

export function opportunityTitle(item: {
  title?: string | null
  name?: string | null
}) {
  return item.title?.trim() || item.name?.trim() || "-"
}

export function personName(item: {
  fullName?: string | null
  firstName?: string | null
  lastName?: string | null
}) {
  const composed = [item.firstName, item.lastName].filter(Boolean).join(" ").trim()
  return item.fullName?.trim() || composed || "-"
}
