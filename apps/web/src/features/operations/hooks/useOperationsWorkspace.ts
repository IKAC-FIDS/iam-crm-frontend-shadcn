import { useQuery } from "@tanstack/react-query"
import { useQueryScope } from "@/lib/queryScope"
import { getOperationsWorkspace } from "../api/operations.api"

export const operationsKeys = {
  all: ["operations"] as const,
  workspace: () => [...operationsKeys.all, "workspace"] as const,
  companies: () => [...operationsKeys.all, "companies"] as const,
}

export function useOperationsWorkspace() {
  return useQuery({
    queryKey: [...operationsKeys.workspace(), useQueryScope()],
    queryFn: getOperationsWorkspace,
  })
}
