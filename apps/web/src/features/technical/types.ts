export type PageMeta = {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}
export type Page<T> = { data: T[]; meta: PageMeta }
export type EntityRef = {
  id: string
  title?: string
  name?: string
  version?: string
  legalName?: string
  brandName?: string
  status?: string
}
export type TechnicalListParams = {
  page: number
  limit: number
  search?: string
  productId?: string
  releaseId?: string
  companyId?: string
  opportunityId?: string
  tenderId?: string
  ownerId?: string
  teamId?: string
  status?: string
  type?: string
  confidentiality?: TechnicalDocument["confidentiality"]
  version?: string
  category?: string
  authorId?: string
  reviewDue?: string
  sort?: string
  sortDirection?: "asc" | "desc"
  from?: string
  to?: string
}
export type ReleaseStatus =
  "DRAFT" | "PLANNED" | "RELEASED" | "DEPRECATED" | "END_OF_LIFE" | "ARCHIVED"
export type TechnicalRelease = {
  id: string
  productId: string
  product?: EntityRef
  version: string
  title: string
  summary?: string | null
  releaseNotes?: string | null
  status: ReleaseStatus
  releaseDate?: string | null
  supportStartDate?: string | null
  supportEndDate?: string | null
  endOfLifeDate?: string | null
  revision: number
  createdAt: string
  updatedAt: string
}
export type ReleasePayload = {
  productId: string
  version: string
  title: string
  summary?: string
  releaseNotes?: string
  releaseDate?: string
  supportStartDate?: string
  supportEndDate?: string
  endOfLifeDate?: string
  revision?: number
}
export type KnowledgeStatus = "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED"
export type KnowledgeArticle = {
  id: string
  title: string
  slug: string
  content: string
  summary?: string | null
  category?: string | null
  visibility: "INTERNAL" | "RESTRICTED"
  status: KnowledgeStatus
  productId?: string | null
  releaseId?: string | null
  ownerId?: string | null
  authorId: string
  reviewerId?: string | null
  nextReviewAt?: string | null
  lastReviewedAt?: string | null
  publishedAt?: string | null
  createdAt: string
  updatedAt: string
}
export type KnowledgePayload = {
  title: string
  slug: string
  content: string
  summary?: string
  category?: string
  visibility?: "INTERNAL" | "RESTRICTED"
  productId?: string
  releaseId?: string
  ownerId?: string
  reviewerId?: string
  nextReviewAt?: string
}
export type DocumentStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "APPROVED"
  | "ACTIVE"
  | "SUPERSEDED"
  | "EXPIRED"
  | "ARCHIVED"
export type DocumentVersion = {
  id: string
  documentId: string
  version: string
  attachmentId?: string | null
  contentHash?: string | null
  createdAt: string
}
export type TechnicalDocument = {
  id: string
  title: string
  description?: string | null
  documentType: string
  status: DocumentStatus
  confidentiality: "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED"
  productId?: string | null
  product?: EntityRef | null
  releaseId?: string | null
  release?: EntityRef | null
  companyId?: string | null
  company?: EntityRef | null
  opportunityId?: string | null
  opportunity?: EntityRef | null
  tenderId?: string | null
  ownerId: string
  effectiveFrom?: string | null
  expiresAt?: string | null
  revision: number
  versions?: DocumentVersion[]
  createdAt: string
  updatedAt: string
}
export type DocumentPayload = {
  title: string
  documentType: string
  ownerId: string
  description?: string
  confidentiality?: TechnicalDocument["confidentiality"]
  productId?: string
  releaseId?: string
  companyId?: string
  opportunityId?: string
  tenderId?: string
  effectiveFrom?: string
  expiresAt?: string
  revision?: number
}
export type ResourceType =
  | "SDK"
  | "SAMPLE_CODE"
  | "API_COLLECTION"
  | "CONFIGURATION"
  | "DRIVER"
  | "FIRMWARE"
  | "SCRIPT"
  | "TEMPLATE"
  | "EXTERNAL_LINK"
  | "OTHER"
export type ResourceStatus = "DRAFT" | "ACTIVE" | "DEPRECATED" | "ARCHIVED"
export type TechnicalResource = {
  id: string
  title: string
  description?: string | null
  resourceType: ResourceType
  status: ResourceStatus
  productId?: string | null
  releaseId?: string | null
  url?: string | null
  version?: string | null
  checksum?: string | null
  attachmentId?: string | null
  ownerId?: string | null
  createdAt: string
  updatedAt: string
}
export type ResourcePayload = {
  title: string
  resourceType: ResourceType
  description?: string
  productId?: string
  releaseId?: string
  url?: string
  version?: string
  checksum?: string
  ownerId?: string
  attachmentId?: string
  status?: ResourceStatus
}
export type TenderType =
  | "RFP"
  | "RFQ"
  | "RFI"
  | "PUBLIC_TENDER"
  | "PRIVATE_TENDER"
  | "TECHNICAL_EVALUATION"
  | "OTHER"
export type TenderStatus =
  | "DRAFT"
  | "IDENTIFIED"
  | "QUALIFICATION"
  | "PREPARING"
  | "TECHNICAL_REVIEW"
  | "COMMERCIAL_REVIEW"
  | "READY_FOR_SUBMISSION"
  | "SUBMITTED"
  | "UNDER_EVALUATION"
  | "CLARIFICATION"
  | "WON"
  | "LOST"
  | "CANCELLED"
  | "ARCHIVED"
export type RequirementStatus =
  "OPEN" | "IN_PROGRESS" | "READY" | "VERIFIED" | "NOT_APPLICABLE" | "BLOCKED"
export type TenderRequirement = {
  id: string
  tenderId: string
  title: string
  category?: string | null
  description?: string | null
  mandatory: boolean
  status: RequirementStatus
  ownerId?: string | null
  dueDate?: string | null
  response?: string | null
  createdAt: string
  updatedAt: string
}
export type TenderDeliverable = {
  id: string
  tenderId: string
  documentId: string
  label?: string | null
  document?: EntityRef
  createdAt: string
}
export type Tender = {
  id: string
  title: string
  referenceNumber?: string | null
  tenderType: TenderType
  status: TenderStatus
  companyId?: string | null
  company?: EntityRef | null
  opportunityId?: string | null
  opportunity?: EntityRef | null
  teamId?: string | null
  team?: EntityRef | null
  ownerId: string
  source?: string | null
  description?: string | null
  submissionDeadline?: string | null
  technicalDeadline?: string | null
  expectedDecisionDate?: string | null
  estimatedValue?: string | null
  currency?: string | null
  probability?: number | null
  technicalLeadId?: string | null
  commercialLeadId?: string | null
  revision: number
  requirements?: TenderRequirement[]
  deliverables?: TenderDeliverable[]
  createdAt: string
  updatedAt: string
}
export type TenderPayload = {
  title: string
  tenderType: TenderType
  ownerId: string
  referenceNumber?: string
  companyId?: string
  opportunityId?: string
  teamId?: string
  source?: string
  description?: string
  submissionDeadline?: string
  technicalDeadline?: string
  expectedDecisionDate?: string
  estimatedValue?: string
  currency?: string
  probability?: number
  technicalLeadId?: string
  commercialLeadId?: string
  revision?: number
}
export type RequirementPayload = {
  title: string
  category?: string
  description?: string
  mandatory?: boolean
  ownerId?: string
  dueDate?: string
  response?: string
  status?: RequirementStatus
}
export type TechnicalKind =
  "releases" | "knowledge-base" | "documents" | "resources" | "tenders"
