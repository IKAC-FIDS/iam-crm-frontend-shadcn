import { useLocation, useNavigate } from "react-router-dom"
import { ShieldCheck } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@workspace/ui/components/sidebar"

import {
  getVisibleMenuGroups,
  isMenuRouteActive,
} from "@/app/navigation/routeNavigation"
import { uiText } from "@/config/uiText"
import { useAuthStore } from "@/store/authStore"

export function AppSidebar() {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const location = useLocation()

  const groups = getVisibleMenuGroups(user)
  const initial =
    user?.fullName?.trim().charAt(0) || uiText.common.fallbackUserInitial

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
              onClick={() => navigate("/dashboard")}
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
        {groups.map(({ group, label, routes }) => (
          <SidebarGroup key={group} className="py-2">
            <SidebarGroupLabel className="mb-1.5 px-3 text-[11px] font-bold tracking-wide text-[#55677F]">
              {label}
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
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
                        onClick={() => navigate(route.path)}
                        className={[
                          "relative h-10 rounded-xl px-3 text-[13px] transition-all duration-200",
                          "before:absolute before:inset-y-2 before:end-0 before:w-1 before:rounded-full before:transition-all before:duration-200",
                          active
                            ? "bg-[#D6E3FF] font-semibold text-[#001B3D] shadow-[0_1px_2px_rgba(15,23,42,0.04)] before:bg-[#0053B2]"
                            : "text-[#64748B] before:bg-transparent hover:bg-[#EFF5FA] hover:text-[#0F172A] hover:before:bg-[#C2CAD6]",
                        ].join(" ")}
                      >
                        <Icon
                          className={[
                            "transition-colors duration-200",
                            active
                              ? "text-[#0053B2]"
                              : "text-[#64748B] group-hover/menu-button:text-[#0053B2]",
                          ].join(" ")}
                        />

                        <span>{route.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-[#E4EAF3] bg-[#FCFCFF] p-3">
        <button
          type="button"
          onClick={() => navigate("/account/profile")}
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
