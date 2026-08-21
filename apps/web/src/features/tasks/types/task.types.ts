export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED"
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "STRATEGIC"

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
}
