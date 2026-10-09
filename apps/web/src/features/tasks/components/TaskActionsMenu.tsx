import {
  CalendarClock,
  CheckCircle2,
  Pencil,
  RefreshCcw,
  Trash2,
  UserRoundCog,
  Eye,
} from "lucide-react"
import { EntityRowActions } from "@/components/shared/EntityRowActions"
import { uiText } from "@/config/uiText"
import type { Task } from "../types/task.types"
export type TaskDialogAction =
  "status" | "assign" | "subtask" | "complete" | "reschedule" | "delete"
export function TaskActionsMenu({
  task,
  canUpdate,
  canAssign,
  canComplete,
  canDelete,
  onView,
  onEdit,
  onAction,
}: {
  task: Task
  canUpdate: boolean
  canAssign: boolean
  canComplete: boolean
  canDelete: boolean
  onView?: () => void
  onEdit: () => void
  onAction: (action: TaskDialogAction) => void
}) {
  const text = uiText.tasks.actions
  const closed = task.status === "DONE" || task.status === "CANCELLED"
  return (
    <EntityRowActions
      actions={[
        {
          id: "view",
          label: uiText.common.view,
          icon: Eye,
          onClick: () => onView?.(),
          enabled: Boolean(onView),
        },
        {
          id: "edit",
          label: text.edit,
          icon: Pencil,
          onClick: onEdit,
          enabled: canUpdate,
        },
        {
          id: "status",
          label: text.changeStatus,
          icon: RefreshCcw,
          onClick: () => onAction("status"),
          enabled: canUpdate,
        },
        {
          id: "assign",
          label: text.assign,
          icon: UserRoundCog,
          onClick: () => onAction("assign"),
          enabled: canAssign,
        },
        {
          id: "complete",
          label: text.complete,
          icon: CheckCircle2,
          onClick: () => onAction("complete"),
          enabled: canComplete && !closed,
        },
        {
          id: "reschedule",
          label: text.reschedule,
          icon: CalendarClock,
          onClick: () => onAction("reschedule"),
          enabled: canUpdate && !closed,
        },
        {
          id: "delete",
          label: text.delete,
          icon: Trash2,
          onClick: () => onAction("delete"),
          enabled: canDelete,
          tone: "danger",
        },
      ]}
    />
  )
}
