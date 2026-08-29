import { lazyRoute } from "../lazyRoute"
import { routeGroup } from "./routeGroup"
const technical = () => import("@/features/technical/pages/TechnicalPages")
export const technicalRoutes = [
  routeGroup(
    "technical-releases",
    lazyRoute(technical, "TechnicalReleasesPage"),
    [
      {
        path: "/technical/releases/new",
        element: lazyRoute(technical, "TechnicalReleaseEditorPage"),
      },
      {
        path: "/technical/releases/:id",
        element: lazyRoute(technical, "TechnicalReleaseDetailPage"),
      },
    ]
  ),
  routeGroup(
    "technical-knowledge-base",
    lazyRoute(technical, "TechnicalKnowledgeBasePage"),
    [
      {
        path: "/technical/knowledge-base/new",
        element: lazyRoute(technical, "TechnicalKnowledgeEditorPage"),
      },
      {
        path: "/technical/knowledge-base/:id",
        element: lazyRoute(technical, "TechnicalKnowledgeDetailPage"),
      },
    ]
  ),
  routeGroup(
    "technical-tenders",
    lazyRoute(technical, "TechnicalTendersPage"),
    [
      {
        path: "/technical/tenders/new",
        element: lazyRoute(technical, "TechnicalTenderEditorPage"),
      },
      {
        path: "/technical/tenders/:id",
        element: lazyRoute(technical, "TechnicalTenderDetailPage"),
      },
    ]
  ),
  routeGroup(
    "technical-documents",
    lazyRoute(technical, "TechnicalDocumentsPage"),
    [
      {
        path: "/technical/documents/new",
        element: lazyRoute(technical, "TechnicalDocumentEditorPage"),
      },
      {
        path: "/technical/documents/:id",
        element: lazyRoute(technical, "TechnicalDocumentDetailPage"),
      },
    ]
  ),
  routeGroup(
    "technical-resources",
    lazyRoute(technical, "TechnicalResourcesPage"),
    [
      {
        path: "/technical/resources/new",
        element: lazyRoute(technical, "TechnicalResourceEditorPage"),
      },
      {
        path: "/technical/resources/:id",
        element: lazyRoute(technical, "TechnicalResourceDetailPage"),
      },
    ]
  ),
]
