import { lazyRoute } from "../lazyRoute"
import { routeGroup } from "./routeGroup"
export const adminRoutes = [
  routeGroup(
    "admin-users",
    lazyRoute(
      () => import("@/features/admin/users/pages/AdminUsersPage"),
      "AdminUsersPage"
    ),
    [
      {
        path: "/admin/users/:userId",
        element: lazyRoute(
          () => import("@/features/admin/users/pages/AdminUserDetailsPage"),
          "AdminUserDetailsPage"
        ),
      },
    ]
  ),
  routeGroup(
    "admin-teams",
    lazyRoute(
      () => import("@/features/admin/teams/pages/AdminTeamsPage"),
      "AdminTeamsPage"
    ),
    [
      {
        path: "/admin/teams/:teamId",
        element: lazyRoute(
          () => import("@/features/admin/teams/pages/AdminTeamDetailsPage"),
          "AdminTeamDetailsPage"
        ),
      },
    ]
  ),
  routeGroup(
    "admin-exchange-rates",
    lazyRoute(
      () =>
        import("@/features/admin/exchange-rates/pages/AdminExchangeRatesPage"),
      "AdminExchangeRatesPage"
    )
  ),
  routeGroup(
    "admin-permissions",
    lazyRoute(
      () => import("@/features/admin/permissions/pages/AdminPermissionsPage"),
      "AdminPermissionsPage"
    )
  ),
  routeGroup(
    "admin-pipeline",
    lazyRoute(
      () => import("@/features/admin/pipeline/pages/AdminPipelinePage"),
      "AdminPipelinePage"
    )
  ),
  routeGroup(
    "admin-audit-logs",
    lazyRoute(
      () => import("@/features/admin/audit-logs/pages/AdminAuditLogsPage"),
      "AdminAuditLogsPage"
    )
  ),
  routeGroup(
    "admin-libraries",
    lazyRoute(
      () => import("@/features/admin/libraries/pages/AdminLibrariesPage"),
      "AdminLibrariesPage"
    )
  ),
]
