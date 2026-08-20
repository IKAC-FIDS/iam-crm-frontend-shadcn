import {
  Navigate,
  createBrowserRouter,
} from "react-router-dom"

import { AppShell } from "@/app/layout/AppShell"
import { appMenuRoutes } from "@/app/navigation/routeRegistry"
import { AccountProfilePage } from "@/features/account/pages/AccountProfilePage"
import { LoginPage } from "@/features/auth/pages/LoginPage"
import { DashboardPlaceholderPage } from "@/features/dashboard/pages/DashboardPlaceholderPage"
import { FeaturePlaceholderPage } from "@/features/shared/pages/FeaturePlaceholderPage"

import { PermissionRoute } from "./PermissionRoute"
import { ProtectedRoute } from "./ProtectedRoute"
import { RouteErrorPage } from "./RouteErrorPage"

const featureRoutes = appMenuRoutes
  .filter((route) => route.path !== "/dashboard")
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
            element: <DashboardPlaceholderPage />,
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
