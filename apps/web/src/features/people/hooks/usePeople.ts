import { useQueryScope } from "@/lib/queryScope"
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  createEducationHistory,
  createEmploymentHistory,
  createEmploymentPosition,
  createPerson,
  createPersonContact,
  createPersonSocial,
  deleteEducationHistory,
  deleteEmploymentHistory,
  deleteEmploymentPosition,
  deletePerson,
  deletePersonContact,
  deletePersonSocial,
  getCompanyOption,
  getCompanyOptions,
  getLookupOptions,
  getEducationHistory,
  getEmploymentHistory,
  getPeopleDirectory,
  getPerson,
  getPersonContacts,
  getPersonSocials,
  getUniversities,
  updateEducationHistory,
  updateEmploymentHistory,
  updateEmploymentPosition,
  updatePerson,
  updatePersonContact,
  updatePersonSocial,
} from "../api/people.api"
import type {
  EducationHistoryPayload,
  EmploymentHistoryPayload,
  EmploymentPositionPayload,
  PeopleDirectoryQuery,
  PersonContactPayload,
  PersonMutationPayload,
  PersonSocialPayload,
} from "../types/person.types"

export const peopleQueryKeys = {
  all: ["people"] as const,
  directoryRoot: () => [...peopleQueryKeys.all, "directory"] as const,
  directory: (query: PeopleDirectoryQuery) =>
    [...peopleQueryKeys.directoryRoot(), query] as const,
  details: () => [...peopleQueryKeys.all, "detail"] as const,
  detail: (personId: string) =>
    [...peopleQueryKeys.details(), personId] as const,
  lookup: (group: string) => [...peopleQueryKeys.all, "lookup", group] as const,
  companyOptions: (search: string) =>
    [...peopleQueryKeys.all, "company-options", search] as const,
  companyOption: (companyId: string) =>
    [...peopleQueryKeys.all, "company-option", companyId] as const,
  contacts: (personId: string) =>
    [...peopleQueryKeys.detail(personId), "contacts"] as const,
  socials: (personId: string) =>
    [...peopleQueryKeys.detail(personId), "socials"] as const,
  employment: (personId: string) =>
    [...peopleQueryKeys.detail(personId), "employment"] as const,
  education: (personId: string) =>
    [...peopleQueryKeys.detail(personId), "education"] as const,
  universities: () => [...peopleQueryKeys.all, "universities"] as const,
}

export function usePeopleDirectory(
  query: PeopleDirectoryQuery,
  enabled = true
) {
  return useQuery({
    queryKey: [...peopleQueryKeys.directory(query), useQueryScope()],
    queryFn: () => getPeopleDirectory(query),
    placeholderData: keepPreviousData,
    enabled,
  })
}

export function usePerson(personId: string | null) {
  return useQuery({
    queryKey: [...peopleQueryKeys.detail(personId ?? ""), useQueryScope()],
    queryFn: () => getPerson(personId ?? ""),
    enabled: Boolean(personId),
  })
}

export function usePeopleLookup(group: string) {
  return useQuery({
    queryKey: [...peopleQueryKeys.lookup(group), useQueryScope()],
    queryFn: () => getLookupOptions(group),
    staleTime: 5 * 60_000,
  })
}

export function usePersonContacts(personId: string) {
  return useQuery({
    queryKey: [...peopleQueryKeys.contacts(personId), useQueryScope()],
    queryFn: () => getPersonContacts(personId),
    enabled: Boolean(personId),
  })
}

export function usePersonSocials(personId: string) {
  return useQuery({
    queryKey: [...peopleQueryKeys.socials(personId), useQueryScope()],
    queryFn: () => getPersonSocials(personId),
    enabled: Boolean(personId),
  })
}

export function usePersonEmploymentHistory(personId: string) {
  return useQuery({
    queryKey: [...peopleQueryKeys.employment(personId), useQueryScope()],
    queryFn: () => getEmploymentHistory(personId),
    enabled: Boolean(personId),
  })
}

export function usePersonEducationHistory(personId: string) {
  return useQuery({
    queryKey: [...peopleQueryKeys.education(personId), useQueryScope()],
    queryFn: () => getEducationHistory(personId),
    enabled: Boolean(personId),
  })
}

export function useUniversities(enabled = true) {
  return useQuery({
    queryKey: [...peopleQueryKeys.universities(), useQueryScope()],
    queryFn: getUniversities,
    enabled,
    staleTime: 5 * 60_000,
  })
}

export function usePeopleLookups() {
  const departments = usePeopleLookup("departments")
  const jobTitles = usePeopleLookup("job-titles")
  const personaRoles = usePeopleLookup("persona-roles")
  const seniorityLevels = usePeopleLookup("seniority-levels")

  return {
    departments,
    jobTitles,
    personaRoles,
    seniorityLevels,
    data: {
      departments: Array.isArray(departments.data) ? departments.data : [],
      jobTitles: Array.isArray(jobTitles.data) ? jobTitles.data : [],
      personaRoles: Array.isArray(personaRoles.data) ? personaRoles.data : [],
      seniorityLevels: Array.isArray(seniorityLevels.data)
        ? seniorityLevels.data
        : [],
    },
    isLoading:
      departments.isLoading ||
      jobTitles.isLoading ||
      personaRoles.isLoading ||
      seniorityLevels.isLoading,
  }
}

function useInvalidateNested(personId: string, nestedKey: readonly unknown[]) {
  const queryClient = useQueryClient()
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: peopleQueryKeys.detail(personId),
      }),
      queryClient.invalidateQueries({ queryKey: nestedKey }),
    ])
  }
}

export function useCreatePersonContact(personId: string) {
  const invalidate = useInvalidateNested(
    personId,
    peopleQueryKeys.contacts(personId)
  )
  return useMutation({
    mutationFn: (payload: PersonContactPayload) =>
      createPersonContact(personId, payload),
    onSuccess: invalidate,
  })
}
export function useUpdatePersonContact(personId: string) {
  const invalidate = useInvalidateNested(
    personId,
    peopleQueryKeys.contacts(personId)
  )
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Partial<PersonContactPayload>
    }) => updatePersonContact(personId, id, payload),
    onSuccess: invalidate,
  })
}
export function useDeletePersonContact(personId: string) {
  const invalidate = useInvalidateNested(
    personId,
    peopleQueryKeys.contacts(personId)
  )
  return useMutation({
    mutationFn: (id: string) => deletePersonContact(personId, id),
    onSuccess: invalidate,
  })
}

export function useCreatePersonSocial(personId: string) {
  const invalidate = useInvalidateNested(
    personId,
    peopleQueryKeys.socials(personId)
  )
  return useMutation({
    mutationFn: (payload: PersonSocialPayload) =>
      createPersonSocial(personId, payload),
    onSuccess: invalidate,
  })
}
export function useUpdatePersonSocial(personId: string) {
  const invalidate = useInvalidateNested(
    personId,
    peopleQueryKeys.socials(personId)
  )
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Partial<PersonSocialPayload>
    }) => updatePersonSocial(personId, id, payload),
    onSuccess: invalidate,
  })
}
export function useDeletePersonSocial(personId: string) {
  const invalidate = useInvalidateNested(
    personId,
    peopleQueryKeys.socials(personId)
  )
  return useMutation({
    mutationFn: (id: string) => deletePersonSocial(personId, id),
    onSuccess: invalidate,
  })
}

export function useCreateEmploymentHistory(personId: string) {
  const invalidate = useInvalidateNested(
    personId,
    peopleQueryKeys.employment(personId)
  )
  return useMutation({
    mutationFn: (payload: EmploymentHistoryPayload) =>
      createEmploymentHistory(personId, payload),
    onSuccess: invalidate,
  })
}
export function useUpdateEmploymentHistory(personId: string) {
  const invalidate = useInvalidateNested(
    personId,
    peopleQueryKeys.employment(personId)
  )
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Partial<EmploymentHistoryPayload>
    }) => updateEmploymentHistory(personId, id, payload),
    onSuccess: invalidate,
  })
}
export function useDeleteEmploymentHistory(personId: string) {
  const invalidate = useInvalidateNested(
    personId,
    peopleQueryKeys.employment(personId)
  )
  return useMutation({
    mutationFn: (id: string) => deleteEmploymentHistory(personId, id),
    onSuccess: invalidate,
  })
}
export function useCreateEmploymentPosition(personId: string) {
  const invalidate = useInvalidateNested(
    personId,
    peopleQueryKeys.employment(personId)
  )
  return useMutation({
    mutationFn: ({
      employmentId,
      payload,
    }: {
      employmentId: string
      payload: EmploymentPositionPayload
    }) => createEmploymentPosition(personId, employmentId, payload),
    onSuccess: invalidate,
  })
}
export function useUpdateEmploymentPosition(personId: string) {
  const invalidate = useInvalidateNested(
    personId,
    peopleQueryKeys.employment(personId)
  )
  return useMutation({
    mutationFn: ({
      employmentId,
      positionId,
      payload,
    }: {
      employmentId: string
      positionId: string
      payload: Partial<EmploymentPositionPayload>
    }) => updateEmploymentPosition(personId, employmentId, positionId, payload),
    onSuccess: invalidate,
  })
}
export function useDeleteEmploymentPosition(personId: string) {
  const invalidate = useInvalidateNested(
    personId,
    peopleQueryKeys.employment(personId)
  )
  return useMutation({
    mutationFn: ({
      employmentId,
      positionId,
    }: {
      employmentId: string
      positionId: string
    }) => deleteEmploymentPosition(personId, employmentId, positionId),
    onSuccess: invalidate,
  })
}

export function useCreateEducationHistory(personId: string) {
  const invalidate = useInvalidateNested(
    personId,
    peopleQueryKeys.education(personId)
  )
  return useMutation({
    mutationFn: (payload: EducationHistoryPayload) =>
      createEducationHistory(personId, payload),
    onSuccess: invalidate,
  })
}
export function useUpdateEducationHistory(personId: string) {
  const invalidate = useInvalidateNested(
    personId,
    peopleQueryKeys.education(personId)
  )
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Partial<EducationHistoryPayload>
    }) => updateEducationHistory(personId, id, payload),
    onSuccess: invalidate,
  })
}
export function useDeleteEducationHistory(personId: string) {
  const invalidate = useInvalidateNested(
    personId,
    peopleQueryKeys.education(personId)
  )
  return useMutation({
    mutationFn: (id: string) => deleteEducationHistory(personId, id),
    onSuccess: invalidate,
  })
}

export function usePeopleCompanyOptions(search: string, enabled = true) {
  return useQuery({
    queryKey: [...peopleQueryKeys.companyOptions(search), useQueryScope()],
    queryFn: () => getCompanyOptions(search),
    enabled,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })
}

export function usePeopleCompanyOption(companyId?: string, enabled = true) {
  return useQuery({
    queryKey: [
      ...peopleQueryKeys.companyOption(companyId ?? ""),
      useQueryScope(),
    ],
    queryFn: () => getCompanyOption(companyId ?? ""),
    enabled: enabled && Boolean(companyId),
    staleTime: 60_000,
  })
}

function useInvalidatePeople() {
  const queryClient = useQueryClient()
  return async (personId?: string) => {
    await queryClient.invalidateQueries({
      queryKey: peopleQueryKeys.directoryRoot(),
    })
    if (personId) {
      await queryClient.invalidateQueries({
        queryKey: peopleQueryKeys.detail(personId),
      })
    }
  }
}

export function useCreatePerson() {
  const invalidate = useInvalidatePeople()
  return useMutation({
    mutationFn: (payload: PersonMutationPayload) => createPerson(payload),
    onSuccess: async (person) => invalidate(person.id),
  })
}

export function useUpdatePerson(personId: string) {
  const invalidate = useInvalidatePeople()
  return useMutation({
    mutationFn: (payload: Omit<PersonMutationPayload, "companyId">) =>
      updatePerson(personId, payload),
    onSuccess: async () => invalidate(personId),
  })
}

export function useDeletePerson() {
  const invalidate = useInvalidatePeople()
  return useMutation({
    mutationFn: (personId: string) => deletePerson(personId),
    onSuccess: async () => invalidate(),
  })
}
