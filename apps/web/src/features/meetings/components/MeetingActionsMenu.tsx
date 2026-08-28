import { CheckCircle2, Pencil, XCircle, Eye } from "lucide-react"
import { EntityRowActions } from "@/components/shared/EntityRowActions"
import { uiText } from "@/config/uiText"
import type { Meeting } from "../types/meeting.types"
export function MeetingActionsMenu({
  meeting,
  canUpdate,
  canComplete,
  canCancel,
  onView,
  onEdit,
  onComplete,
  onCancel,
}: {
  meeting: Meeting
  canUpdate: boolean
  canComplete: boolean
  canCancel: boolean
  onView?: () => void
  onEdit: () => void
  onComplete: () => void
  onCancel: () => void
}) {
  const text = uiText.meetings.actions
  const active = meeting.status === "SCHEDULED"
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
          enabled: active && canUpdate,
        },
        {
          id: "complete",
          label: text.complete,
          icon: CheckCircle2,
          onClick: onComplete,
          enabled: active && canComplete,
        },
        {
          id: "cancel",
          label: text.cancel,
          icon: XCircle,
          onClick: onCancel,
          enabled: active && canCancel,
          tone: "danger",
        },
      ]}
    />
  )
}
