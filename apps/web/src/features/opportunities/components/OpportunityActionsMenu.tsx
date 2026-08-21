import { Archive, Eye, MoreHorizontal, Pencil, RefreshCcw, UserRoundCog, Waypoints } from "lucide-react"

import { uiText } from "@/config/uiText"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

import type { Opportunity } from "../types/opportunity.types"

export interface OpportunityActionPermissions {
  update: boolean
  changeOwner: boolean
  changeStage: boolean
  archive: boolean
  restore: boolean
}

export function OpportunityActionsMenu({
  opportunity,
  permissions,
  onView,
  onEdit,
  onChangeOwner,
  onChangeStage,
  onArchiveToggle,
}: {
  opportunity: Opportunity
  permissions: OpportunityActionPermissions
  onView: () => void
  onEdit: () => void
  onChangeOwner: () => void
  onChangeStage: () => void
  onArchiveToggle: () => void
}) {
  const text = uiText.opportunities.actions
  const active = !opportunity.archivedAt

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg"
            aria-label={text.more}
            onClick={(event) => event.stopPropagation()}
          />
        }
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44 rounded-xl" dir="rtl" onClick={(event) => event.stopPropagation()}>
        <DropdownMenuItem onClick={onView}><Eye />{text.view}</DropdownMenuItem>
        {permissions.update && active ? <DropdownMenuItem onClick={onEdit}><Pencil />{text.edit}</DropdownMenuItem> : null}
        {permissions.changeOwner && active ? <DropdownMenuItem onClick={onChangeOwner}><UserRoundCog />{text.changeOwner}</DropdownMenuItem> : null}
        {permissions.changeStage && active ? <DropdownMenuItem onClick={onChangeStage}><Waypoints />{text.changeStage}</DropdownMenuItem> : null}
        {active && permissions.archive ? <DropdownMenuItem variant="destructive" onClick={onArchiveToggle}><Archive />{text.archive}</DropdownMenuItem> : null}
        {!active && permissions.restore ? <DropdownMenuItem onClick={onArchiveToggle}><RefreshCcw />{text.restore}</DropdownMenuItem> : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

