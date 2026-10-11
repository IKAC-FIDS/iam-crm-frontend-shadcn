import { lazyRoute } from "../lazyRoute"
import { routeGroup } from "./routeGroup"
import { Navigate } from "react-router-dom"
import type { RouteObject } from "react-router-dom"
const technical = () => import("@/features/technical/pages/TechnicalPages")
export const technicalRoutes: RouteObject[] = [
  routeGroup("technical-library", lazyRoute(technical, "TechnicalLibraryPage")),
  routeGroup(
    "technical-releases",
    <Navigate to="/technical/library" replace />,
    [
      {
        path: "/technical/releases/new",
        element: <Navigate to="/technical/library" replace />,
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
    <Navigate to="/technical/library" replace />,
    [
      {
        path: "/technical/documents/new",
        element: <Navigate to="/technical/library" replace />,
      },
      {
        path: "/technical/documents/:id",
        element: lazyRoute(technical, "TechnicalDocumentDetailPage"),
      },
    ]
  ),
  routeGroup(
    "technical-resources",
    <Navigate to="/technical/library" replace />,
    [
      {
        path: "/technical/resources/new",
        element: <Navigate to="/technical/library" replace />,
      },
      {
        path: "/technical/resources/:id",
        element: lazyRoute(technical, "TechnicalResourceDetailPage"),
      },
    ]
  ),
]
