import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"

import type {
  CompanyOption,
  LookupOption,
  PaginatedCompanyOptions,
  PaginatedPeople,
  PeopleDirectoryQuery,
  PersonDetail,
  PersonDirectoryItem,
  PersonMutationPayload,
} from "../types/person.types"

interface PaginatedPeopleEnvelope {
  success?: boolean
  data: PersonDirectoryItem[]
  meta: PaginatedPeople["meta"]
}

interface PaginatedCompanyOptionsEnvelope {
  success?: boolean
  data: CompanyOption[]
  meta: PaginatedCompanyOptions["meta"]
}

export async function getPeopleDirectory(query: PeopleDirectoryQuery) {
  const response = await api.get<PaginatedPeopleEnvelope>("/people/directory", {
    params: {
      page: query.page,
      limit: query.limit,
      search: query.search || undefined,
      companyId: query.companyId || undefined,
      ownerId: query.ownerId || undefined,
      team: query.team || undefined,
      department: query.department || undefined,
      jobTitle: query.jobTitle || undefined,
      personaRole: query.personaRole || undefined,
      seniorityLevel: query.seniorityLevel || undefined,
      isPrimaryContact:
        query.isPrimaryContact === undefined
          ? undefined
          : String(query.isPrimaryContact),
      hasEmail:
        query.hasEmail === undefined ? undefined : String(query.hasEmail),
      hasPhone:
        query.hasPhone === undefined ? undefined : String(query.hasPhone),
    },
  })

  return {
    data: response.data.data,
    meta: response.data.meta,
  } satisfies PaginatedPeople
}

export async function getPerson(personId: string) {
  const response = await api.get(`/people/${personId}`)
  return unwrapApiResponse<PersonDetail>(response.data)
}

export async function createPerson(payload: PersonMutationPayload) {
  const response = await api.post("/people", payload)
  return unwrapApiResponse<PersonDetail>(response.data)
}

export async function updatePerson(
  personId: string,
  payload: Omit<PersonMutationPayload, "companyId">,
) {
  const response = await api.patch(`/people/${personId}`, payload)
  return unwrapApiResponse<PersonDetail>(response.data)
}

export async function deletePerson(personId: string) {
  const response = await api.delete(`/people/${personId}`)
  return unwrapApiResponse<PersonDetail>(response.data)
}

export async function getLookupOptions(group: string) {
  const response = await api.get(`/lookups/${group}`, {
    params: { active: "true" },
  })
  return unwrapApiResponse<LookupOption[]>(response.data)
}

export async function getCompanyOptions(search?: string) {
  const response = await api.get<PaginatedCompanyOptionsEnvelope>(
    "/companies/options",
    {
      params: {
        page: 1,
        limit: 10,
        search: search?.trim() || undefined,
      },
    },
  )

  return {
    data: response.data.data,
    meta: response.data.meta,
  } satisfies PaginatedCompanyOptions
}

export async function getCompanyOption(companyId: string) {
  const response = await api.get(`/companies/options/${companyId}`)
  return unwrapApiResponse<CompanyOption>(response.data)
}
