export type PersonalTodoStatus = "TODO" | "DONE" | "CANCELLED"
export type PersonalTodoRecurrence = "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM"

export type PersonalTodo = {
  id: string
  title: string
  note?: string | null
  status: PersonalTodoStatus
  dueAt?: string | null
  reminderAt?: string | null
  recurrenceType: PersonalTodoRecurrence
  recurrenceInterval: number
  company?: { id: string; legalName: string; brandName?: string | null } | null
  opportunity?: { id: string; title: string } | null
  task?: { id: string; title: string; status: string } | null
}

export type PersonalTodoInput = {
  title: string
  note?: string
  dueAt?: string
  reminderAt?: string
  recurrenceType?: PersonalTodoRecurrence
  recurrenceInterval?: number
  companyId?: string
  opportunityId?: string
}
