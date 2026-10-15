import type {
  FormSchema,
  RequestPriority,
  RequestStatus,
} from "./customerRequests.types"
import type { StatusTone } from "@/components/shared/StatusBadge"
export const requestStatusFa: Record<RequestStatus, string> = {
  DRAFT: "پیش‌نویس",
  SUBMITTED: "ثبت‌شده",
  UNDER_REVIEW: "در حال بررسی",
  IN_PROGRESS: "در حال انجام",
  WAITING_FOR_CUSTOMER: "منتظر پاسخ مشتری",
  RESOLVED: "حل‌شده",
  CLOSED: "بسته‌شده",
  CANCELLED: "لغوشده",
}
export const requestPriorityFa: Record<RequestPriority, string> = {
  LOW: "کم",
  NORMAL: "عادی",
  HIGH: "زیاد",
  URGENT: "فوری",
}
export const requestStatusTone: Record<RequestStatus, StatusTone> = {
  DRAFT: "secondary",
  SUBMITTED: "info",
  UNDER_REVIEW: "warning",
  IN_PROGRESS: "primary",
  WAITING_FOR_CUSTOMER: "warning",
  RESOLVED: "success",
  CLOSED: "neutral",
  CANCELLED: "error",
}
export const requestPriorityTone: Record<RequestPriority, StatusTone> = {
  LOW: "secondary",
  NORMAL: "neutral",
  HIGH: "warning",
  URGENT: "error",
}
export function validateDynamicAnswers(
  schema: FormSchema,
  answers: Record<string, unknown>
) {
  const errors: Record<string, string> = {}
  for (const field of schema.fields) {
    if (["INFO", "SECTION"].includes(field.type)) continue
    const visible =
      !field.visibleWhen ||
      answers[field.visibleWhen.field] === field.visibleWhen.equals
    if (!visible) continue
    const value = answers[field.key],
      empty =
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && !value.length),
      required =
        field.required ||
        (field.requiredWhen &&
          answers[field.requiredWhen.field] === field.requiredWhen.equals)
    if (required && empty) errors[field.key] = "تکمیل این فیلد الزامی است."
    if (
      typeof value === "string" &&
      field.maxLength &&
      value.length > field.maxLength
    )
      errors[field.key] = `حداکثر ${field.maxLength} نویسه مجاز است.`
  }
  return errors
}
