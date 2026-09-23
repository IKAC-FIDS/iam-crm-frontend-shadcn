import { ChevronRight, PanelRightClose, PanelRightOpen } from "lucide-react"
import { useCallback, useMemo, useRef, useState } from "react"
import { useLocation } from "react-router-dom"

import { Button } from "@workspace/ui/components/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarSeparator,
} from "@workspace/ui/components/sidebar"
import { useSidebar } from "@workspace/ui/hooks/use-sidebar"

import {
  getNavigationItems,
  type NavigationFlyoutItem,
} from "@/app/navigation/navigationConfig"
import { isMenuRouteActive } from "@/app/navigation/routeNavigation"
import { uiText } from "@/config/uiText"
import { useAuthStore } from "@/store/authStore"

import { NavigationFlyout } from "./NavigationFlyout"
import { NavigationGroup } from "./NavigationGroup"
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
  const { state, isMobile, setOpenMobile, toggleSidebar } = useSidebar()
  const items = useMemo(() => getNavigationItems(user), [user])
  const [openFlyoutId, setOpenFlyoutId] = useState<string | null>(null)
  const [mobileAreaId, setMobileAreaId] = useState<string | null>(null)
  const anchorRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const openFlyout = items.find(
    (item): item is NavigationFlyoutItem => item.kind === "flyout" && item.id === openFlyoutId,
  )
  const mobileArea = items.find(
    (item): item is NavigationFlyoutItem => item.kind === "flyout" && item.id === mobileAreaId,
  )

  const selectArea = (item: NavigationFlyoutItem) => {
    if (isMobile) {
      setMobileAreaId(item.id)
      return
    }
    setOpenFlyoutId((current) => current === item.id ? null : item.id)
  }

  const closeMobileAfterNavigate = () => {
    setMobileAreaId(null)
    setOpenMobile(false)
  }
  const closeFlyout = useCallback(() => setOpenFlyoutId(null), [])
  const getOpenFlyoutAnchor = useCallback(
    () => openFlyoutId ? anchorRefs.current[openFlyoutId] : null,
    [openFlyoutId],
  )

  return (
    <>
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
          {isMobile && mobileArea ? (
            <div className="p-3">
              <Button type="button" variant="ghost" onClick={() => setMobileAreaId(null)} className="mb-3 w-full justify-start rounded-xl">
                <ChevronRight className="size-4" aria-hidden="true" />
                بازگشت به منوی اصلی
              </Button>
              <div className="mb-4 rounded-2xl bg-[var(--app-primary-soft)] p-3">
                <p className="font-black text-[var(--app-heading)]">{mobileArea.label}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--app-text-secondary)]">{mobileArea.description}</p>
              </div>
              <div className="grid gap-5">
                {mobileArea.sections.map((section) => (
                  <NavigationGroup key={section.id} section={section} onNavigate={closeMobileAfterNavigate} compact />
                ))}
              </div>
            </div>
          ) : (
            <SidebarGroup className="p-3">
              <SidebarGroupContent>
                <SidebarMenu className="gap-1.5">
                  {items.map((item) => (
                    <SidebarNavigationItem
                      key={item.id}
                      ref={(node) => { if (item.kind === "flyout") anchorRefs.current[item.id] = node }}
                      item={item}
                      active={isNavigationItemActive(item, location.pathname)}
                      open={openFlyoutId === item.id}
                      onClick={item.kind === "flyout" ? () => selectArea(item) : isMobile ? closeMobileAfterNavigate : undefined}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
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

      {!isMobile && openFlyout ? (
        <NavigationFlyout
          key={openFlyout.id}
          item={openFlyout}
          expanded={state === "expanded"}
          onClose={closeFlyout}
          getAnchor={getOpenFlyoutAnchor}
        />
      ) : null}
    </>
  )
}
