import type { NotificationChannel, NotificationEventName } from "../types/notification-core.types"

export const notificationChannels: ReadonlyArray<{ value: NotificationChannel; label: string }> = [
  { value: "EMAIL", label: "ایمیل" },
  { value: "SMS", label: "پیامک" },
  { value: "PUSH", label: "Push" },
  { value: "IN_APP", label: "اعلان سامانه" },
]

export const notificationEventCatalog: ReadonlyArray<{
  value: NotificationEventName
  domain: "MEETING" | "TASK" | "OPPORTUNITY" | "CONVERSATION"
  label: string
}> = [
  { value: "MEETING.CREATED", domain: "MEETING", label: "ایجاد جلسه" },
  { value: "MEETING.UPDATED", domain: "MEETING", label: "ویرایش جلسه" },
  { value: "MEETING.CANCELLED", domain: "MEETING", label: "لغو جلسه" },
  { value: "MEETING.REMINDER", domain: "MEETING", label: "یادآوری جلسه" },
  { value: "TASK.ASSIGNED", domain: "TASK", label: "ارجاع کار" },
  { value: "TASK.REASSIGNED", domain: "TASK", label: "ارجاع مجدد کار" },
  { value: "TASK.COMPLETED", domain: "TASK", label: "تکمیل کار" },
  { value: "TASK.DUE_SOON", domain: "TASK", label: "نزدیک‌شدن سررسید کار" },
  { value: "TASK.OVERDUE", domain: "TASK", label: "سررسید گذشته کار" },
  { value: "OPPORTUNITY.STAGE_CHANGED", domain: "OPPORTUNITY", label: "تغییر مرحله فرصت" },
  { value: "CONVERSATION.MESSAGE_CREATED", domain: "CONVERSATION", label: "پیام جدید گفتگو" },
  { value: "CONVERSATION.QUESTION_CREATED", domain: "CONVERSATION", label: "پرسش جدید گفتگو" },
  { value: "CONVERSATION.REPLY_CREATED", domain: "CONVERSATION", label: "پاسخ جدید گفتگو" },
  { value: "CONVERSATION.RESOLVED", domain: "CONVERSATION", label: "حل‌شدن گفتگو" },
]
