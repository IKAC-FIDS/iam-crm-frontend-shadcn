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
}

export type NotificationRuleCatalog = {
  events: string[]
  recipientTypes: NotificationRecipientType[]
  channels: NotificationChannel[]
}

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
