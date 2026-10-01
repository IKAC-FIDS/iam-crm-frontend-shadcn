import { lazyRoute } from "../lazyRoute"
import { routeGroup } from "./routeGroup"
export const coreRoutes = [
  routeGroup(
    "operations-workspace",
    lazyRoute(
      () => import("@/features/operations/pages/OperationsPage"),
      "OperationsPage"
    )
  ),
  routeGroup(
    "dashboard",
    lazyRoute(
      () => import("@/features/dashboard/pages/DashboardPage"),
      "DashboardPage"
    )
  ),
]
