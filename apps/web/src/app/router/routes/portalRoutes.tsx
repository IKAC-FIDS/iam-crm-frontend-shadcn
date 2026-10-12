import { Outlet, type RouteObject } from "react-router-dom"
import { PortalShell } from "@/app/layout/PortalShell"
import { PortalAccountPage } from "@/features/portalAuth/PortalAccountPage"
import { PortalCompanySelectionPage } from "@/features/portalAuth/PortalCompanySelectionPage"
import { PortalHomePage } from "@/features/portalAuth/PortalHomePage"
import { PortalInvitationPage } from "@/features/portalAuth/PortalInvitationPage"
import { PortalLoginPage } from "@/features/portalAuth/PortalLoginPage"
import { PortalProtectedRoute } from "@/features/portalAuth/PortalProtectedRoute"
import { PortalSessionBoundary } from "@/features/portalAuth/PortalSessionBoundary"
import {
  PortalNewRequestPage,
  PortalRequestDetailPage,
  PortalRequestsListPage,
} from "@/features/customerRequests/PortalRequestPages"

export const portalRoutes: RouteObject[] = [
  {
    element: (
      <PortalSessionBoundary>
        <Outlet />
      </PortalSessionBoundary>
    ),
    children: [
      { path: "/portal/login", element: <PortalLoginPage /> },
      { path: "/portal/invitation/:token", element: <PortalInvitationPage /> },
      {
        path: "/portal/select-company",
        element: <PortalCompanySelectionPage />,
      },
      {
        element: <PortalProtectedRoute />,
        children: [
          {
            element: <PortalShell />,
            children: [
              { path: "/portal/home", element: <PortalHomePage /> },
              { path: "/portal/account", element: <PortalAccountPage /> },
              { path: "/portal/requests", element: <PortalRequestsListPage /> },
              {
                path: "/portal/requests/new",
                element: <PortalNewRequestPage />,
              },
              {
                path: "/portal/requests/:id",
                element: <PortalRequestDetailPage />,
              },
            ],
          },
        ],
      },
    ],
  },
]
