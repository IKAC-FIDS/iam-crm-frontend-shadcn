import { z } from "zod"
import { parsePaginatedResponse } from "@/lib/pagination"
import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"

import type {
  CompanyOption,
  EducationHistory,
  EducationHistoryPayload,
  EmploymentHistory,
  EmploymentHistoryPayload,
  EmploymentPosition,
  EmploymentPositionPayload,
  LookupOption,
  PaginatedCompanyOptions,
  PaginatedPeople,
  PeopleDirectoryQuery,
  PersonDetail,
  PersonContact,
  PersonContactPayload,
  PersonDirectoryItem,
  PersonMutationPayload,
  PersonSocial,
  PersonSocialPayload,
  UniversityOption,
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

  return parsePaginatedResponse(
    response.data,
    z.custom<PersonDirectoryItem>(
      (value) =>
        !!value &&
        typeof value === "object" &&
        "id" in value &&
        typeof value.id === "string" &&
        "fullName" in value &&
        typeof value.fullName === "string"
    )
  )
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
  payload: Omit<PersonMutationPayload, "companyId">
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
  const options = unwrapApiResponse<LookupOption[]>(response.data)
  return Array.isArray(options) ? options : []
}

export async function getPersonContacts(personId: string) {
  const response = await api.get(`/people/${personId}/contacts`)
  const data = unwrapApiResponse<PersonContact[]>(response.data)
  return Array.isArray(data) ? data : []
}

export async function createPersonContact(
  personId: string,
  payload: PersonContactPayload
) {
  const response = await api.post(`/people/${personId}/contacts`, payload)
  return unwrapApiResponse<PersonContact>(response.data)
}

export async function updatePersonContact(
  personId: string,
  contactId: string,
  payload: Partial<PersonContactPayload>
) {
  const response = await api.patch(
    `/people/${personId}/contacts/${contactId}`,
    payload
  )
  return unwrapApiResponse<PersonContact>(response.data)
}

export async function deletePersonContact(personId: string, contactId: string) {
  const response = await api.delete(`/people/${personId}/contacts/${contactId}`)
  return unwrapApiResponse<PersonContact>(response.data)
}

export async function getPersonSocials(personId: string) {
  const response = await api.get(`/people/${personId}/socials`)
  const data = unwrapApiResponse<PersonSocial[]>(response.data)
  return Array.isArray(data) ? data : []
}

export async function createPersonSocial(
  personId: string,
  payload: PersonSocialPayload
) {
  const response = await api.post(`/people/${personId}/socials`, payload)
  return unwrapApiResponse<PersonSocial>(response.data)
}

export async function updatePersonSocial(
  personId: string,
  socialId: string,
  payload: Partial<PersonSocialPayload>
) {
  const response = await api.patch(
    `/people/${personId}/socials/${socialId}`,
    payload
  )
  return unwrapApiResponse<PersonSocial>(response.data)
}

export async function deletePersonSocial(personId: string, socialId: string) {
  const response = await api.delete(`/people/${personId}/socials/${socialId}`)
  return unwrapApiResponse<PersonSocial>(response.data)
}

export async function getEmploymentHistory(personId: string) {
  const response = await api.get(`/people/${personId}/employment-history`)
  const data = unwrapApiResponse<EmploymentHistory[]>(response.data)
  return Array.isArray(data) ? data : []
}

export async function createEmploymentHistory(
  personId: string,
  payload: EmploymentHistoryPayload
) {
  const response = await api.post(
    `/people/${personId}/employment-history`,
    payload
  )
  return unwrapApiResponse<EmploymentHistory>(response.data)
}

export async function updateEmploymentHistory(
  personId: string,
  employmentId: string,
  payload: Partial<EmploymentHistoryPayload>
) {
  const response = await api.patch(
    `/people/${personId}/employment-history/${employmentId}`,
    payload
  )
  return unwrapApiResponse<EmploymentHistory>(response.data)
}

export async function deleteEmploymentHistory(
  personId: string,
  employmentId: string
) {
  const response = await api.delete(
    `/people/${personId}/employment-history/${employmentId}`
  )
  return unwrapApiResponse<EmploymentHistory>(response.data)
}

export async function createEmploymentPosition(
  personId: string,
  employmentId: string,
  payload: EmploymentPositionPayload
) {
  const response = await api.post(
    `/people/${personId}/employment-history/${employmentId}/positions`,
    payload
  )
  return unwrapApiResponse<EmploymentPosition>(response.data)
}

export async function updateEmploymentPosition(
  personId: string,
  employmentId: string,
  positionId: string,
  payload: Partial<EmploymentPositionPayload>
) {
  const response = await api.patch(
    `/people/${personId}/employment-history/${employmentId}/positions/${positionId}`,
    payload
  )
  return unwrapApiResponse<EmploymentPosition>(response.data)
}

export async function deleteEmploymentPosition(
  personId: string,
  employmentId: string,
  positionId: string
) {
  const response = await api.delete(
    `/people/${personId}/employment-history/${employmentId}/positions/${positionId}`
  )
  return unwrapApiResponse<{ id: string; deleted: boolean }>(response.data)
}

export async function getEducationHistory(personId: string) {
  const response = await api.get(`/people/${personId}/education-history`)
  const data = unwrapApiResponse<EducationHistory[]>(response.data)
  return Array.isArray(data) ? data : []
}

export async function createEducationHistory(
  personId: string,
  payload: EducationHistoryPayload
) {
  const response = await api.post(
    `/people/${personId}/education-history`,
    payload
  )
  return unwrapApiResponse<EducationHistory>(response.data)
}

export async function updateEducationHistory(
  personId: string,
  educationId: string,
  payload: Partial<EducationHistoryPayload>
) {
  const response = await api.patch(
    `/people/${personId}/education-history/${educationId}`,
    payload
  )
  return unwrapApiResponse<EducationHistory>(response.data)
}

export async function deleteEducationHistory(
  personId: string,
  educationId: string
) {
  const response = await api.delete(
    `/people/${personId}/education-history/${educationId}`
  )
  return unwrapApiResponse<{ id: string; deleted: boolean }>(response.data)
}

export async function getUniversities() {
  const response = await api.get("/universities")
  const data = unwrapApiResponse<UniversityOption[]>(response.data)
  return Array.isArray(data) ? data : []
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
    }
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
