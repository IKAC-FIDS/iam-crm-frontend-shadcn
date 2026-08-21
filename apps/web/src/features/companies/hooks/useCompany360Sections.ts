import { useQuery } from "@tanstack/react-query"

import { api } from "@/lib/api"

export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export type PaginatedSection<T> = {
  data: T[]
  meta: PaginationMeta
}

type PaginatedEnvelope<T> = {
  success?: boolean
  data: T[]
  meta: PaginationMeta
}

export type CompanyPersonListItem = {
  id: string
  companyId: string
  fullName: string
  title?: string | null
  jobTitle?: string | null
  department?: string | null
  personaTag?: string | null
  personaRole?: string | null
  seniorityLevel?: string | null
  email?: string | null
  phone?: string | null
  isPrimaryContact?: boolean | null
  isSecondaryContact?: boolean | null
}

export type CompanyOpportunityItem = {
  id: string
  title: string
  description?: string | null
  estimatedValue?: string | number | null
  amount?: string | number | null
  expectedCloseDate?: string | null
  probability?: number | null
  priority?: string | null
  competitor?: string | null
  owner?: {
    id?: string
    fullName?: string | null
    email?: string | null
    team?: string | null
  } | null
  stage?: {
    id?: string
    code?: string | null
    label?: string | null
    color?: string | null
    isTerminal?: boolean
    terminalType?: string | null
  } | null
  primaryContact?: {
    id?: string
    fullName?: string | null
    title?: string | null
    department?: string | null
    email?: string | null
    phone?: string | null
  } | null
}

export type CompanyTask = {
  id: string
  title: string
  description?: string | null
  status?: string | null
  priority?: string | null
  dueAt?: string | null
  reminderAt?: string | null
  person?: { id?: string; fullName?: string | null; title?: string | null } | null
  opportunity?: { id?: string; title?: string | null } | null
  assignedTo?: {
    id?: string
    fullName?: string | null
    email?: string | null
    role?: string | null
    team?: string | null
  } | null
}

export type CompanyMeeting = {
  id: string
  title: string
  agenda?: string | null
  description?: string | null
  status?: string | null
  mode?: string | null
  location?: string | null
  meetingUrl?: string | null
  startAt?: string | null
  endAt?: string | null
  organizer?: {
    id?: string
    fullName?: string | null
    email?: string | null
  } | null
  opportunity?: { id?: string; title?: string | null } | null
  assignees?: Array<{
    user?: { id?: string; fullName?: string | null; email?: string | null }
  }>
  attendees?: Array<{
    person?: {
      id?: string
      fullName?: string | null
      title?: string | null
    }
  }>
}

export type CompanyActivityItem = {
  id: string
  type?: string | null
  title?: string | null
  description?: string | null
  notes?: string | null
  outcome?: string | null
  status?: string | null
  occurredAt?: string | null
  activityDate?: string | null
  completedAt?: string | null
  createdAt?: string | null
  person?: { id?: string; fullName?: string | null } | null
  createdBy?: { id?: string; fullName?: string | null; email?: string | null } | null
}

export type CompanyBranch = {
  id: string
  name?: string | null
  city?: string | null
  address?: string | null
  phone?: string | null
}

export type CompanySocialChannel = {
  id: string
  platform?: string | null
  handle?: string | null
}

export type CompanyLegalDocument = {
  id: string
  type?: string | null
  title?: string | null
  description?: string | null
  documentDate?: string | null
  attachmentId?: string | null
  createdAt?: string | null
}

function usePaginatedQuery<T>(
  key: string,
  url: string,
  companyId: string,
  page: number,
  limit: number,
  enabled: boolean,
  params?: Record<string, unknown>,
) {
  return useQuery({
    queryKey: [key, companyId, page, limit, params],
    queryFn: async () => {
      const response = await api.get<PaginatedEnvelope<T>>(url, {
        params: { page, limit, ...params },
      })
      return {
        data: response.data.data,
        meta: response.data.meta,
      } satisfies PaginatedSection<T>
    },
    enabled: Boolean(companyId) && enabled,
  })
}

export function useCompanyPeople(
  companyId: string,
  page = 1,
  limit = 12,
  enabled = true,
) {
  return usePaginatedQuery<CompanyPersonListItem>(
    "company-people",
    "/people",
    companyId,
    page,
    limit,
    enabled,
    { companyId },
  )
}

export function useCompanyOpportunities(
  companyId: string,
  page = 1,
  limit = 12,
  enabled = true,
) {
  return usePaginatedQuery<CompanyOpportunityItem>(
    "company-opportunities",
    "/opportunities",
    companyId,
    page,
    limit,
    enabled,
    { companyId },
  )
}

export function useCompanyTasks(companyId: string, page = 1, limit = 12, enabled = true) {
  return usePaginatedQuery<CompanyTask>(
    "company-tasks",
    "/tasks",
    companyId,
    page,
    limit,
    enabled,
    { companyId },
  )
}

export function useCompanyMeetings(companyId: string, page = 1, limit = 12, enabled = true) {
  return usePaginatedQuery<CompanyMeeting>(
    "company-meetings",
    "/meetings",
    companyId,
    page,
    limit,
    enabled,
    { companyId },
  )
}

export function useCompanyActivities(companyId: string, page = 1, limit = 12, enabled = true) {
  return usePaginatedQuery<CompanyActivityItem>(
    "company-activities",
    "/activities",
    companyId,
    page,
    limit,
    enabled,
    { companyId },
  )
}

export function useCompanyBranches(companyId: string, page = 1, limit = 12, enabled = true) {
  return usePaginatedQuery<CompanyBranch>(
    "company-branches",
    `/companies/${companyId}/branches`,
    companyId,
    page,
    limit,
    enabled,
  )
}

export function useCompanySocialChannels(companyId: string, page = 1, limit = 12, enabled = true) {
  return usePaginatedQuery<CompanySocialChannel>(
    "company-social-channels",
    `/companies/${companyId}/social-channels`,
    companyId,
    page,
    limit,
    enabled,
  )
}

export function useCompanyLegalDocuments(companyId: string, page = 1, limit = 12, enabled = true) {
  return usePaginatedQuery<CompanyLegalDocument>(
    "company-legal-documents",
    `/companies/${companyId}/legal-documents`,
    companyId,
    page,
    limit,
    enabled,
  )
}
