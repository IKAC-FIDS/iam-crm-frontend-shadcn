import { Navigate } from "react-router-dom"
import { CompaniesPage } from "@/features/companies/pages/CompaniesPage"
import { CompanyDetailPage } from "@/features/companies/pages/CompanyDetailPage"
import { PeoplePage } from "@/features/people/pages/PeoplePage"
import { OpportunityWorkspacePage } from "@/features/opportunities/pages/OpportunityWorkspacePage"
import { OpportunityDetailPage } from "@/features/opportunities/pages/OpportunityDetailPage"
import { ActivitiesPage } from "@/features/activities/pages/ActivitiesPage"
import { AttentionCenterPage } from "@/features/attention/pages/AttentionCenterPage"
import { MeetingsPage } from "@/features/meetings/pages/MeetingsPage"
import { MeetingDetailPage } from "@/features/meetings/pages/MeetingDetailPage"
import { TasksPage } from "@/features/tasks/pages/TasksPage"
import { TaskDetailPage } from "@/features/tasks/pages/TaskDetailPage"
import { ReportsPage } from "@/features/reports/pages/ReportsPage"
import { routeGroup } from "./routeGroup"
export const salesRoutes = [
  routeGroup("companies", <CompaniesPage />, [
    { path: "/companies/:companyId", element: <CompanyDetailPage /> },
  ]),
  routeGroup("people", <PeoplePage />),
  routeGroup("opportunities", <OpportunityWorkspacePage />, [
    { path: "/opportunities/:id", element: <OpportunityDetailPage /> },
    { path: "/pipeline", element: <Navigate to="/opportunities" replace /> },
  ]),
  routeGroup("tasks", <TasksPage />, [
    { path: "/tasks/:id", element: <TaskDetailPage /> },
  ]),
  routeGroup("meetings", <MeetingsPage />, [
    { path: "/meetings/:id", element: <MeetingDetailPage /> },
  ]),
  routeGroup("activities", <ActivitiesPage />),
  routeGroup("attention", <AttentionCenterPage />, [
    {
      path: "/follow-ups",
      element: <Navigate to="/attention?tab=follow-ups" replace />,
    },
    {
      path: "/notifications",
      element: <Navigate to="/attention?tab=notifications" replace />,
    },
  ]),
  routeGroup("reports", <ReportsPage />),
]
