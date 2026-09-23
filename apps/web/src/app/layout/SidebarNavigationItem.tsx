import { ChevronLeft } from "lucide-react"
import { forwardRef } from "react"
import { Link } from "react-router-dom"

import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"
import { cn } from "@workspace/ui/lib/utils"

import type { NavigationItem } from "@/app/navigation/navigationConfig"

interface SidebarNavigationItemProps {
  item: NavigationItem
  active: boolean
  open?: boolean
  onClick?: () => void
}

export const SidebarNavigationItem = forwardRef<HTMLButtonElement, SidebarNavigationItemProps>(
  function SidebarNavigationItem({ item, active, open, onClick }, ref) {
    const Icon = item.icon
    const commonClass = cn(
      "h-12 rounded-xl px-3 text-sm font-bold",
      "group-data-[collapsible=icon]:size-11! group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:justify-center",
      active && "bg-[var(--app-primary-soft)] text-[var(--app-primary)]",
    )
    const content = (
      <>
        <Icon className="size-[1.15rem]!" aria-hidden="true" />
        <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
        {item.kind === "flyout" ? (
          <ChevronLeft className={cn("ms-auto size-3.5 transition-transform group-data-[collapsible=icon]:hidden", open && "-rotate-90")} aria-hidden="true" />
        ) : null}
      </>
    )

    return (
      <SidebarMenuItem>
        {item.kind === "link" ? (
          <SidebarMenuButton
            render={<Link to={item.route.path} />}
            isActive={active}
            tooltip={{ children: item.label, side: "left" }}
            className={commonClass}
            aria-current={active ? "page" : undefined}
            onClick={onClick}
          >
            {content}
          </SidebarMenuButton>
        ) : (
          <SidebarMenuButton
            ref={ref}
            type="button"
            isActive={active || open}
            tooltip={{ children: item.label, side: "left" }}
            className={commonClass}
            aria-expanded={open}
            aria-haspopup="dialog"
            onClick={onClick}
          >
            {content}
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    )
  },
)
