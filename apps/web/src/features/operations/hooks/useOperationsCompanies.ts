import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useQueryScope } from "@/lib/queryScope"
import { getOperationsCompanies } from "../api/operations.api"
import type { OperationsCompaniesQuery } from "../types/operations.types"
import { operationsKeys } from "./useOperationsWorkspace"

export function useOperationsCompanies(query: OperationsCompaniesQuery) {
  return useQuery({
    queryKey: [...operationsKeys.companies(), useQueryScope(), query],
    queryFn: () => getOperationsCompanies(query),
    placeholderData: keepPreviousData,
  })
}
