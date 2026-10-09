import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useQueryScope } from "@/lib/queryScope"
import {
  activateUser,
  deactivateUser,
  getUsers,
  getTeams,
  getRoles,
  getQuotaSummary,
  type AdminUser,
  type UserFilters,
} from "../api/adminUsersApi"

// Keep established roots: detail/role screens already invalidate these prefixes.
export const adminUserKeys = {
  all: ["admin-users"] as const,
  lists: () => [...adminUserKeys.all, "list"] as const,
  list: (filters: UserFilters, scope: string) =>
    [...adminUserKeys.lists(), scope, filters] as const,
  counts: ["admin-users-count"] as const,
  count: (active: boolean, scope: string) =>
    ["admin-users-count", scope, active] as const,
  teams: ["admin-users-teams"] as const,
  roles: ["admin-users-roles"] as const,
  quota: ["quota-current"] as const,
}
export function useAdminUsers(filters: UserFilters, enabled = true) {
  const scope = useQueryScope()
  return useQuery({
    queryKey: adminUserKeys.list(filters, scope),
    queryFn: () => getUsers(filters),
    placeholderData: keepPreviousData,
    enabled,
  })
}
export function useAdminUserCount(active: boolean) {
  const scope = useQueryScope()
  return useQuery({
    queryKey: adminUserKeys.count(active, scope),
    queryFn: () => getUsers({ page: 1, limit: 1, isActive: active }),
  })
}
export function useAdminUserOptions(
  canViewTeams: boolean,
  canViewRoles: boolean
) {
  const scope = useQueryScope()
  const teams = useQuery({
    queryKey: [...adminUserKeys.teams, scope],
    queryFn: getTeams,
    enabled: canViewTeams,
  })
  const roles = useQuery({
    queryKey: [...adminUserKeys.roles, scope],
    queryFn: getRoles,
    enabled: canViewRoles,
  })
  const quota = useQuery({
    queryKey: [...adminUserKeys.quota, scope],
    queryFn: getQuotaSummary,
  })
  return { teams, roles, quota }
}
export function useRefreshAdminUsers() {
  const client = useQueryClient()
  return () =>
    Promise.all(
      [adminUserKeys.all, adminUserKeys.counts, adminUserKeys.quota].map(
        (queryKey) => client.invalidateQueries({ queryKey })
      )
    )
}
export function useSetAdminUserStatus(options: {
  onSuccess: (user: AdminUser) => void | Promise<void>
  onError: (error: unknown) => void
}) {
  return useMutation({
    mutationFn: (user: AdminUser) =>
      user.isActive ? deactivateUser(user.id) : activateUser(user.id),
    onSuccess: (_, user) => options.onSuccess(user),
    onError: options.onError,
  })
}
