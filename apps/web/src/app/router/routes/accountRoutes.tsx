import { AccountProfilePage } from "@/features/account/pages/AccountProfilePage"
import { AccountSecurityPage } from "@/features/account/pages/AccountSecurityPage"
import { AccountUsagePage } from "@/features/account/pages/AccountUsagePage"
import { routeGroup } from "./routeGroup"
export const accountRoutes = [
  routeGroup("account-security", <AccountSecurityPage />, [
    { path: "/account/profile", element: <AccountProfilePage /> },
  ]),
  routeGroup("account-usage", <AccountUsagePage />),
]
