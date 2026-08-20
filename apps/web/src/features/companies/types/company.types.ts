export const COMPANY_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "STRATEGIC"] as const
export const COMPANY_ACTIVITY_STATUSES = ["ACTIVE", "INACTIVE", "MERGED", "UNKNOWN"] as const
export const COMPANY_OWNERSHIPS = [
  "PRIVATE",
  "STATE",
  "SEMI_STATE",
  "PUBLIC_LISTED",
  "BANK",
  "HOLDING",
] as const
export const OWNERSHIP_SCOPES = ["ALL", "MINE", "TEAM", "UNASSIGNED"] as const

export type CompanyPriority = (typeof COMPANY_PRIORITIES)[number]
export type CompanyActivityStatus = (typeof COMPANY_ACTIVITY_STATUSES)[number]
export type CompanyOwnership = (typeof COMPANY_OWNERSHIPS)[number]
export type OwnershipScope = (typeof OWNERSHIP_SCOPES)[number]

export interface CompanyOwner {
  id: string
  fullName: string
  email?: string | null
  team?: string | null
}

export interface IndustryRef {
  id: string
  name: string
  description?: string | null
}

export interface SourceRef {
  id: string
  code: string
  name: string
  description?: string | null
  isActive?: boolean
}

export interface CompanySummary {
  id: string
  legalName: string
  brandName?: string | null
}

export interface CompanyOpportunity {
  id: string
  title?: string | null
  name?: string | null
  amount?: string | number | null
  estimatedValue?: string | number | null
  currency?: string | null
  updatedAt?: string | null
  stage?: {
    id?: string
    name?: string | null
    label?: string | null
    code?: string | null
    isTerminal?: boolean
    terminalType?: string | null
  } | null
  owner?: CompanyOwner | null
}

export interface CompanyActivity {
  id: string
  title?: string | null
  type?: string | null
  description?: string | null
  occurredAt?: string | null
  activityDate?: string | null
  createdAt?: string | null
}

export interface CompanyPerson {
  id: string
  fullName?: string | null
  firstName?: string | null
  lastName?: string | null
  jobTitle?: string | null
  title?: string | null
  department?: string | null
  isPrimary?: boolean | null
}

export interface Company {
  id: string
  legalName: string
  brandName?: string | null
  industry?: string | null
  industryId?: string | null
  industryRef?: IndustryRef | null
  ownership?: CompanyOwnership | null
  priority?: CompanyPriority | null
  ownerId?: string | null
  owner?: CompanyOwner | null
  website?: string | null
  headOfficeCity?: string | null
  centralPhone?: string | null
  source?: string | null
  sourceId?: string | null
  sourceRef?: SourceRef | null
  registrationNumber?: string | null
  nationalId?: string | null
  economicCode?: string | null
  establishmentDate?: string | null
  activityStatus?: CompanyActivityStatus | null
  registeredCapital?: string | number | null
  employeeCount?: number | null
  archivedAt?: string | null
  archiveReason?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  people?: CompanyPerson[]
  activities?: CompanyActivity[]
  opportunities?: CompanyOpportunity[]
  branches?: unknown[]
  socialChannels?: unknown[]
  callCard?: unknown | null
  legalDocuments?: unknown[]
  parentCompanies?: CompanySummary[]
  subsidiaryCompanies?: CompanySummary[]
}

export interface PaginatedCompanies {
  data: Company[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext?: boolean
    hasPrevious?: boolean
  }
}

export interface CompaniesQuery {
  page: number
  limit: number
  search?: string
  priority?: CompanyPriority
  ownershipScope?: OwnershipScope
  includeArchived?: boolean
  archivedOnly?: boolean
}


export interface CompanyMutationPayload {
  legalName: string
  brandName?: string
  industry?: string
  ownership?: CompanyOwnership
  priority?: CompanyPriority
  website?: string
  headOfficeCity?: string
  centralPhone?: string | null
  source?: string
  registrationNumber?: string
  nationalId?: string
  economicCode?: string
  establishmentDate?: string
  activityStatus?: CompanyActivityStatus
  registeredCapital?: string
  employeeCount?: number
}

export type CreateCompanyPayload = CompanyMutationPayload
export type UpdateCompanyPayload = Partial<CompanyMutationPayload>
