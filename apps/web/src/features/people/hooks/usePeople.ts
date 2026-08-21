import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  createPerson,
  deletePerson,
  getCompanyOptions,
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
  companyOptions: () => [...peopleQueryKeys.all, "company-options"] as const,
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

export function usePeopleCompanyOptions(enabled = true) {
  return useQuery({
    queryKey: peopleQueryKeys.companyOptions(),
    queryFn: getCompanyOptions,
    enabled,
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
