import {
  Navigate,
  createBrowserRouter,
} from "react-router-dom"

import { AppShell } from "@/app/layout/AppShell"
import { appMenuRoutes } from "@/app/navigation/routeRegistry"
import { AccountProfilePage } from "@/features/account/pages/AccountProfilePage"
import { LoginPage } from "@/features/auth/pages/LoginPage"
import { CompaniesPage } from "@/features/companies/pages/CompaniesPage"
import { CompanyDetailPage } from "@/features/companies/pages/CompanyDetailPage"
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage"
import { PeoplePage } from "@/features/people/pages/PeoplePage"
import { OpportunityWorkspacePage } from "@/features/opportunities/pages/OpportunityWorkspacePage"
import { FeaturePlaceholderPage } from "@/features/shared/pages/FeaturePlaceholderPage"

import { PermissionRoute } from "./PermissionRoute"
import { ProtectedRoute } from "./ProtectedRoute"
import { RouteErrorPage } from "./RouteErrorPage"

const featureRoutes = appMenuRoutes
  .filter(
    (route) =>
      route.path !== "/dashboard" &&
      route.path !== "/companies" &&
      route.path !== "/people" &&
      route.path !== "/opportunities" &&
      route.path !== "/pipeline",
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
                policy={{ type: "permissions", mode: "any", permissions: ["opportunity:view"] }}
              />
            ),
            children: [
              { path: "/opportunities", element: <OpportunityWorkspacePage /> },
              { path: "/opportunities/:id", element: <FeaturePlaceholderPage /> },
              { path: "/pipeline", element: <Navigate to="/opportunities" replace /> },
            ],
          },
          {
            path: "/account/profile",
            element: <AccountProfilePage />,
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
