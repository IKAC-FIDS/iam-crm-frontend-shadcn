import { AdminUsersPage } from "@/features/admin/users/pages/AdminUsersPage"
import { AdminUserDetailsPage } from "@/features/admin/users/pages/AdminUserDetailsPage"
import { AdminTeamsPage } from "@/features/admin/teams/pages/AdminTeamsPage"
import { AdminTeamDetailsPage } from "@/features/admin/teams/pages/AdminTeamDetailsPage"
import { AdminExchangeRatesPage } from "@/features/admin/exchange-rates/pages/AdminExchangeRatesPage"
import { AdminPermissionsPage } from "@/features/admin/permissions/pages/AdminPermissionsPage"
import { AdminPipelinePage } from "@/features/admin/pipeline/pages/AdminPipelinePage"
import { AdminAuditLogsPage } from "@/features/admin/audit-logs/pages/AdminAuditLogsPage"
import { AdminLibrariesPage } from "@/features/admin/libraries/pages/AdminLibrariesPage"
import { routeGroup } from "./routeGroup"
export const adminRoutes = [
  routeGroup("admin-users", <AdminUsersPage />, [
    { path: "/admin/users/:userId", element: <AdminUserDetailsPage /> },
  ]),
  routeGroup("admin-teams", <AdminTeamsPage />, [
    { path: "/admin/teams/:teamId", element: <AdminTeamDetailsPage /> },
  ]),
  routeGroup("admin-exchange-rates", <AdminExchangeRatesPage />),
  routeGroup("admin-permissions", <AdminPermissionsPage />),
  routeGroup("admin-pipeline", <AdminPipelinePage />),
  routeGroup("admin-audit-logs", <AdminAuditLogsPage />),
  routeGroup("admin-libraries", <AdminLibrariesPage />),
]
