import { lazyRoute } from "../lazyRoute"
import { routeGroup } from "./routeGroup"
export const coreRoutes = [
  routeGroup(
    "crm-assistant",
    lazyRoute(
      () => import("@/features/assistant/pages/CrmAssistantPage"),
      "CrmAssistantPage"
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
