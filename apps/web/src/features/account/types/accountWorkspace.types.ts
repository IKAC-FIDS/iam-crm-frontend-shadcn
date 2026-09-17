export type WorkspaceCompanyIdentity = {
  id: string
  legalName: string
  brandName?: string | null
  logoObjectKey?: string | null
}
export type AccountWorkspace = {
  period: {
    startDate: string | null
    endDate: string | null
    defaultedToLast30Days: boolean
  }
  financialVisible: boolean
  attention: {
    overdueTasks: number
    dueTodayTasks: number
    upcomingMeetings: number
    unreadNotifications: number
    unreadConversationMessages: number
  }
  summary: {
    tasks: { total: number; open: number; completed: number; overdue: number }
    opportunities: {
      total: number
      active: number
      won: number
      lost: number
      totalValue: number | null
      activeValue: number | null
      wonValue: number | null
      lostValue: number | null
    }
    companiesOwned: number
    activities: number
    upcomingMeetings: number
    unreadNotifications: number
  }
  activityBreakdown: Array<{ code: string; label: string; count: number }>
  recent: {
    tasks: Array<{
      id: string
      title: string
      status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED"
      priority: "LOW" | "MEDIUM" | "HIGH" | "STRATEGIC"
      dueAt?: string | null
      company?: WorkspaceCompanyIdentity | null
    }>
    opportunities: Array<{
      id: string
      title: string
      estimatedValue: number | null
      expectedCloseDate?: string | null
      priority: string
      stage: {
        id: string
        label: string
        terminalType?: string | null
        isTerminal: boolean
      }
      company: WorkspaceCompanyIdentity
    }>
    companies: Array<
      WorkspaceCompanyIdentity & { stage: string; updatedAt: string }
    >
    meetings: Array<{
      id: string
      title: string
      startAt: string
      endAt: string
      mode: string
      company: WorkspaceCompanyIdentity
    }>
    notifications: Array<{
      id: string
      title: string
      body?: string | null
      priority: string
      actionUrl?: string | null
      readAt?: string | null
      createdAt: string
      actor?: {
        id: string
        fullName?: string | null
        avatarObjectKey?: string | null
      } | null
    }>
    conversations: Array<{
      id: string
      entityType: "COMPANY" | "TASK" | "ACTIVITY"
      entityId: string
      status: "OPEN" | "RESOLVED"
      updatedAt: string
      unreadCount: number
      actionUrl: string
      latestMessage?: {
        id: string
        body: string
        type: "COMMENT" | "QUESTION" | "ANSWER"
        createdAt: string
        author: {
          id: string
          fullName: string
          avatarObjectKey?: string | null
        }
      } | null
    }>
  }
}
