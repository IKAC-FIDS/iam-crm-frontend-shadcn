import {
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
import { NotificationBell } from "@/features/notifications/components/NotificationBell"
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
    <header className="sticky top-0 z-30 border-b border-[var(--app-divider)]/80 bg-[var(--app-surface)]/85 backdrop-blur-xl">
      <div className="flex min-h-[72px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <SidebarTrigger
          aria-label={uiText.common.openCloseMainMenu}
          className="size-9 rounded-xl text-[var(--app-primary-alt)] hover:bg-[var(--app-background)] hover:text-[var(--app-primary)]"
        />

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-3">
            <h1 className="truncate text-lg font-bold text-[var(--app-heading)]">
              {title}
            </h1>

            <div className="hidden h-4 w-px bg-[var(--app-divider)] sm:block" />

            <nav className="hidden min-w-0 items-center gap-1 text-xs text-[var(--app-text-secondary)] sm:flex">
              {breadcrumbs.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className="flex min-w-0 items-center gap-1"
                >
                  {index > 0 ? (
                    <ChevronLeft className="size-3 shrink-0 text-[var(--app-outline)]" />
                  ) : null}

                  {item.to ? (
                    <Link
                      to={item.to}
                      className="truncate transition hover:text-[var(--app-primary)]"
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

          <p className="mt-1 hidden text-xs text-[var(--app-text-secondary)] lg:block">
            {uiText.app.workspaceSubtitle}
          </p>
        </div>
        <NotificationBell
          enabled={Boolean(user?.permissions?.includes("notification:view"))}
        />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                className="h-11 gap-3 rounded-2xl px-2 hover:bg-[var(--app-background)]"
              />
            }
          >
            <div className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-[var(--app-primary-soft)] to-[var(--info-light)] text-sm font-bold text-[var(--app-primary-active)] ring-1 ring-[var(--app-primary)]/10">
              {initial}
            </div>

            <div className="hidden min-w-0 text-start sm:grid">
              <span className="max-w-40 truncate text-sm font-semibold text-[var(--app-heading)]">
                {user?.fullName}
              </span>
              <span className="max-w-40 truncate text-xs text-[var(--app-text-secondary)]">
                {user?.roleName || user?.role}
              </span>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-64 rounded-2xl border-[var(--app-divider)] p-2 shadow-[var(--app-shadow-popover)]"
            dir="rtl"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-2 py-2">
                <div className="grid gap-0.5">
                  <span className="text-sm font-semibold text-[var(--app-heading)]">
                    {user?.fullName}
                  </span>
                  <span
                    dir="ltr"
                    className="text-right text-xs font-normal text-[var(--app-text-secondary)]"
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
              className="rounded-xl text-[var(--destructive)] focus:bg-[var(--destructive-soft)] focus:text-[var(--destructive)]"
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

