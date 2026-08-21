import {
  CalendarClock,
  CheckCircle2,
  MoreHorizontal,
  Pencil,
  RefreshCcw,
  Trash2,
  UserRoundCog,
} from "lucide-react"

import { uiText } from "@/config/uiText"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

import type { Task } from "../types/task.types"

export type TaskDialogAction =
  | "status"
  | "assign"
  | "complete"
  | "reschedule"
  | "delete"

export function TaskActionsMenu({
  task,
  canUpdate,
  canAssign,
  canComplete,
  canDelete,
  onEdit,
  onAction,
}: {
  task: Task
  canUpdate: boolean
  canAssign: boolean
  canComplete: boolean
  canDelete: boolean
  onEdit: () => void
  onAction: (action: TaskDialogAction) => void
}) {
  const text = uiText.tasks.actions
  const closed = task.status === "DONE" || task.status === "CANCELLED"

  if (!canUpdate && !canAssign && !canComplete && !canDelete) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
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
        {canUpdate ? (
          <DropdownMenuItem
            onClick={() => onAction("status")}
            className="gap-2 rounded-lg"
          >
            <RefreshCcw className="size-4" />
            {text.changeStatus}
          </DropdownMenuItem>
        ) : null}
        {canAssign ? (
          <DropdownMenuItem
            onClick={() => onAction("assign")}
            className="gap-2 rounded-lg"
          >
            <UserRoundCog className="size-4" />
            {text.assign}
          </DropdownMenuItem>
        ) : null}
        {canComplete && !closed ? (
          <DropdownMenuItem
            onClick={() => onAction("complete")}
            className="gap-2 rounded-lg text-[var(--success)]"
          >
            <CheckCircle2 className="size-4" />
            {text.complete}
          </DropdownMenuItem>
        ) : null}
        {canUpdate && !closed ? (
          <DropdownMenuItem
            onClick={() => onAction("reschedule")}
            className="gap-2 rounded-lg"
          >
            <CalendarClock className="size-4" />
            {text.reschedule}
          </DropdownMenuItem>
        ) : null}
        {canDelete ? (
          <DropdownMenuItem
            onClick={() => onAction("delete")}
            className="gap-2 rounded-lg text-[var(--destructive)]"
          >
            <Trash2 className="size-4" />
            {text.delete}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
