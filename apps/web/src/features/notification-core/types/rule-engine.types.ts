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
  conditions?: NotificationRuleConditions | null
  schedule?: NotificationSchedule | null
  recipientRules: NotificationRecipientRule[]
  createdAt?: string
  updatedAt?: string
}

export type NotificationRuleCatalog = {
  events: string[]
  conditionEvents: NotificationConditionEventDefinition[]
  scheduleEvents: NotificationScheduleEventDefinition[]
  recipientTypes: NotificationRecipientType[]
  channels: NotificationChannel[]
}

export type NotificationScheduleType = "RELATIVE" | "OVERDUE"
export type NotificationScheduleTriggerMode = "BEFORE" | "AT" | "AT_OR_AFTER" | "AFTER"
export type NotificationScheduleInput = { enabled?: boolean; type: NotificationScheduleType; sourceField: string; triggerMode: NotificationScheduleTriggerMode; offsetMinutes: number; gracePeriodMinutes?: number }
export type NotificationSchedule = { id: string; ruleId: string; enabled: boolean; scheduleType: NotificationScheduleType; sourceField: string; triggerMode: NotificationScheduleTriggerMode; offsetMinutes: number; gracePeriodMinutes: number; lastEvaluatedAt?: string | null }
export type NotificationScheduleEventDefinition = { eventName: string; label: string; supportsSchedule: true; scheduleOptions: { type: NotificationScheduleType; sourceField: string; triggerModes: NotificationScheduleTriggerMode[]; suggestedOffsetsMinutes: number[]; defaultGracePeriodMinutes: number } }

export type NotificationConditionOperator = "EQ" | "NEQ" | "IN" | "NOT_IN" | "EXISTS" | "NOT_EXISTS" | "GT" | "GTE" | "LT" | "LTE"
export type NotificationConditionValue = string | number | boolean | null | Array<string | number | boolean | null>
export type NotificationConditionLeaf = { field: string; operator: NotificationConditionOperator; value?: NotificationConditionValue }
export type NotificationConditionGroup = { logic: "AND" | "OR"; conditions: Array<NotificationConditionLeaf | NotificationConditionGroup> }
export type NotificationRuleConditions = { version: 1; logic: "AND" | "OR"; conditions: Array<NotificationConditionLeaf | NotificationConditionGroup> }
export type NotificationConditionFieldDefinition = { field: string; label: string; type: "string" | "number" | "boolean" | "enum" | "userId" | "teamId"; operators: NotificationConditionOperator[]; values?: string[]; control?: "select" | "text" | "number" }
export type NotificationConditionEventDefinition = { eventName: string; label: string; conditionFields: NotificationConditionFieldDefinition[] }

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

export type NotificationTemplateVariable = {
  key: string
  token: string
  label: string
  type: "string" | "date"
}

export type NotificationTemplatePreview = {
  eventName: string
  channel: NotificationChannel
  locale: string
  subject?: string | null
  body: string
  missingVariables: string[]
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
  enabled?: boolean
  provider?: string | null
  configurationPath?: string | null
}

export type SmsSettings = {
  provider: string
  apiUrl: string
  senderNumber: string
  enabled: boolean
  timeoutMs: number
  apiKeyConfigured: boolean
  configured: boolean
  usable: boolean
  lastUpdatedAt?: string | null
  providers: string[]
}

export type PushSettings = {
  provider: string
  publicKey: string
  subject: string
  enabled: boolean
  timeoutMs: number
  privateKeyConfigured: boolean
  configured: boolean
  usable: boolean
  lastUpdatedAt?: string | null
  providers: string[]
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
  conditions?: NotificationRuleConditions | null
  schedule?: NotificationScheduleInput | null
  recipientRules: RecipientRuleInput[]
}
