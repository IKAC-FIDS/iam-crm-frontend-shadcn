import { createBrowserRouter, type RouteObject } from "react-router-dom"
import { AppShell } from "@/app/layout/AppShell"
import { ProtectedRoute } from "./ProtectedRoute"
import { RouteErrorPage } from "./RouteErrorPage"
import { publicRoutes } from "./routes/publicRoutes"
import { coreRoutes } from "./routes/coreRoutes"
import { salesRoutes } from "./routes/salesRoutes"
import { technicalRoutes } from "./routes/technicalRoutes"
import { adminRoutes } from "./routes/adminRoutes"
import { accountRoutes } from "./routes/accountRoutes"

export const appRoutes: RouteObject[] = [
  ...publicRoutes,
  {
    element: <ProtectedRoute />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <AppShell />,
        errorElement: <RouteErrorPage />,
        children: [
          ...coreRoutes,
          ...salesRoutes,
          ...technicalRoutes,
          ...adminRoutes,
          ...accountRoutes,
        ],
      },
    ],
  },
]
export const router = createBrowserRouter(appRoutes)
