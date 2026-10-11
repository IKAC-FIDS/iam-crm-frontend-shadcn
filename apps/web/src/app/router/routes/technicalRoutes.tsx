import { lazyRoute } from "../lazyRoute"
import { routeGroup } from "./routeGroup"
import { Navigate } from "react-router-dom"
import type { RouteObject } from "react-router-dom"
const technical = () => import("@/features/technical/pages/TechnicalPages")
export const technicalRoutes: RouteObject[] = [
  routeGroup(
    "technical-library",
    lazyRoute(technical, "TechnicalLibraryPage")
  ),
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
  {
    path: "/technical/tenders/*",
    element: <Navigate to="/collaboration" replace />,
  },
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
