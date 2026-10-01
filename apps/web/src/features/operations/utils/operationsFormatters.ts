import { formatJalaliDateTime } from "@/lib/date/jalali"

export function formatRelativeOperationTime(value?: string | null) {
  if (!value) return "بدون زمان"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "بدون زمان"
  const difference = date.getTime() - Date.now()
  const days = Math.round(difference / 86_400_000)
  const hours = Math.round(difference / 3_600_000)
  if (Math.abs(hours) < 1)
    return difference >= 0 ? "کمتر از یک ساعت دیگر" : "کمتر از یک ساعت قبل"
  if (days === 0)
    return difference >= 0
      ? `${hours.toLocaleString("fa-IR")} ساعت دیگر`
      : `${Math.abs(hours).toLocaleString("fa-IR")} ساعت قبل`
  if (days === 1) return "فردا"
  if (days === -1) return "دیروز"
  if (days > 1 && days < 7) return `${days.toLocaleString("fa-IR")} روز دیگر`
  if (days < -1 && days > -7)
    return `${Math.abs(days).toLocaleString("fa-IR")} روز قبل`
  return formatJalaliDateTime(date)
}

export const priorityLabels = {
  LOW: "کم",
  MEDIUM: "متوسط",
  HIGH: "زیاد",
  STRATEGIC: "راهبردی",
} as const

export const attentionPresentation = {
  OVERDUE: { label: "عقب‌افتاده", tone: "danger" as const },
  TODAY: { label: "امروز", tone: "warning" as const },
  UPCOMING: { label: "آینده", tone: "info" as const },
  NO_NEXT_ACTION: { label: "بدون پیگیری", tone: "error" as const },
  NORMAL: { label: "عادی", tone: "neutral" as const },
}
