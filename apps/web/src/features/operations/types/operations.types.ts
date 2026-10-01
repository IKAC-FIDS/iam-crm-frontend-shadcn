import type { PaginatedResult } from "@/lib/pagination"

export type OperationsPriority = "LOW" | "MEDIUM" | "HIGH" | "STRATEGIC"
export type OperationsAttentionState =
  "OVERDUE" | "TODAY" | "UPCOMING" | "NO_NEXT_ACTION" | "NORMAL"
export type OperationsOwnershipScope = "all" | "mine" | "team" | "unassigned"

export type OperationsUser = {
  id: string
  fullName: string
  avatarObjectKey?: string | null
}

export type OperationsWorkspace = {
  attention: {
    dueTodayTasks: number
    overdueTasks: number
    unreadConversationMessages: number
    meetingsToday: number
    activeOpportunities: number
  }
  today: {
    tasks: Array<Record<string, unknown>>
    meetings: Array<Record<string, unknown>>
  }
  recentConversations: Array<Record<string, unknown>>
}

export type OperationsCompanyRow = {
  company: {
    id: string
    legalName: string
    brandName?: string | null
    logoObjectKey?: string | null
    priority: OperationsPriority
    activityStatus?: string | null
    owner?: OperationsUser | null
  }
  activeOpportunities: {
    count: number
    items: Array<{
      id: string
      title: string
      priority?: OperationsPriority | null
      expectedCloseDate?: string | null
      stage: { id: string; label: string; terminalType?: string | null }
    }>
  }
  tasks: {
    open: number
    overdue: number
    dueToday: number
    next?: {
      id: string
      title: string
      dueAt?: string | null
      priority: OperationsPriority
      opportunityId?: string | null
    } | null
  }
  conversation: {
    unreadCount: number
    latestMessage?: {
      id: string
      body: string
      type: "COMMENT" | "QUESTION" | "ANSWER"
      createdAt: string
      author: OperationsUser
    } | null
  }
  lastActivity?: { id: string; type: string; occurredAt: string } | null
  nextMeeting?: {
    id: string
    title: string
    startAt: string
    mode?: string | null
  } | null
  nextAction?: {
    type: "TASK" | "MEETING"
    id: string
    title: string
    at: string
  } | null
  attention: { state: OperationsAttentionState; reason?: string | null }
}

export type OperationsCompaniesQuery = {
  page: number
  limit: number
  search?: string
  priority?: OperationsPriority
  attentionState?: OperationsAttentionState
  hasUnreadMessages?: boolean
  hasActiveOpportunity?: boolean
  hasNoNextAction?: boolean
  ownershipScope?: OperationsOwnershipScope
}

export type OperationsCompaniesPage = PaginatedResult<OperationsCompanyRow>
