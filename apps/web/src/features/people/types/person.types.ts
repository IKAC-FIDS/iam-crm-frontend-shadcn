export interface PersonCompanyRef {
  id: string
  legalName: string
  brandName?: string | null
  owner?: {
    id: string
    fullName: string
    email?: string | null
    team?: string | null
    teamId?: string | null
    teamRef?: { code?: string; name?: string } | null
  } | null
}

export interface PersonContact {
  id: string
  type: string
  value: string
  isPrimary?: boolean | null
  note?: string | null
  typeOption?: LookupOption | null
}

export interface PersonSocial {
  id: string
  platform: string
  handle: string
  isPrimary?: boolean | null
  note?: string | null
  platformOption?: LookupOption | null
}

export interface EmploymentPosition {
  id: string
  title: string
  startDate?: string | null
  endDate?: string | null
  isCurrent?: boolean | null
  description?: string | null
}

export interface EmploymentHistory {
  id: string
  description?: string | null
  company?: {
    id: string
    legalName: string
    brandName?: string | null
  } | null
  positions?: EmploymentPosition[]
}

export interface EducationHistory {
  id: string
  degree?: string | null
  educationDate?: string | null
  description?: string | null
  university?: {
    id: string
    name: string
  } | null
}

export interface PersonDirectoryItem {
  id: string
  companyId: string
  fullName: string
  title?: string | null
  jobTitle?: string | null
  department?: string | null
  personaTag?: string | null
  personaRole?: string | null
  seniorityLevel?: string | null
  linkedinUrl?: string | null
  email?: string | null
  phone?: string | null
  emailSummary?: string | null
  phoneSummary?: string | null
  isPrimaryContact?: boolean | null
  isSecondaryContact?: boolean | null
  createdAt?: string | null
  updatedAt?: string | null
  company?: PersonCompanyRef | null
  contacts?: PersonContact[]
  socials?: PersonSocial[]
}

export interface PersonDetail extends PersonDirectoryItem {
  employmentHistory?: EmploymentHistory[]
  educationHistory?: EducationHistory[]
}

export interface PeopleDirectoryQuery {
  page: number
  limit: number
  search?: string
  companyId?: string
  ownerId?: string
  team?: string
  department?: string
  jobTitle?: string
  personaRole?: string
  seniorityLevel?: string
  isPrimaryContact?: boolean
  hasEmail?: boolean
  hasPhone?: boolean
}

export interface PaginatedPeople {
  data: PersonDirectoryItem[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext?: boolean
    hasPrevious?: boolean
  }
}

export interface PersonMutationPayload {
  companyId?: string
  fullName: string
  jobTitle?: string
  department?: string
  personaRole?: string
  seniorityLevel?: string
  linkedinUrl?: string
  email?: string
  phone?: string
  isPrimaryContact?: boolean
  isSecondaryContact?: boolean
}

export interface LookupOption {
  id: string
  group: string
  code: string
  label: string
  description?: string | null
  isActive?: boolean
  sortOrder?: number
}

export interface PeopleLookupSet {
  departments: LookupOption[]
  jobTitles: LookupOption[]
  personaRoles: LookupOption[]
  seniorityLevels: LookupOption[]
}

export interface CompanyOption {
  id: string
  legalName: string
  brandName?: string | null
  nationalId?: string | null
  registrationNumber?: string | null
  economicCode?: string | null
}

export interface PaginatedCompanyOptions {
  data: CompanyOption[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext?: boolean
    hasPrevious?: boolean
  }
}
