import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  createPerson,
  deletePerson,
  getCompanyOption,
  getCompanyOptions,
  getLookupOptions,
  getPeopleDirectory,
  getPerson,
  updatePerson,
} from "../api/people.api"
import type {
  PeopleDirectoryQuery,
  PersonMutationPayload,
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
}

export function usePeopleDirectory(
  query: PeopleDirectoryQuery,
  enabled = true,
) {
  return useQuery({
    queryKey: peopleQueryKeys.directory(query),
    queryFn: () => getPeopleDirectory(query),
    placeholderData: keepPreviousData,
    enabled,
  })
}

export function usePerson(personId: string | null) {
  return useQuery({
    queryKey: peopleQueryKeys.detail(personId ?? ""),
    queryFn: () => getPerson(personId ?? ""),
    enabled: Boolean(personId),
  })
}

export function usePeopleLookup(group: string) {
  return useQuery({
    queryKey: peopleQueryKeys.lookup(group),
    queryFn: () => getLookupOptions(group),
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
      departments: departments.data ?? [],
      jobTitles: jobTitles.data ?? [],
      personaRoles: personaRoles.data ?? [],
      seniorityLevels: seniorityLevels.data ?? [],
    },
    isLoading:
      departments.isLoading ||
      jobTitles.isLoading ||
      personaRoles.isLoading ||
      seniorityLevels.isLoading,
  }
}

export function usePeopleCompanyOptions(search: string, enabled = true) {
  return useQuery({
    queryKey: peopleQueryKeys.companyOptions(search),
    queryFn: () => getCompanyOptions(search),
    enabled,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })
}

export function usePeopleCompanyOption(companyId?: string, enabled = true) {
  return useQuery({
    queryKey: peopleQueryKeys.companyOption(companyId ?? ""),
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
