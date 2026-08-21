import { CheckCircle2, MoreHorizontal, Pencil, XCircle } from "lucide-react"

import { uiText } from "@/config/uiText"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

import type { Meeting } from "../types/meeting.types"

export function MeetingActionsMenu({
  meeting,
  canUpdate,
  canComplete,
  canCancel,
  onEdit,
  onComplete,
  onCancel,
}: {
  meeting: Meeting
  canUpdate: boolean
  canComplete: boolean
  canCancel: boolean
  onEdit: () => void
  onComplete: () => void
  onCancel: () => void
}) {
  if (meeting.status !== "SCHEDULED") return null
  if (!canUpdate && !canComplete && !canCancel) return null
  const text = uiText.meetings.actions
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8 rounded-xl"
            aria-label={text.more}
            onClick={(event) => event.stopPropagation()}
          />
        }
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        dir="rtl"
        className="w-52 rounded-xl p-1.5"
      >
        {canUpdate ? (
          <DropdownMenuItem onClick={onEdit} className="gap-2 rounded-lg">
            <Pencil className="size-4" />
            {text.edit}
          </DropdownMenuItem>
        ) : null}
        {canComplete ? (
          <DropdownMenuItem
            onClick={onComplete}
            className="gap-2 rounded-lg text-[var(--success)]"
          >
            <CheckCircle2 className="size-4" />
            {text.complete}
          </DropdownMenuItem>
        ) : null}
        {canCancel ? (
          <DropdownMenuItem
            onClick={onCancel}
            className="gap-2 rounded-lg text-[var(--destructive)]"
          >
            <XCircle className="size-4" />
            {text.cancel}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
