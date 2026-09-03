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
  fullName?: string
  email?: string
  versions?: DocumentVersion[]
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
export type TenderBidDecision = "UNDECIDED" | "BID" | "NO_BID"
export type TenderQualificationDecision = "PENDING" | "GO" | "CONDITIONAL_GO" | "NO_GO"
export type RequirementDependency = {
  id: string
  dependsOnRequirementId: string
  dependsOnRequirement?: Pick<TenderRequirement, "id" | "title" | "referenceId" | "status">
}
export type TenderRequirement = {
  id: string
  tenderId: string
  title: string
  category?: string | null
  description?: string | null
  section?: string | null
  page?: string | null
  referenceId?: string | null
  notes?: string | null
  parentRequirementId?: string | null
  mandatory: boolean
  status: RequirementStatus
  ownerId?: string | null
  owner?: EntityRef | null
  taskId?: string | null
  task?: { id: string; title: string; status: string; assignedToId?: string | null } | null
  dependencies?: RequirementDependency[]
  dueDate?: string | null
  response?: string | null
  blockedReason?: string | null
  blockedAt?: string | null
  createdAt: string
  updatedAt: string
}
export type TenderDeliverable = {
  id: string
  tenderId: string
  documentId: string
  label?: string | null
  required: boolean
  document?: EntityRef
  createdAt: string
}
export type TenderReviewType = "TECHNICAL" | "COMMERCIAL"
export type TenderReviewStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"
export type TenderReview = {
  id: string
  tenderId: string
  type: TenderReviewType
  status: TenderReviewStatus
  reviewerId?: string | null
  reviewer?: EntityRef | null
  requestedAt: string
  reviewedAt?: string | null
  comment?: string | null
}
export type ReadinessIssue = { code: string; count?: number; fields?: string[] }
export type TenderReadiness = {
  overallReady: boolean
  blockers: ReadinessIssue[]
  warnings: ReadinessIssue[]
  qualification: {
    bidDecision: TenderBidDecision
    qualificationDecision: TenderQualificationDecision
    fitScore?: number | null
    riskScore?: number | null
    feasibilityScore?: number | null
    qualificationConditions?: string | null
    decisionReason?: string | null
    qualificationSummary?: string | null
  }
  requirementSummary: {
    totalRequirements: number
    satisfiedRequirements: number
    openRequirements: number
    blockedRequirements: number
    criticalUnsatisfiedRequirements: number
    requirementsWithoutOwner: number
    requirementsWithoutTask: number
    dependencyBlockedRequirements: number
  }
  checks: {
    mandatoryRequirements: { total: number; satisfied: number; unresolved: number; blocked: number }
    requirements: { total: number; verified: number; inProgress: number; open: number; blocked: number; overdue: number; unassigned: number }
    deliverables: { total: number; required: number; completedRequired: number; missing: number }
    technicalReview: { status: TenderReviewStatus | "NOT_STARTED"; reviewId?: string | null }
    commercialReview: { status: TenderReviewStatus | "NOT_STARTED"; reviewId?: string | null }
    submissionDeadline: { value?: string | null; overdue: boolean }
    requiredTenderFields: { complete: boolean; missing: string[] }
  }
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
  owner?: EntityRef | null
  source?: string | null
  description?: string | null
  submissionDeadline?: string | null
  technicalDeadline?: string | null
  expectedDecisionDate?: string | null
  estimatedValue?: string | null
  currency?: string | null
  probability?: number | null
  bidDecision: TenderBidDecision
  qualificationDecision: TenderQualificationDecision
  fitScore?: number | null
  riskScore?: number | null
  feasibilityScore?: number | null
  fitNotes?: string | null
  riskNotes?: string | null
  feasibilityNotes?: string | null
  qualificationSummary?: string | null
  qualificationConditions?: string | null
  decisionReason?: string | null
  technicalLeadId?: string | null
  technicalLead?: EntityRef | null
  commercialLeadId?: string | null
  commercialLead?: EntityRef | null
  result?: "WON" | "LOST" | "CANCELLED" | null
  resultReason?: string | null
  revision: number
  requirements?: TenderRequirement[]
  deliverables?: TenderDeliverable[]
  reviews?: TenderReview[]
  readiness?: TenderReadiness
  submittedAt?: string | null
  submittedById?: string | null
  closedAt?: string | null
  closedById?: string | null
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
  section?: string
  page?: string
  referenceId?: string
  notes?: string
  parentRequirementId?: string | null
  dependencyIds?: string[]
  mandatory?: boolean
  ownerId?: string | null
  dueDate?: string
  response?: string
  blockedReason?: string
  status?: RequirementStatus
}
export type TenderQualificationPayload = {
  bidDecision?: TenderBidDecision
  qualificationDecision?: TenderQualificationDecision
  fitScore?: number
  riskScore?: number
  feasibilityScore?: number
  fitNotes?: string
  riskNotes?: string
  feasibilityNotes?: string
  qualificationSummary?: string
  qualificationConditions?: string
  decisionReason?: string
  revision?: number
}
export type TechnicalKind =
  "releases" | "knowledge-base" | "documents" | "resources" | "tenders"
