import { PanelRightClose, PanelRightOpen } from "lucide-react"
import { useMemo, useState } from "react"
import { Link, useLocation } from "react-router-dom"

import { Button } from "@workspace/ui/components/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@workspace/ui/components/sidebar"
import { useSidebar } from "@workspace/ui/hooks/use-sidebar"

import {
  getNavigationItems,
} from "@/app/navigation/navigationConfig"
import { isMenuRouteActive } from "@/app/navigation/routeNavigation"
import { uiText } from "@/config/uiText"
import { useAuthStore } from "@/store/authStore"

import { SidebarNavigationItem } from "./SidebarNavigationItem"

function isNavigationItemActive(item: ReturnType<typeof getNavigationItems>[number], pathname: string) {
  if (item.kind === "link") return isMenuRouteActive(item.route.path, pathname)
  return item.sections.some((section) =>
    section.routes.some((route) => isMenuRouteActive(route.path, pathname)),
  )
}

export function AppSidebar() {
  const user = useAuthStore((state) => state.user)
  const location = useLocation()
  const { state, isMobile, setOpen, setOpenMobile, toggleSidebar } = useSidebar()
  const items = useMemo(() => getNavigationItems(user), [user])
  const [openAreaId, setOpenAreaId] = useState<string | null>(() =>
    items.find((item) => item.kind === "flyout" && isNavigationItemActive(item, location.pathname))?.id ?? null,
  )

  const closeMobileAfterNavigate = () => {
    setOpenMobile(false)
  }

  const toggleArea = (id: string) => {
    if (!isMobile && state === "collapsed") setOpen(true)
    setOpenAreaId((current) => current === id ? null : id)
  }

  return (
    <Sidebar side="right" collapsible="icon" dir="rtl" className="z-40 border-[var(--app-divider)] bg-[var(--app-surface)]">
        <SidebarHeader className="border-b border-[var(--app-divider)] p-3">
          <div className="flex min-h-12 items-center gap-3 overflow-hidden rounded-xl px-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--app-primary)] text-base font-black text-[var(--app-on-primary)] shadow-[var(--app-shadow-brand)]">ن</span>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-black text-[var(--app-heading)]">مرکز عملیات نشانه</p>
              <p className="mt-0.5 truncate text-xs text-[var(--app-text-secondary)]">{uiText.app.workspaceSubtitle}</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
            <SidebarGroup className="p-3">
              <SidebarGroupContent>
                <SidebarMenu className="gap-1.5">
                  {items.map((item) => {
                    const open = item.kind === "flyout" && openAreaId === item.id
                    return (
                      <SidebarNavigationItem
                        key={item.id}
                        item={item}
                        active={isNavigationItemActive(item, location.pathname)}
                        open={open}
                        onClick={item.kind === "flyout" ? () => toggleArea(item.id) : isMobile ? closeMobileAfterNavigate : undefined}
                      >
                        {item.kind === "flyout" && open ? (
                          <SidebarMenuSub className="mt-1 gap-1 group-data-[collapsible=icon]:hidden">
                            {item.sections.flatMap((section) => [
                              <SidebarMenuSubItem key={`${section.id}-label`} className="px-2 pb-1 pt-3 text-xs font-black text-[var(--app-text-secondary)] first:pt-1">
                                {section.label}
                              </SidebarMenuSubItem>,
                              ...section.routes.map((route) => {
                                const Icon = route.icon
                                const active = isMenuRouteActive(route.path, location.pathname)
                                return (
                                  <SidebarMenuSubItem key={route.id}>
                                    <SidebarMenuSubButton
                                      render={<Link to={route.path} onClick={isMobile ? closeMobileAfterNavigate : undefined} />}
                                      isActive={active}
                                      className="h-9 gap-2 rounded-lg px-2.5"
                                      aria-current={active ? "page" : undefined}
                                    >
                                      <Icon className="size-4" aria-hidden="true" />
                                      <span>{route.label}</span>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                )
                              }),
                            ])}
                          </SidebarMenuSub>
                        ) : null}
                      </SidebarNavigationItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
        </SidebarContent>

        <SidebarSeparator />
        <SidebarFooter className="p-3">
          <Button
            type="button"
            variant="ghost"
            onClick={toggleSidebar}
            className="h-11 w-full justify-start gap-3 rounded-xl group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            aria-label={state === "expanded" ? "جمع‌کردن نوار کناری" : "بازکردن نوار کناری"}
          >
            {state === "expanded" ? <PanelRightClose className="size-4" /> : <PanelRightOpen className="size-4" />}
            <span className="group-data-[collapsible=icon]:hidden">{state === "expanded" ? "جمع‌کردن منو" : "بازکردن منو"}</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
  )
}
