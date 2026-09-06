import type { NotificationChannel, NotificationEventName } from "../types/notification-core.types"

export const notificationChannels: ReadonlyArray<{ value: NotificationChannel; label: string }> = [
  { value: "EMAIL", label: "ایمیل" },
  { value: "SMS", label: "پیامک" },
  { value: "PUSH", label: "Push" },
  { value: "IN_APP", label: "اعلان سامانه" },
]

export const notificationEventCatalog: ReadonlyArray<{
  value: NotificationEventName
  domain: "MEETING" | "TASK"
  label: string
}> = [
  { value: "MEETING.CREATED", domain: "MEETING", label: "ایجاد جلسه" },
  { value: "MEETING.UPDATED", domain: "MEETING", label: "ویرایش جلسه" },
  { value: "MEETING.CANCELLED", domain: "MEETING", label: "لغو جلسه" },
  { value: "TASK.ASSIGNED", domain: "TASK", label: "ارجاع کار" },
  { value: "TASK.REASSIGNED", domain: "TASK", label: "ارجاع مجدد کار" },
  { value: "TASK.COMPLETED", domain: "TASK", label: "تکمیل کار" },
]
