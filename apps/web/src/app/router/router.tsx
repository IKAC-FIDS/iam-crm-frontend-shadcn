import { Navigate, createBrowserRouter } from "react-router-dom"

import { AppShell } from "@/app/layout/AppShell"
import { appMenuRoutes } from "@/app/navigation/routeRegistry"
import { AccountProfilePage } from "@/features/account/pages/AccountProfilePage"
import { AttentionCenterPage } from "@/features/attention/pages/AttentionCenterPage"
import { ActivitiesPage } from "@/features/activities/pages/ActivitiesPage"
import { LoginPage } from "@/features/auth/pages/LoginPage"
import { CompaniesPage } from "@/features/companies/pages/CompaniesPage"
import { CompanyDetailPage } from "@/features/companies/pages/CompanyDetailPage"
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage"
import { MeetingDetailPage } from "@/features/meetings/pages/MeetingDetailPage"
import { MeetingsPage } from "@/features/meetings/pages/MeetingsPage"
import { TasksPage } from "@/features/tasks/pages/TasksPage"
import { TaskDetailPage } from "@/features/tasks/pages/TaskDetailPage"
import { PeoplePage } from "@/features/people/pages/PeoplePage"
import { OpportunityDetailPage } from "@/features/opportunities/pages/OpportunityDetailPage"
import { OpportunityWorkspacePage } from "@/features/opportunities/pages/OpportunityWorkspacePage"
import { FeaturePlaceholderPage } from "@/features/shared/pages/FeaturePlaceholderPage"
import { ReportsPage } from "@/features/reports/pages/ReportsPage"
import { AdminUsersPage } from "@/features/admin/users/pages/AdminUsersPage"
import { AdminTeamsPage } from "@/features/admin/teams/pages/AdminTeamsPage"
import { AdminExchangeRatesPage } from "@/features/admin/exchange-rates/pages/AdminExchangeRatesPage"
import { AdminPermissionsPage } from "@/features/admin/permissions/pages/AdminPermissionsPage"
import { AdminPipelinePage } from "@/features/admin/pipeline/pages/AdminPipelinePage"
import { AdminAuditLogsPage } from "@/features/admin/audit-logs/pages/AdminAuditLogsPage"
import { AdminLibrariesPage } from "@/features/admin/libraries/pages/AdminLibrariesPage"
import { AdminTeamDetailsPage } from "@/features/admin/teams/pages/AdminTeamDetailsPage"
import { AdminUserDetailsPage } from "@/features/admin/users/pages/AdminUserDetailsPage"

import { PermissionRoute } from "./PermissionRoute"
import { ProtectedRoute } from "./ProtectedRoute"
import { RouteErrorPage } from "./RouteErrorPage"

const featureRoutes = appMenuRoutes
  .filter(
    (route) =>
      route.path !== "/activities" &&
      route.path !== "/attention" &&
      route.path !== "/dashboard" &&
      route.path !== "/companies" &&
      route.path !== "/people" &&
      route.path !== "/tasks" &&
      route.path !== "/meetings" &&
      route.path !== "/opportunities" &&
      route.path !== "/pipeline" &&
      route.path !== "/reports" &&
      route.path !== "/admin/users" &&
      route.path !== "/admin/teams" &&
      route.path !== "/admin/exchange-rates" &&
      route.path !== "/admin/permissions" &&
      route.path !== "/admin/pipeline" &&
      route.path !== "/admin/audit-logs" &&
      route.path !== "/admin/libraries"
  )
  .map((route) => ({
    element: <PermissionRoute policy={route.access} />,
    children: [
      {
        path: route.path,
        element: <FeaturePlaceholderPage />,
      },
    ],
  }))

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <RouteErrorPage />,
  },
  {
    element: <ProtectedRoute />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <AppShell />,
        errorElement: <RouteErrorPage />,
        children: [
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },
          {
            element: (
              <PermissionRoute policy={{ type: "permissions", mode: "any", permissions: ["library:industry:view", "library:industry:manage", "library:pain-point:view", "library:pain-point:manage", "library:use-case:view", "library:use-case:manage", "library:persona:view", "library:persona:manage", "library:lead-source:view", "library:lead-source:manage", "lookup:view", "lookup:manage", "library:university:view", "library:university:manage", "product:view", "product:manage"] }} />
            ),
            children: [{ path: "/admin/libraries", element: <AdminLibrariesPage /> }],
          },
          {
            element: (
              <PermissionRoute policy={{ type: "permissions", mode: "any", permissions: ["audit-log:view"] }} />
            ),
            children: [{ path: "/admin/audit-logs", element: <AdminAuditLogsPage /> }],
          },
          {
            element: (
              <PermissionRoute
                policy={{
                  type: "permissions",
                  mode: "any",
                  permissions: ["company:view"],
                }}
              />
            ),
            children: [
              {
                path: "/companies",
                element: <CompaniesPage />,
              },
              {
                path: "/companies/:companyId",
                element: <CompanyDetailPage />,
              },
            ],
          },
          {
            element: (
              <PermissionRoute
                policy={{
                  type: "permissions",
                  mode: "any",
                  permissions: ["people:directory:view"],
                }}
              />
            ),
            children: [
              {
                path: "/people",
                element: <PeoplePage />,
              },
            ],
          },
          {
            element: (
              <PermissionRoute
                policy={{
                  type: "permissions",
                  mode: "any",
                  permissions: ["opportunity:view"],
                }}
              />
            ),
            children: [
              { path: "/opportunities", element: <OpportunityWorkspacePage /> },
              {
                path: "/opportunities/:id",
                element: <OpportunityDetailPage />,
              },
              {
                path: "/pipeline",
                element: <Navigate to="/opportunities" replace />,
              },
            ],
          },
          {
            element: (
              <PermissionRoute
                policy={{
                  type: "permissions",
                  mode: "any",
                  permissions: ["task:view"],
                }}
              />
            ),
            children: [{ path: "/tasks", element: <TasksPage /> },
              { path: "/tasks/:id", element: <TaskDetailPage /> }],
          },          {
            element: (
              <PermissionRoute
                policy={{
                  type: "permissions",
                  mode: "any",
                  permissions: ["meeting:view"],
                }}
              />
            ),
            children: [
              { path: "/meetings", element: <MeetingsPage /> },
              { path: "/meetings/:id", element: <MeetingDetailPage /> },
            ],
          },          {
            element: (
              <PermissionRoute
                policy={{
                  type: "permissions",
                  mode: "any",
                  permissions: [
                    "follow-up:view",
                    "activity:view",
                    "notification:view",
                  ],
                }}
              />
            ),
            children: [
              {
                path: "/attention",
                element: <AttentionCenterPage />,
              },
              {
                path: "/follow-ups",
                element: <Navigate to="/attention?tab=follow-ups" replace />,
              },
              {
                path: "/notifications",
                element: <Navigate to="/attention?tab=notifications" replace />,
              },
            ],
          },          {
            element: (
              <PermissionRoute
                policy={{
                  type: "permissions",
                  mode: "any",
                  permissions: ["activity:view"],
                }}
              />
            ),
            children: [
              {
                path: "/activities",
                element: <ActivitiesPage />,
              },
            ],
          },
          {
            element: (
              <PermissionRoute
                policy={{
                  type: "permissions",
                  mode: "any",
                  permissions: ["report:view"],
                }}
              />
            ),
            children: [
              {
                path: "/reports",
                element: <ReportsPage />,
              },
            ],
          },


          {
            path: "/account/profile",
            element: <AccountProfilePage />,
          },
          {
            element: (
              <PermissionRoute
                policy={{
                  type: "permissions",
                  mode: "any",
                  permissions: ["user:view"],
                }}
              />
            ),
            children: [
              {
                path: "/admin/users",
                element: <AdminUsersPage />,
              },
              {
                path: "/admin/users/:userId",
                element: <AdminUserDetailsPage />,
              },
            ],
          },
          {
            element: (
              <PermissionRoute
                policy={{
                  type: "permissions",
                  mode: "any",
                  permissions: ["team:view", "team:manage"],
                }}
              />
            ),
            children: [
              {
                path: "/admin/teams",
                element: <AdminTeamsPage />,
              },
              {
                path: "/admin/teams/:teamId",
                element: <AdminTeamDetailsPage />,
              },
            ],
          },
          {
            element: (
              <PermissionRoute
                policy={{
                  type: "permissions",
                  mode: "any",
                  permissions: ["exchange-rate:view", "exchange-rate:manage"],
                }}
              />
            ),
            children: [
              {
                path: "/admin/exchange-rates",
                element: <AdminExchangeRatesPage />,
              },
            ],
          },
          {
            element: (
              <PermissionRoute
                policy={{
                  type: "permissions",
                  mode: "any",
                  permissions: [
                    "permission:view",
                    "permission:manage",
                    "role:view",
                    "role:manage",
                  ],
                }}
              />
            ),
            children: [
              {
                path: "/admin/permissions",
                element: <AdminPermissionsPage />,
              },
            ],
          },
          {
            element: (
              <PermissionRoute
                policy={{
                  type: "permissions",
                  mode: "any",
                  permissions: [
                    "pipeline:config:view",
                    "pipeline:config:manage",
                    "pipeline:transition:view",
                    "pipeline:transition:manage",
                  ],
                }}
              />
            ),
            children: [
              {
                path: "/admin/pipeline",
                element: <AdminPipelinePage />,
              },
            ],
          },
          ...featureRoutes,
        ],
      },
    ],
  },
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
])






