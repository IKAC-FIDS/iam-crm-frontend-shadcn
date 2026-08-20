import { useLocation, useNavigate } from "react-router-dom"
import { ShieldCheck } from "lucide-react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@workspace/ui/components/sidebar"
import { uiText } from "@/config/uiText"
import { useAuthStore } from "@/store/authStore"
import { getVisibleMenuGroups, isMenuRouteActive } from "@/app/navigation/routeNavigation"

export function AppSidebar() {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const location = useLocation()
  const groups = getVisibleMenuGroups(user)

  return (
    <Sidebar side="right" collapsible="icon" dir="rtl">
      <SidebarHeader className="border-b border-[#E4EAF3] p-3">
        <SidebarMenu><SidebarMenuItem><SidebarMenuButton size="lg" tooltip={uiText.app.name} onClick={() => navigate("/dashboard")} className="h-12">
          <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#0053B2] text-white"><ShieldCheck className="size-4" /></div>
          <div className="grid min-w-0 flex-1 text-start leading-tight"><span className="truncate font-bold text-[#0F172A]">{uiText.app.name}</span><span className="truncate text-xs text-[#64748B]">{uiText.app.tagline}</span></div>
        </SidebarMenuButton></SidebarMenuItem></SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="py-2">
        {groups.map(({ group, routes }) => (
          <SidebarGroup key={group}>
            <SidebarGroupLabel>{group}</SidebarGroupLabel>
            <SidebarGroupContent><SidebarMenu>
              {routes.map((route) => { const Icon = route.icon; const active = isMenuRouteActive(route.path, location.pathname); return (
                <SidebarMenuItem key={route.id}><SidebarMenuButton tooltip={route.label} isActive={active} onClick={() => navigate(route.path)} className={active ? "bg-[#D6E3FF] text-[#003F88] hover:bg-[#D6E3FF] hover:text-[#003F88]" : "text-[#55677F] hover:bg-[#EFF5FA] hover:text-[#0F172A]"}><Icon /><span>{route.label}</span></SidebarMenuButton></SidebarMenuItem>
              )})}
            </SidebarMenu></SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-[#E4EAF3] p-3"><div className="grid min-w-0 gap-0.5 px-2 py-1 group-data-[collapsible=icon]:hidden"><span className="truncate text-sm font-medium text-[#0F172A]">{user?.fullName}</span><span className="truncate text-xs text-[#64748B]">{user?.roleName || user?.role}</span></div></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
