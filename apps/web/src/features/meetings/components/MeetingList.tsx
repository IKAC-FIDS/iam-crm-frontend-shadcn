import { CalendarDays } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { EmptyState } from "@/components/shared/EmptyState"
import { uiText } from "@/config/uiText"
import { Button } from "@workspace/ui/components/button"

import type { Meeting } from "../types/meeting.types"
import { MeetingEntityCard } from "./MeetingEntityCard"

export function MeetingList({
  meetings,
  canCreate,
  canUpdate,
  canComplete,
  canCancel,
  onCreate,
  onEdit,
  onComplete,
  onCancel,
}: {
  meetings: Meeting[]
  canCreate: boolean
  canUpdate: boolean
  canComplete: boolean
  canCancel: boolean
  onCreate: () => void
  onEdit: (meeting: Meeting) => void
  onComplete: (meeting: Meeting) => void
  onCancel: (meeting: Meeting) => void
}) {
  const text = uiText.meetings
  const navigate = useNavigate()

  if (!meetings.length) {
    return (
      <EmptyState
        icon={CalendarDays}
        title={text.empty.title}
        description={text.empty.description}
        action={canCreate ? <Button className="rounded-xl" onClick={onCreate}>{text.actions.create}</Button> : undefined}
      />
    )
  }

  return (
    <div className="grid gap-2.5">
      {meetings.map((meeting) => (
        <MeetingEntityCard
          key={meeting.id}
          meeting={meeting}
          canUpdate={canUpdate}
          canComplete={canComplete}
          canCancel={canCancel}
          onView={() => navigate(`/meetings/${meeting.id}`)}
          onEdit={() => onEdit(meeting)}
          onComplete={() => onComplete(meeting)}
          onCancel={() => onCancel(meeting)}
        />
      ))}
    </div>
  )
}
