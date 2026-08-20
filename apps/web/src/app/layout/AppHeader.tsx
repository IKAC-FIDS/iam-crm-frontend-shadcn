import {
  Bell,
  ChevronLeft,
  LogOut,
  Settings,
  UserRound,
} from "lucide-react"
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom"

import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"

import { getRoutePresentation } from "@/app/navigation/routeNavigation"
import { uiText } from "@/config/uiText"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useAuthStore } from "@/store/authStore"

export function AppHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { logout, isLoggingOut } = useAuth()
  const { title, breadcrumbs } = getRoutePresentation(location.pathname)

  const initial =
    user?.fullName?.trim().charAt(0) || uiText.common.fallbackUserInitial

  return (
    <header className="sticky top-0 z-30 border-b border-[#E4EAF3]/80 bg-[#FCFCFF]/85 backdrop-blur-xl">
      <div className="flex min-h-[72px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <SidebarTrigger
          aria-label={uiText.common.openCloseMainMenu}
          className="size-9 rounded-xl text-[#55677F] hover:bg-[#EFF5FA] hover:text-[#0053B2]"
        />

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-3">
            <h1 className="truncate text-lg font-bold text-[#0F172A]">
              {title}
            </h1>

            <div className="hidden h-4 w-px bg-[#E4EAF3] sm:block" />

            <nav className="hidden min-w-0 items-center gap-1 text-xs text-[#64748B] sm:flex">
              {breadcrumbs.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className="flex min-w-0 items-center gap-1"
                >
                  {index > 0 ? (
                    <ChevronLeft className="size-3 shrink-0 text-[#C2CAD6]" />
                  ) : null}

                  {item.to ? (
                    <Link
                      to={item.to}
                      className="truncate transition hover:text-[#0053B2]"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="truncate">{item.label}</span>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <p className="mt-1 hidden text-[11px] text-[#64748B] lg:block">
            {uiText.app.workspaceSubtitle}
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative size-10 rounded-xl text-[#55677F] hover:bg-[#EFF5FA] hover:text-[#0053B2]"
          aria-label={uiText.common.notifications}
          onClick={() => navigate("/notifications")}
        >
          <Bell className="size-5" />
          <span className="absolute end-2 top-2 size-2 rounded-full border-2 border-[#FCFCFF] bg-[#E91E63]" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                className="h-11 gap-3 rounded-2xl px-2 hover:bg-[#EFF5FA]"
              />
            }
          >
            <div className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-[#D6E3FF] to-[#D0E5FB] text-sm font-bold text-[#003F88] ring-1 ring-[#0053B2]/10">
              {initial}
            </div>

            <div className="hidden min-w-0 text-start sm:grid">
              <span className="max-w-40 truncate text-sm font-semibold text-[#0F172A]">
                {user?.fullName}
              </span>
              <span className="max-w-40 truncate text-[11px] text-[#64748B]">
                {user?.roleName || user?.role}
              </span>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-64 rounded-2xl border-[#E4EAF3] p-2 shadow-[0_18px_50px_rgba(15,23,42,0.12)]"
            dir="rtl"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-2 py-2">
                <div className="grid gap-0.5">
                  <span className="text-sm font-semibold text-[#0F172A]">
                    {user?.fullName}
                  </span>
                  <span
                    dir="ltr"
                    className="text-right text-xs font-normal text-[#64748B]"
                  >
                    {user?.email}
                  </span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => navigate("/account/profile")}
              className="rounded-xl"
            >
              <UserRound className="size-4" />
              {uiText.common.profile}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => navigate("/account/security")}
              className="rounded-xl"
            >
              <Settings className="size-4" />
              {uiText.common.accountSecurity}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              disabled={isLoggingOut}
              onClick={() => void logout()}
              className="rounded-xl text-[#BA1A1A] focus:bg-[#FFDAD6] focus:text-[#BA1A1A]"
            >
              <LogOut className="size-4" />
              {isLoggingOut
                ? uiText.common.loggingOut
                : uiText.common.logoutFromAccount}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
