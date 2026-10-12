import type { FormSchema, RequestStatus } from "./customerRequests.types"
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
