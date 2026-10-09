import { lazyRoute } from "../lazyRoute"
import { routeGroup } from "./routeGroup"
export const accountRoutes = [
  routeGroup('account-timesheets', lazyRoute(() => import('@/features/timesheets/TimesheetPages'), 'PersonalTimesheetsPage')),
  routeGroup('account-leave', lazyRoute(() => import('@/features/timesheets/TimesheetPages'), 'PersonalLeavePage')),
  routeGroup(
    "account-security",
    lazyRoute(
      () => import("@/features/account/pages/AccountSecurityPage"),
      "AccountSecurityPage"
    ),
    [
      {
        path: "/account/profile",
        element: lazyRoute(
          () => import("@/features/account/pages/AccountProfilePage"),
          "AccountProfilePage"
        ),
      },
    ]
  ),
  routeGroup(
    "account-usage",
    lazyRoute(
      () => import("@/features/account/pages/AccountUsagePage"),
      "AccountUsagePage"
    )
  ),
]
