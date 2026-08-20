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
import { FeaturePlaceholderPage } from "@/features/shared/pages/FeaturePlaceholderPage"

import { PermissionRoute } from "./PermissionRoute"
import { ProtectedRoute } from "./ProtectedRoute"
import { RouteErrorPage } from "./RouteErrorPage"

const featureRoutes = appMenuRoutes
  .filter(
    (route) =>
      route.path !== "/dashboard" &&
      route.path !== "/companies",
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
