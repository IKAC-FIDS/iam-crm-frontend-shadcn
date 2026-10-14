export type RequestStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "IN_PROGRESS"
  | "WAITING_FOR_CUSTOMER"
  | "RESOLVED"
  | "CLOSED"
  | "CANCELLED"
export type RequestPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT"
export type RequestTriageStatus = "UNTRIAGED" | "TRIAGED"
export type RequestRoutingDestination = "MANUAL" | "TASK" | "TECHNICAL_DOCUMENT" | "OPPORTUNITY"
export type RequestCrmTargetType = "TASK" | "TECHNICAL_DOCUMENT" | "OPPORTUNITY"
export type FieldType =
  | "TEXT"
  | "TEXTAREA"
  | "NUMBER"
  | "EMAIL"
  | "PHONE"
  | "DATE"
  | "SELECT"
  | "MULTI_SELECT"
  | "RADIO"
  | "CHECKBOX"
  | "BOOLEAN"
  | "INFO"
  | "SECTION"
export interface FormField {
  key: string
  type: FieldType
  label: string
  description?: string
  placeholder?: string
  required?: boolean
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  options?: { value: string; label: string }[]
  visibleWhen?: { field: string; equals: string | number | boolean }
  requiredWhen?: { field: string; equals: string | number | boolean }
}
export interface FormSchema {
  fields: FormField[]
}
export interface RequestType {
  id: string
  code: string
  displayName: string
  description?: string | null
  presentation?: Record<string, unknown> | null
  displayOrder?: number
  isEnabled?: boolean
  retiredAt?: string | null
  availabilityPolicy?: "ALL_PORTAL_COMPANIES" | "SELECTED_COMPANIES"
  defaultRoutingDestination?: RequestRoutingDestination
  companyAvailability?: { companyId: string }[]
  currentPublishedVersion?: {
    id: string
    version: number
    schema: FormSchema
  } | null
  _count?: { formVersions: number; requests: number }
}
export interface CustomerRequest {
  id: string
  trackingNumber: string | null
  title: string
  status: RequestStatus
  priority?: RequestPriority
  triageStatus?: RequestTriageStatus
  assignedToId?: string | null
  assignedTo?: { id: string; fullName: string; email?: string } | null
  responsibleTeamId?: string | null
  responsibleTeam?: { id: string; name: string; code?: string } | null
  routingDestination?: RequestRoutingDestination | null
  triageReason?: string | null
  revision?: number
  answers?: Record<string, unknown>
  submittedAt: string | null
  createdAt: string
  updatedAt: string
  creatorMembershipId: string
  requestType: { id: string; code: string; displayName: string; defaultRoutingDestination?: RequestRoutingDestination }
  formVersion?: { id: string; version: number; schema: FormSchema }
  histories?: History[]
  allowedActions?: {
    edit: boolean
    submit: boolean
    cancel: boolean
    share: boolean
  }
  allowedTransitions?: RequestStatus[]
  company?: { id: string; legalName: string; brandName?: string | null }
  creator?: { id: string; fullName: string; email: string }
  _count?: { crmLinks: number }
}
export interface RequestOperationalHistory { id: string; action: string; internalReason?: string | null; createdAt: string; actor: { id: string; fullName: string } }
export interface RequestCrmLink { id: string; targetType: RequestCrmTargetType; purpose?: string | null; task?: { id: string; title: string } | null; technicalDocument?: { id: string; title: string } | null; opportunity?: { id: string; title: string } | null }
export interface CreateLinkedTaskInput {
  title: string
  description?: string
  priority?: "LOW" | "MEDIUM" | "HIGH" | "STRATEGIC"
  dueAt?: string
  assignedToId?: string
  purpose?: string
  idempotencyKey: string
}
export interface CreateLinkedOpportunityInput {
  title: string
  description?: string
  ownerId?: string
  stageId?: string
  priority?: "LOW" | "MEDIUM" | "HIGH" | "STRATEGIC"
  expectedCloseDate?: string
  purpose?: string
  idempotencyKey: string
}
export interface CreateLinkedTechnicalDocumentInput {
  title: string
  documentType: string
  ownerId: string
  description?: string
  confidentiality?: "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED"
  purpose?: string
  idempotencyKey: string
}
export interface History {
  id: string
  previousStatus: RequestStatus | null
  newStatus: RequestStatus
  customerVisibleExplanation?: string | null
  internalReason?: string | null
  createdAt: string
}
export interface Page<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
}
