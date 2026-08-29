import { lazyRoute } from "../lazyRoute"
import { routeGroup } from "./routeGroup"
export const coreRoutes = [
  routeGroup(
    "dashboard",
    lazyRoute(
      () => import("@/features/dashboard/pages/DashboardPage"),
      "DashboardPage"
    )
  ),
]
