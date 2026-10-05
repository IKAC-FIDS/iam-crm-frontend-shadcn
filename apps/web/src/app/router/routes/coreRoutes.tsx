import { lazyRoute } from "../lazyRoute"
import { routeGroup } from "./routeGroup"
export const coreRoutes = [
  routeGroup(
    "collaboration",
    lazyRoute(
      () => import("@/features/collaboration/pages/CollaborationPage"),
      "CollaborationPage"
    )
  ),
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
