import { useQuery } from "@tanstack/react-query"
import { useQueryScope } from "@/lib/queryScope"
import {
  getTeams,
  getTeam,
  getTeamMembers,
  getAllUsers,
  getTeamAuditLogs,
  type TeamFilters,
} from "../api/adminTeamsApi"

export const teamKeys = {
  list: (filters: TeamFilters) => ["admin-teams", filters] as const,
  count: (active: boolean) =>
    ["admin-teams-count", active ? "active" : "inactive"] as const,
  detail: (id: string) => ["admin-team-detail", id] as const,
  members: (id: string) => ["admin-team-members", id] as const,
  users: () => ["admin-teams-users"] as const,
  audit: (id: string) => ["admin-team-audit", id] as const,
}
export function useTeamsQueries(filters: TeamFilters, enabled = true) {
  const scope = useQueryScope()
  const teamsQuery = useQuery({
    queryKey: [...teamKeys.list(filters), scope],
    queryFn: () => getTeams(filters),
    enabled,
  })
  const activeCountQuery = useQuery({
    queryKey: [...teamKeys.count(true), scope],
    queryFn: () => getTeams({ page: 1, limit: 1, isActive: true }),
  })
  const inactiveCountQuery = useQuery({
    queryKey: [...teamKeys.count(false), scope],
    queryFn: () =>
      getTeams({ page: 1, limit: 1, isActive: false, includeInactive: true }),
  })
  const usersQuery = useQuery({
    queryKey: [...teamKeys.users(), scope],
    queryFn: getAllUsers,
  })
  return { teamsQuery, activeCountQuery, inactiveCountQuery, usersQuery }
}
export function useTeamDetailQueries(id: string, canViewAudit: boolean) {
  const scope = useQueryScope()
  const teamQuery = useQuery({
    queryKey: [...teamKeys.detail(id), scope],
    queryFn: () => getTeam(id),
    enabled: Boolean(id),
  })
  // Backend returns the full member array; pagination stays in the view.
  const membersQuery = useQuery({
    queryKey: [...teamKeys.members(id), scope],
    queryFn: () => getTeamMembers(id),
    enabled: Boolean(id),
  })
  const usersQuery = useQuery({
    queryKey: [...teamKeys.users(), scope],
    queryFn: getAllUsers,
  })
  const auditQuery = useQuery({
    queryKey: [...teamKeys.audit(id), scope],
    queryFn: () => getTeamAuditLogs(id),
    enabled: Boolean(id) && canViewAudit,
  })
  return { teamQuery, membersQuery, usersQuery, auditQuery }
}
