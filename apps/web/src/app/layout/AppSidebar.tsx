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

import { uiText } from "@/config/uiText"
import { useAuthStore } from "@/store/authStore"
import {
  getVisibleMenuGroups,
  isMenuRouteActive,
} from "@/app/navigation/routeNavigation"

export function AppSidebar() {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const location = useLocation()

  const groups = getVisibleMenuGroups(user)

  const initial = user?.fullName?.trim().charAt(0) || "U"

  return (
    <Sidebar
      side="right"
      collapsible="icon"
      dir="rtl"
      className="border-l-0"
    >
      <SidebarHeader className="border-b border-[#E4EAF3]/80 px-3 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip={uiText.app.name}
              onClick={() => navigate("/dashboard")}
              className="h-14 rounded-2xl px-2 hover:bg-[#EFF5FA]"
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#0053B2] to-[#003F88] text-white shadow-[0_8px_20px_rgba(0,83,178,0.22)]">
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

      <SidebarContent className="px-1 py-3">
        {groups.map(({ group, routes }) => (
          <SidebarGroup key={group} className="py-2">
            <SidebarGroupLabel className="mb-1 px-3 text-[11px] font-semibold tracking-wide text-[#64748B]">
              {group}
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {routes.map((route) => {
                  const Icon = route.icon
                  const active = isMenuRouteActive(
                    route.path,
                    location.pathname
                  )

                  return (
                    <SidebarMenuItem key={route.id}>
                      <SidebarMenuButton
                        tooltip={route.label}
                        isActive={active}
                        onClick={() => navigate(route.path)}
                        className={[
                          "relative h-10 rounded-xl px-3 text-[13px] transition-all duration-200",
                          active
                            ? "bg-[#D6E3FF] font-semibold text-[#003F88] shadow-[inset_-3px_0_0_#0053B2]"
                            : "text-[#55677F] hover:bg-[#EFF5FA] hover:text-[#0F172A]",
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
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-[#E4EAF3]/80 p-3">
        <div className="flex items-center gap-3 rounded-2xl bg-[#EFF5FA]/70 p-2.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0">
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[#D6E3FF] text-sm font-bold text-[#003F88]">
            {initial}
          </div>

          <div className="grid min-w-0 flex-1 gap-0.5 group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold text-[#0F172A]">
              {user?.fullName}
            </span>

            <span className="truncate text-[11px] text-[#64748B]">
              {user?.roleName || user?.role}
            </span>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}