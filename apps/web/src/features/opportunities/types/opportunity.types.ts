export type OpportunityPriority = "LOW" | "MEDIUM" | "HIGH" | "STRATEGIC"
export type OwnershipScope = "all" | "mine" | "team" | "unassigned"
export type ArchiveState = "active" | "all" | "archived"

export interface OpportunityStage {
  id: string
  code: string
  label: string
  sortOrder: number
  color?: string | null
  isActive?: boolean
  isDefault?: boolean
  isTerminal?: boolean
  terminalType?: "NONE" | "WON" | "LOST" | string | null
}

export interface OpportunityTransition {
  id: string
  fromStageId: string | null
  toStageId: string
  role?: string | null
  isAllowed?: boolean
  allowed?: boolean
}

export interface Opportunity {
  id: string
  companyId: string
  title: string
  description?: string | null
  company?: {
    id: string
    legalName: string
    brandName?: string | null
    industry?: string | null
  } | null
  ownerId?: string | null
  owner?: {
    id: string
    fullName: string
    email?: string | null
    team?: string | null
  } | null
  stageId: string
  stage: OpportunityStage
  priority: OpportunityPriority
  estimatedValue?: number | string | null
  expectedCloseDate?: string | null
  source?: string | null
  sourceOptionId?: string | null
  sourceOption?: { id: string; code: string; label: string } | null
  primaryContactId?: string | null
  primaryContact?: {
    id: string
    fullName: string
    title?: string | null
    department?: string | null
    email?: string | null
    phone?: string | null
    isPrimaryContact?: boolean
  } | null
  probability?: number | null
  competitor?: string | null
  archivedAt?: string | null
  archiveReason?: string | null
  createdAt?: string
  updatedAt?: string
  wonAt?: string | null
  lostAt?: string | null
  lostReason?: string | null
  stageHistories?: OpportunityStageHistory[]
  activities?: OpportunityActivity[]
  lineItems?: OpportunityLineItem[]
  commercialDocuments?: CommercialDocument[]
  payments?: OpportunityPayment[]
  tasks?: OpportunityTask[]
  _count?: {
    lineItems?: number
    commercialDocuments?: number
    payments?: number
    tasks?: number
  }
}

export interface OpportunityStageHistory {
  id: string
  fromStageId?: string | null
  fromStage?: Pick<OpportunityStage, "id" | "code" | "label"> | null
  toStageId: string
  toStage?: Pick<OpportunityStage, "id" | "code" | "label"> | null
  changedById?: string | null
  changedBy?: { id: string; fullName?: string | null } | null
  note?: string | null
  changedAt: string
}

export interface OpportunityActivity {
  id: string
  type:
    | "CALL"
    | "EMAIL"
    | "LINKEDIN_MESSAGE"
    | "LINKEDIN_ENGAGEMENT"
    | "MEETING"
    | "NOTE"
    | "STAGE_CHANGE"
    | string
  notes?: string | null
  outcome?: string | null
  occurredAt: string
  nextActionDate?: string | null
  userId?: string
  user?: { id: string; fullName?: string | null } | null
}

export type SalesChannel = "LEGACY_UNKNOWN" | "IN_PERSON" | "DIGIKALA" | "OTHER"
export interface ProductCatalogOption {
  id: string
  code: string
  name: string
  category?: string | null
  unit?: string | null
  defaultUnitPrice?: number | string
  inPersonPriceIrr?: number | string
  digikalaPriceIrr?: number | string
  currency?: string
  isActive?: boolean
}
export interface OpportunityLineItem {
  id: string
  opportunityId: string
  productId?: string | null
  product?: ProductCatalogOption | null
  productCodeSnapshot?: string | null
  productNameSnapshot?: string | null
  salesChannel: SalesChannel
  description?: string | null
  quantity: number | string
  unitPrice: number | string
  discountAmount: number | string
  taxAmount: number | string
  lineTotal: number | string
  sortOrder: number
  createdAt?: string
  updatedAt?: string
}
export interface OpportunityLineItemPayload {
  productId?: string | null
  salesChannel?: Exclude<SalesChannel, "LEGACY_UNKNOWN">
  description?: string
  quantity: number
  unitPrice?: number
  discountAmount?: number
  taxAmount?: number
  sortOrder?: number
}

export type CommercialDocumentType = "PROPOSAL" | "PROFORMA" | "CONTRACT"
export type CommercialDocumentStatus =
  | "DRAFT"
  | "SENT"
  | "ACCEPTED"
  | "REJECTED"
  | "SIGNED"
  | "CANCELLED"
  | "EXPIRED"
export interface CommercialDocument {
  id: string
  opportunityId: string
  type: CommercialDocumentType
  status: CommercialDocumentStatus
  number?: string | null
  version?: number | null
  title: string
  description?: string | null
  amount?: number | string | null
  currency?: string | null
  validUntil?: string | null
  issuedAt?: string | null
  sentAt?: string | null
  acceptedAt?: string | null
  rejectedAt?: string | null
  signedAt?: string | null
  fileUrl?: string | null
  externalRef?: string | null
  notes?: string | null
  payments?: Array<
    Pick<
      OpportunityPayment,
      | "id"
      | "status"
      | "amount"
      | "currency"
      | "dueDate"
      | "paidAt"
      | "method"
      | "referenceNumber"
    >
  >
  createdAt: string
  updatedAt?: string
}
export interface CommercialDocumentPayload {
  type: CommercialDocumentType
  status?: CommercialDocumentStatus
  number?: string
  version?: number
  title: string
  description?: string
  amount?: number
  currency?: string
  validUntil?: string
  issuedAt?: string
  fileUrl?: string
  externalRef?: string
  notes?: string
  file?: File
}

export type PaymentStatus =
  "PENDING" | "PARTIAL" | "PAID" | "OVERDUE" | "CANCELLED" | "REFUNDED"
export type PaymentMethod =
  "BANK_TRANSFER" | "CASH" | "CHECK" | "CARD" | "OTHER"
export interface OpportunityPayment {
  id: string
  opportunityId: string
  commercialDocumentId?: string | null
  commercialDocument?: {
    id: string
    type?: CommercialDocumentType
    status?: CommercialDocumentStatus
    number?: string | null
    title?: string | null
  } | null
  status: PaymentStatus
  amount: number | string
  currency: string
  dueDate?: string | null
  paidAt?: string | null
  method?: PaymentMethod | null
  referenceNumber?: string | null
  description?: string | null
  notes?: string | null
  createdAt: string
  updatedAt?: string
}
export interface OpportunityPaymentPayload {
  commercialDocumentId?: string
  status?: PaymentStatus
  amount: number
  currency?: string
  dueDate?: string
  paidAt?: string
  method?: PaymentMethod
  referenceNumber?: string
  description?: string
  notes?: string
}

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED"
export interface OpportunityTask {
  id: string
  title: string
  description?: string | null
  status: TaskStatus
  priority: OpportunityPriority
  dueAt?: string | null
  reminderAt?: string | null
  companyId?: string | null
  opportunityId?: string | null
  assignedToId?: string | null
  assignedTo?: { id: string; fullName?: string | null } | null
  completedAt?: string | null
  completionNote?: string | null
  createdAt: string
  updatedAt?: string
}
export interface OpportunityTaskPayload {
  title: string
  description?: string
  status?: TaskStatus
  priority?: OpportunityPriority
  dueAt?: string
  reminderAt?: string
  companyId: string
  opportunityId: string
}

export interface OpportunityAttachment {
  id: string
  entityType: "OPPORTUNITY"
  entityId: string
  originalFileName: string
  mimeType: string
  sizeBytes: number
  description?: string | null
  createdAt: string
}

export interface PaginatedResource<T> {
  data: T[]
  meta: OpportunityPage["meta"]
}

export interface OpportunityFilters {
  search?: string
  ownershipScope: OwnershipScope
  companyId?: string
  ownerId?: string
  teamId?: string
  team?: string
  stageId?: string
  priority?: OpportunityPriority
  sourceOptionId?: string
  primaryContactId?: string
  expectedCloseFrom?: string
  expectedCloseTo?: string
  archiveState: ArchiveState
}

export interface OpportunityListQuery extends OpportunityFilters {
  page: number
  limit: number
}

export interface OpportunityPage {
  data: Opportunity[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext?: boolean
    hasPrevious?: boolean
  }
}

export interface OpportunityPayload {
  companyId: string
  title: string
  description?: string
  ownerId?: string
  stageId?: string
  priority?: OpportunityPriority
  estimatedValue?: number
  expectedCloseDate?: string
  sourceOptionId?: string
  primaryContactId?: string
  probability?: number
  competitor?: string
}

export type OpportunityUpdatePayload = Omit<
  Partial<OpportunityPayload>,
  "companyId" | "ownerId" | "stageId"
>

export interface OpportunityOwnerOption {
  id: string
  fullName: string
  email?: string | null
  team?: string | null
  teamId?: string | null
}

export interface OpportunitySourceOption {
  id: string
  code: string
  label: string
  isActive?: boolean
}
