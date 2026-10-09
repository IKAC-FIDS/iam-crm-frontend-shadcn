export const notificationTypes = [
  "SYSTEM", "TASK_CREATED", "TASK_ASSIGNED", "TASK_STATUS_CHANGED",
  "TASK_COMPLETED", "TASK_RESCHEDULED", "OPPORTUNITY_UPDATED",
  "COMMERCIAL_DOCUMENT_UPDATED", "PAYMENT_UPDATED", "ATTACHMENT_UPLOADED",
  "MEETING_REMINDER", "PERSONAL_TODO_REMINDER", "TENDER_WORKFLOW",
] as const

export type NotificationType = (typeof notificationTypes)[number]
export type NotificationPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT" | "CRITICAL"
export type NotificationEntityType = "TASK" | "COMPANY" | "PERSON" | "OPPORTUNITY" | "COMMERCIAL_DOCUMENT" | "PAYMENT" | "ATTACHMENT" | "MEETING" | "PERSONAL_TODO" | "TENDER"

export interface Notification {
  id: string
  recipientId: string
  actor?: { id: string; fullName?: string | null; email?: string | null; avatarObjectKey?: string | null } | null
  type: NotificationType
  priority: NotificationPriority
  title: string
  body?: string | null
  entityType?: NotificationEntityType | null
  entityId?: string | null
  actionUrl?: string | null
  readAt?: string | null
  archivedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface NotificationPage {
  data: Notification[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

export interface NotificationQuery {
  page?: number
  limit?: number
  status?: "unread" | "read" | "all"
  type?: NotificationType
  types?: NotificationType[]
  priority?: NotificationPriority
  priorities?: NotificationPriority[]
  archivedOnly?: boolean
  includeArchived?: boolean
  search?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: "createdAt" | "priority"
  sortOrder?: "asc" | "desc"
}
