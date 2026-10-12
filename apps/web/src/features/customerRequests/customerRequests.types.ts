export type RequestStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "IN_PROGRESS"
  | "WAITING_FOR_CUSTOMER"
  | "RESOLVED"
  | "CLOSED"
  | "CANCELLED"
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
  answers?: Record<string, unknown>
  submittedAt: string | null
  createdAt: string
  updatedAt: string
  creatorMembershipId: string
  requestType: { id: string; code: string; displayName: string }
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
