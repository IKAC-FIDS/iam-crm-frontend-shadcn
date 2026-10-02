import type { PaginatedResult } from "@/lib/pagination"
import type { PersonalTodo } from "@/features/personalTodos/types/personalTodo.types"

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
  subject?: { userId: string; isCurrentUser: boolean }
  capabilities?: {
    tasks: boolean
    meetings: boolean
    opportunities: boolean
    conversations: boolean
  }
  attention: {
    dueTodayTasks: number
    overdueTasks: number
    unreadConversationMessages: number
    meetingsToday: number
    activeOpportunities: number
  }
  today: {
    tasks: OperationsTodayTask[]
    meetings: OperationsTodayMeeting[]
  }
  recentConversations: OperationsRecentConversation[]
  personalTodos: {
    today: PersonalTodo[]
    upcoming: PersonalTodo[]
    completed: PersonalTodo[]
    counts: { today: number; overdue: number; upcoming: number }
  }
}

export type OperationsEntityCompany = {
  id: string
  legalName: string
  brandName?: string | null
}
export type OperationsTodayTask = {
  id: string
  title: string
  status: string
  priority: OperationsPriority
  dueAt: string | null
  opportunityId?: string | null
  company?: OperationsEntityCompany | null
}
export type OperationsTodayMeeting = {
  id: string
  title: string
  startAt: string
  endAt: string
  mode?: string | null
  company?: OperationsEntityCompany | null
}
export type OperationsRecentConversation = {
  threadId: string
  entityType: "COMPANY" | "TASK" | "ACTIVITY"
  entityId: string
  status: "OPEN" | "RESOLVED"
  updatedAt: string
  unreadCount: number
  latestMessage?: {
    id: string
    body: string
    type: "COMMENT" | "QUESTION" | "ANSWER"
    createdAt: string
    author: OperationsUser
  } | null
}

export type OperationsOpportunity = {
  id: string
  title: string
  priority?: OperationsPriority | null
  expectedCloseDate?: string | null
  stage: { id: string; label: string; terminalType?: string | null }
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
    preview: OperationsOpportunity[]
    hasMore: boolean
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
  userId?: string
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
