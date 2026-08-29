import { Navigate } from "react-router-dom"
import { lazyRoute } from "../lazyRoute"
import { routeGroup } from "./routeGroup"
export const salesRoutes = [
  routeGroup(
    "companies",
    lazyRoute(
      () => import("@/features/companies/pages/CompaniesPage"),
      "CompaniesPage"
    ),
    [
      {
        path: "/companies/:companyId",
        element: lazyRoute(
          () => import("@/features/companies/pages/CompanyDetailPage"),
          "CompanyDetailPage"
        ),
      },
    ]
  ),
  routeGroup(
    "people",
    lazyRoute(() => import("@/features/people/pages/PeoplePage"), "PeoplePage")
  ),
  routeGroup(
    "opportunities",
    lazyRoute(
      () => import("@/features/opportunities/pages/OpportunityWorkspacePage"),
      "OpportunityWorkspacePage"
    ),
    [
      {
        path: "/opportunities/:id",
        element: lazyRoute(
          () => import("@/features/opportunities/pages/OpportunityDetailPage"),
          "OpportunityDetailPage"
        ),
      },
      { path: "/pipeline", element: <Navigate to="/opportunities" replace /> },
    ]
  ),
  routeGroup(
    "tasks",
    lazyRoute(() => import("@/features/tasks/pages/TasksPage"), "TasksPage"),
    [
      {
        path: "/tasks/:id",
        element: lazyRoute(
          () => import("@/features/tasks/pages/TaskDetailPage"),
          "TaskDetailPage"
        ),
      },
    ]
  ),
  routeGroup(
    "meetings",
    lazyRoute(
      () => import("@/features/meetings/pages/MeetingsPage"),
      "MeetingsPage"
    ),
    [
      {
        path: "/meetings/:id",
        element: lazyRoute(
          () => import("@/features/meetings/pages/MeetingDetailPage"),
          "MeetingDetailPage"
        ),
      },
    ]
  ),
  routeGroup(
    "activities",
    lazyRoute(
      () => import("@/features/activities/pages/ActivitiesPage"),
      "ActivitiesPage"
    )
  ),
  routeGroup(
    "attention",
    lazyRoute(
      () => import("@/features/attention/pages/AttentionCenterPage"),
      "AttentionCenterPage"
    ),
    [
      {
        path: "/follow-ups",
        element: <Navigate to="/attention?tab=follow-ups" replace />,
      },
      {
        path: "/notifications",
        element: <Navigate to="/attention?tab=notifications" replace />,
      },
    ]
  ),
  routeGroup(
    "reports",
    lazyRoute(
      () => import("@/features/reports/pages/ReportsPage"),
      "ReportsPage"
    )
  ),
]
