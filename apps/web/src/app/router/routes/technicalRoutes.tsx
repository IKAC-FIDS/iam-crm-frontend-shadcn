import { lazyRoute } from "../lazyRoute"
import { routeGroup } from "./routeGroup"
const technical = () => import("@/features/technical/pages/TechnicalPages")
export const technicalRoutes = [
  routeGroup(
    "technical-releases",
    lazyRoute(technical, "TechnicalReleasesPage")
  ),
  routeGroup(
    "technical-knowledge-base",
    lazyRoute(technical, "TechnicalKnowledgeBasePage")
  ),
  routeGroup("technical-tenders", lazyRoute(technical, "TechnicalTendersPage")),
  routeGroup(
    "technical-documents",
    lazyRoute(technical, "TechnicalDocumentsPage")
  ),
  routeGroup(
    "technical-resources",
    lazyRoute(technical, "TechnicalResourcesPage")
  ),
]
