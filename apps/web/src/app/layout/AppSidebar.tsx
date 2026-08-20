import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  BriefcaseBusiness,
  ChevronDown,
  LayoutDashboard,
  Settings2,
  ShieldCheck,
  UserRound,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@workspace/ui/components/sidebar"

import {
  getVisibleMenuGroups,
  getVisibleTopLevelRoutes,
  isMenuRouteActive,
} from "@/app/navigation/routeNavigation"
import type { NavigationGroupKey } from "@/app/navigation/routeRegistry"
import { uiText } from "@/config/uiText"
import { useAuthStore } from "@/store/authStore"

const groupIcons = {
  sales: BriefcaseBusiness,
  management: Settings2,
  account: UserRound,
} satisfies Record<NavigationGroupKey, typeof BriefcaseBusiness>

const defaultOpenGroups: Record<NavigationGroupKey, boolean> = {
  sales: true,
  management: false,
  account: false,
}

export function AppSidebar() {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const location = useLocation()
  const { state, isMobile, setOpenMobile } = useSidebar()

  const groups = getVisibleMenuGroups(user)
  const topLevelRoutes = getVisibleTopLevelRoutes(user)

  const initial =
    user?.fullName?.trim().charAt(0) || uiText.common.fallbackUserInitial

  const [openGroups, setOpenGroups] =
    useState<Record<NavigationGroupKey, boolean>>(defaultOpenGroups)

  const activeGroup = useMemo(
    () =>
      groups.find(({ routes }) =>
        routes.some((route) =>
          isMenuRouteActive(route.path, location.pathname),
        ),
      )?.group,
    [groups, location.pathname],
  )

  useEffect(() => {
    if (!activeGroup) return

    setOpenGroups((current) => ({
      ...current,
      [activeGroup]: true,
    }))
  }, [activeGroup])

  const handleNavigate = (path: string) => {
    navigate(path)
    if (isMobile) setOpenMobile(false)
  }

  const toggleGroup = (group: NavigationGroupKey) => {
    setOpenGroups((current) => ({
      ...current,
      [group]: !current[group],
    }))
  }

  const isCollapsed = state === "collapsed" && !isMobile

  const routeButtonClass = (active: boolean, nested = false) =>
    [
      "relative rounded-xl text-[13px] transition-all duration-200",
      nested ? "h-10 pe-3 ps-7" : "h-11 px-3",
      "before:absolute before:inset-y-2 before:end-0 before:w-1 before:rounded-full before:transition-all",
      active
        ? "bg-[var(--app-primary-soft)] font-semibold text-[var(--app-on-primary-container)] before:bg-[var(--app-primary)]"
        : "text-[var(--app-text-secondary)] before:bg-transparent hover:bg-[var(--app-background)] hover:text-[var(--app-heading)]",
    ].join(" ")

  return (
    <Sidebar
      side="right"
      collapsible="icon"
      dir="rtl"
      className="border-l-0"
    >
      <SidebarHeader className="border-b border-[var(--app-divider)] bg-[var(--app-surface)] px-3 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip={uiText.app.name}
              onClick={() => handleNavigate("/dashboard")}
              className="h-14 rounded-2xl px-2 transition-colors hover:bg-[var(--app-background)]"
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-primary-active)] text-[var(--app-on-primary)] shadow-[var(--app-shadow-brand)]">
                <ShieldCheck className="size-5" />
              </div>

              <div className="grid min-w-0 flex-1 text-start leading-tight">
                <span className="truncate text-sm font-bold text-[var(--app-heading)]">
                  {uiText.app.name}
                </span>
                <span className="mt-1 truncate text-[11px] text-[var(--app-text-secondary)]">
                  {uiText.app.tagline}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="bg-[var(--app-surface)] px-2 py-3">
        <SidebarMenu className="gap-1">
          {topLevelRoutes.map((route) => {
            const Icon = route.icon ?? LayoutDashboard
            const active = isMenuRouteActive(route.path, location.pathname)

            return (
              <SidebarMenuItem key={route.id}>
                <SidebarMenuButton
                  tooltip={route.label}
                  isActive={active}
                  onClick={() => handleNavigate(route.path)}
                  className={routeButtonClass(active)}
                >
                  <Icon
                    className={
                      active
                        ? "text-[var(--app-primary)]"
                        : "text-[var(--app-icon-muted)]"
                    }
                  />
                  <span>{route.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>

        <div className="my-3 h-px bg-[var(--app-divider)]" />

        {groups.map(({ group, label, routes }) => {
          const GroupIcon = groupIcons[group]
          const open = openGroups[group]
          const groupIsActive = routes.some((route) =>
            isMenuRouteActive(route.path, location.pathname),
          )

          if (isCollapsed) {
            return (
              <div key={group} className="mb-1">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <button
                        type="button"
                        className={[
                          "mx-auto grid size-9 place-items-center rounded-xl transition-colors",
                          groupIsActive
                            ? "bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
                            : "text-[var(--app-icon-muted)] hover:bg-[var(--app-background)] hover:text-[var(--app-primary)]",
                        ].join(" ")}
                        aria-label={label}
                        title={label}
                      />
                    }
                  >
                    <GroupIcon className="size-4" />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    side="left"
                    align="start"
                    className="w-56 rounded-2xl border-[var(--app-divider)] p-2"
                    dir="rtl"
                  >
                    {routes.map((route) => {
                      const Icon = route.icon
                      const active = isMenuRouteActive(
                        route.path,
                        location.pathname,
                      )

                      return (
                        <DropdownMenuItem
                          key={route.id}
                          onClick={() => handleNavigate(route.path)}
                          className={[
                            "rounded-xl",
                            active
                              ? "bg-[var(--app-primary-soft)] font-semibold text-[var(--app-on-primary-container)]"
                              : "text-[var(--app-primary-alt)]",
                          ].join(" ")}
                        >
                          <Icon
                            className={
                              active
                                ? "text-[var(--app-primary)]"
                                : "text-[var(--app-icon-muted)]"
                            }
                          />
                          {route.label}
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )
          }

          return (
            <section
              key={group}
              className="mb-1 overflow-hidden rounded-2xl"
            >
              <button
                type="button"
                onClick={() => toggleGroup(group)}
                className={[
                  "flex h-11 w-full items-center gap-2 rounded-xl px-3 text-start transition-colors",
                  groupIsActive
                    ? "bg-[var(--app-background)] text-[var(--app-on-primary-container)]"
                    : "text-[var(--app-primary-alt)] hover:bg-[var(--app-background)] hover:text-[var(--app-heading)]",
                ].join(" ")}
                aria-expanded={open}
              >
                <GroupIcon
                  className={[
                    "size-4 shrink-0",
                    groupIsActive
                      ? "text-[var(--app-primary)]"
                      : "text-[var(--app-icon-muted)]",
                  ].join(" ")}
                />

                <span className="flex-1 text-sm font-bold">{label}</span>

                <ChevronDown
                  className={[
                    "size-4 shrink-0 text-[var(--app-icon-muted)] transition-transform duration-200",
                    open ? "rotate-180" : "",
                  ].join(" ")}
                />
              </button>

              <div
                className={[
                  "grid transition-[grid-template-rows,opacity] duration-200",
                  open
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0",
                ].join(" ")}
              >
                <div className="overflow-hidden">
                  <SidebarMenu className="gap-1 pb-2 pt-1">
                    {routes.map((route) => {
                      const Icon = route.icon
                      const active = isMenuRouteActive(
                        route.path,
                        location.pathname,
                      )

                      return (
                        <SidebarMenuItem key={route.id}>
                          <SidebarMenuButton
                            tooltip={route.label}
                            isActive={active}
                            onClick={() => handleNavigate(route.path)}
                            className={routeButtonClass(active, true)}
                          >
                            <Icon
                              className={
                                active
                                  ? "text-[var(--app-primary)]"
                                  : "text-[var(--app-icon-muted)]"
                              }
                            />
                            <span>{route.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </div>
              </div>
            </section>
          )
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-[var(--app-divider)] bg-[var(--app-surface)] p-3">
        <button
          type="button"
          onClick={() => handleNavigate("/account/profile")}
          className="flex w-full items-center gap-3 rounded-2xl border border-transparent bg-[var(--app-background)] p-2.5 text-start transition-all duration-200 hover:border-[var(--app-outline)] hover:bg-[var(--app-primary-soft)] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0"
          aria-label={uiText.common.profile}
        >
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--app-primary-soft)] text-sm font-bold text-[var(--app-primary-active)] ring-1 ring-[var(--app-primary)]/10">
            {initial}
          </div>

          <div className="grid min-w-0 flex-1 gap-0.5 group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold text-[var(--app-heading)]">
              {user?.fullName}
            </span>

            <span className="truncate text-[11px] text-[var(--app-primary-alt)]">
              {user?.roleName || user?.role}
            </span>
          </div>
        </button>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
