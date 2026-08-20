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
    if (!activeGroup) {
      return
    }

    setOpenGroups((current) => ({
      ...current,
      [activeGroup]: true,
    }))
  }, [activeGroup])

  const handleNavigate = (path: string) => {
    navigate(path)

    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const toggleGroup = (group: NavigationGroupKey) => {
    setOpenGroups((current) => ({
      ...current,
      [group]: !current[group],
    }))
  }

  const isCollapsed = state === "collapsed" && !isMobile

  return (
    <Sidebar
      side="right"
      collapsible="icon"
      dir="rtl"
      className="border-l-0"
    >
      <SidebarHeader className="border-b border-[#E4EAF3] bg-[#FCFCFF] px-3 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip={uiText.app.name}
              onClick={() => handleNavigate("/dashboard")}
              className="h-14 rounded-2xl px-2 transition-colors hover:bg-[#EFF5FA]"
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#0053B2] to-[#003F88] text-white shadow-[0_8px_20px_rgba(0,83,178,0.20)]">
                <ShieldCheck className="size-5" />
              </div>

              <div className="grid min-w-0 flex-1 text-start leading-tight">
                <span className="truncate text-sm font-bold text-[#0F172A]">
                  {uiText.app.name}
                </span>

                <span className="mt-1 truncate text-[11px] text-[#64748B]">
                  {uiText.app.tagline}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="bg-[#FCFCFF] px-2 py-3">
        <SidebarMenu className="gap-1">
          {topLevelRoutes.map((route) => {
            const Icon = route.icon ?? LayoutDashboard
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
                  className={[
                    "relative h-11 rounded-xl px-3 text-[13px] transition-all duration-200",
                    "before:absolute before:inset-y-2 before:end-0 before:w-1 before:rounded-full before:transition-all",
                    active
                      ? "bg-[#D6E3FF] font-bold text-[#001B3D] before:bg-[#0053B2]"
                      : "font-semibold text-[#55677F] before:bg-transparent hover:bg-[#EFF5FA] hover:text-[#0F172A]",
                  ].join(" ")}
                >
                  <Icon
                    className={
                      active
                        ? "text-[#0053B2]"
                        : "text-[#64748B]"
                    }
                  />
                  <span>{route.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>

        <div className="my-3 h-px bg-[#E4EAF3]" />

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
                            ? "bg-[#D6E3FF] text-[#0053B2]"
                            : "text-[#64748B] hover:bg-[#EFF5FA] hover:text-[#0053B2]",
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
                    className="w-56 rounded-2xl border-[#E4EAF3] p-2"
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
                              ? "bg-[#D6E3FF] font-semibold text-[#001B3D]"
                              : "text-[#55677F]",
                          ].join(" ")}
                        >
                          <Icon
                            className={
                              active
                                ? "text-[#0053B2]"
                                : "text-[#64748B]"
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
                    ? "bg-[#EFF5FA] text-[#001B3D]"
                    : "text-[#55677F] hover:bg-[#EFF5FA] hover:text-[#0F172A]",
                ].join(" ")}
                aria-expanded={open}
              >
                <GroupIcon
                  className={[
                    "size-4 shrink-0",
                    groupIsActive
                      ? "text-[#0053B2]"
                      : "text-[#64748B]",
                  ].join(" ")}
                />

                <span className="flex-1 text-sm font-bold">
                  {label}
                </span>

                <ChevronDown
                  className={[
                    "size-4 shrink-0 text-[#64748B] transition-transform duration-200",
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
                            className={[
                              "relative h-10 rounded-xl pe-3 ps-7 text-[13px] transition-all duration-200",
                              "before:absolute before:inset-y-2 before:end-0 before:w-1 before:rounded-full before:transition-all",
                              active
                                ? "bg-[#D6E3FF] font-semibold text-[#001B3D] before:bg-[#0053B2]"
                                : "text-[#64748B] before:bg-transparent hover:bg-[#EFF5FA] hover:text-[#0F172A]",
                            ].join(" ")}
                          >
                            <Icon
                              className={
                                active
                                  ? "text-[#0053B2]"
                                  : "text-[#64748B]"
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

      <SidebarFooter className="border-t border-[#E4EAF3] bg-[#FCFCFF] p-3">
        <button
          type="button"
          onClick={() => handleNavigate("/account/profile")}
          className="flex w-full items-center gap-3 rounded-2xl border border-transparent bg-[#EFF5FA] p-2.5 text-start transition-all duration-200 hover:border-[#C2CAD6] hover:bg-[#D6E3FF] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0"
          aria-label={uiText.common.profile}
        >
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[#D6E3FF] text-sm font-bold text-[#003F88] ring-1 ring-[#0053B2]/10">
            {initial}
          </div>

          <div className="grid min-w-0 flex-1 gap-0.5 group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold text-[#0F172A]">
              {user?.fullName}
            </span>

            <span className="truncate text-[11px] text-[#55677F]">
              {user?.roleName || user?.role}
            </span>
          </div>
        </button>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
