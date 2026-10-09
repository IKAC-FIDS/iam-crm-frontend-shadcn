import { useQuery } from "@tanstack/react-query"
import {
  getAccountWorkspace,
  type AccountWorkspaceFilters,
} from "../api/accountWorkspaceApi"

export function useAccountWorkspace(filters: AccountWorkspaceFilters) {
  return useQuery({
    queryKey: ["account", "workspace", filters],
    queryFn: () => getAccountWorkspace(filters),
  })
}
