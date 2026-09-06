export type NotificationChannel = "EMAIL" | "SMS" | "PUSH" | "IN_APP"

export type NotificationEventName =
  | "MEETING.CREATED"
  | "MEETING.UPDATED"
  | "MEETING.CANCELLED"
  | "TASK.ASSIGNED"
  | "TASK.REASSIGNED"
  | "TASK.COMPLETED"

export type NotificationDeliveryStatus =
  | "PENDING"
  | "PROCESSING"
  | "SENT"
  | "DELIVERED"
  | "FAILED"
  | "RETRYING"
  | "SKIPPED"

export type NotificationRecipientType =
  | "USER"
  | "ROLE"
  | "TEAM"
  | "ASSIGNEE"
  | "OWNER"
  | "CREATOR"
  | "MANAGER"
