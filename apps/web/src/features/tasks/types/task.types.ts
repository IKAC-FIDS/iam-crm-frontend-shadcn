export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED"
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "STRATEGIC"
export type TaskAssignmentScope = "SELF" | "TEAM" | "ORGANIZATION"
export type TaskEntityType = "COMPANY" | "OPPORTUNITY" | "PERSON" | "MEETING" | "ACTIVITY" | "PRODUCT"

export interface TaskUser {
  id: string
  fullName?: string | null
  email?: string | null
  role?: string | null
  team?: string | null
  teamId?: string | null
}

export interface Task {
  id: string
  title: string
  description?: string | null
  status: TaskStatus
  priority: TaskPriority
  dueAt?: string | null
  reminderAt?: string | null
  assignmentScope: TaskAssignmentScope
  teamId?: string | null
  team?: { id: string; code: string; name: string; isActive?: boolean } | null
  parentTaskId?: string | null
  parentTask?: Pick<Task, "id" | "title" | "status"> | null
  subtasks?: Array<Pick<Task, "id" | "title" | "status" | "priority" | "dueAt" | "assignedTo">>
  _count?: { subtasks: number }
  companyId?: string | null
  company?: { id: string; legalName?: string | null; brandName?: string | null; ownerId?: string | null } | null
  personId?: string | null
  person?: { id: string; fullName?: string | null; title?: string | null; companyId?: string | null } | null
  opportunityId?: string | null
  opportunity?: { id: string; title?: string | null; companyId?: string | null; ownerId?: string | null; priority?: TaskPriority | null; archivedAt?: string | null } | null
  commercialDocumentId?: string | null
  commercialDocument?: { id: string; type?: string | null; status?: string | null; number?: string | null; title?: string | null; opportunityId?: string | null } | null
  paymentId?: string | null
  payment?: { id: string; status?: string | null; amount?: number | string | null; currency?: string | null; dueDate?: string | null; opportunityId?: string | null } | null
  meetingId?: string | null
  meeting?: { id: string; title: string; startAt?: string; status?: string } | null
  activityId?: string | null
  activity?: { id: string; type: string; occurredAt?: string; companyId?: string } | null
  productId?: string | null
  product?: { id: string; code: string; name: string; isActive?: boolean } | null
  assignedToId?: string | null
  assignedTo?: TaskUser | null
  createdById?: string | null
  createdBy?: TaskUser | null
  completedAt?: string | null
  completedById?: string | null
  completedBy?: TaskUser | null
  completionNote?: string | null
  cancelledAt?: string | null
  cancelReason?: string | null
  createdAt: string
  updatedAt: string
}

export interface TaskListQuery {
  page: number
  limit: number
  search?: string
  status?: TaskStatus
  priority?: TaskPriority
  assignedToId?: string
  createdById?: string
  companyId?: string
  personId?: string
  opportunityId?: string
  commercialDocumentId?: string
  paymentId?: string
  dueFrom?: string
  dueTo?: string
  overdueOnly?: boolean
  assignmentScope?: TaskAssignmentScope
  teamId?: string
  parentTaskId?: string
  meetingId?: string | null
  activityId?: string | null
  productId?: string | null
  view?: "all" | "mine" | "team" | "organization" | "created"
  dueState?: "none" | "upcoming" | "today" | "overdue" | "completed"
  linkedEntityType?: TaskEntityType
}

export interface TaskPayload {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueAt?: string
  reminderAt?: string
  companyId?: string
  personId?: string
  opportunityId?: string
  commercialDocumentId?: string
  paymentId?: string
  assignedToId?: string
  assignmentScope?: TaskAssignmentScope
  teamId?: string
  meetingId?: string | null
  activityId?: string | null
  productId?: string | null
}

export interface TaskReassignPayload {
  assignmentScope: TaskAssignmentScope
  teamId?: string
  assigneeId?: string
  reason?: string
}

export interface TaskSubtaskPayload {
  title: string
  description?: string
  priority?: TaskPriority
  assignmentScope?: TaskAssignmentScope
  teamId?: string
  assigneeId?: string
  dueAt?: string
  inheritLinkedEntity?: boolean
}

export interface TaskPage {
  data: Task[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext?: boolean
    hasPrevious?: boolean
  }
}

export interface TaskOption {
  id: string
  label: string
  secondary?: string
}

export interface TaskAssigneeOption extends TaskUser {
  id: string
  teamRef?: { id: string; code: string; name: string } | null
}
