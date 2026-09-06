export type NotificationChannel = "EMAIL" | "SMS" | "PUSH" | "IN_APP"
export type NotificationRecipientType =
  | "USER"
  | "ROLE"
  | "TEAM"
  | "ASSIGNEE"
  | "OWNER"
  | "CREATOR"
  | "MANAGER"

export type NotificationRecipientRule = {
  id: string
  type: NotificationRecipientType
  targetId?: string | null
  channels: NotificationChannel[]
  enabled: boolean
}

export type NotificationRule = {
  id: string
  name: string
  eventName: string
  enabled: boolean
  mandatory: boolean
  priority: number
  recipientRules: NotificationRecipientRule[]
  createdAt?: string
  updatedAt?: string
}

export type NotificationRuleCatalog = {
  events: string[]
  recipientTypes: NotificationRecipientType[]
  channels: NotificationChannel[]
}

export type NotificationEventMeta = {
  eventName: string
  service: string
  action: string
}

export type NotificationTemplate = {
  id: string
  eventName: string
  channel: NotificationChannel
  locale: string
  subject?: string | null
  body: string
  isActive: boolean
  version: number
  createdAt: string
  updatedAt: string
}

export type NotificationDeliveryStatus =
  | "PENDING" | "PROCESSING" | "SENT" | "DELIVERED"
  | "FAILED" | "RETRYING" | "SKIPPED"

export type NotificationDelivery = {
  id: string
  channel: NotificationChannel
  status: NotificationDeliveryStatus
  destination?: string | null
  attemptCount: number
  providerMessageId?: string | null
  failureCode?: string | null
  failureMessage?: string | null
  sentAt?: string | null
  deliveredAt?: string | null
  createdAt: string
  event: { eventName: string; occurredAt: string }
  recipientUser?: { id: string; fullName: string; email: string } | null
}

export type NotificationChannelStatus = {
  channel: NotificationChannel
  available: boolean
  configured: boolean
  usable: boolean
  provider?: string | null
  configurationPath?: string | null
}

export type PageMeta = { total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrevious: boolean }

export type NotificationRuleTarget = {
  id: string
  name: string
  description?: string
}

export type RecipientRuleInput = {
  type: NotificationRecipientType
  targetId?: string | null
  channels: NotificationChannel[]
  enabled?: boolean
}

export type NotificationRuleInput = {
  name: string
  eventName: string
  enabled?: boolean
  mandatory?: boolean
  priority?: number
  recipientRules: RecipientRuleInput[]
}
