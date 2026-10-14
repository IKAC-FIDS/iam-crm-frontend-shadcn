import { CheckCircle2, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { uiText } from "@/config/uiText"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import { useUpdateMeetingOutcome } from "../hooks/useMeetings"
import type { Meeting } from "../types/meeting.types"

export function MeetingOutcomeDialog({
  meeting,
  open,
  onOpenChange,
}: {
  meeting: Meeting
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const text = uiText.meetings
  const [note, setNote] = useState(meeting.completionNote ?? "")
  const updateOutcome = useUpdateMeetingOutcome()

  useEffect(() => {
    if (open) setNote(meeting.completionNote ?? "")
  }, [meeting.id, meeting.completionNote, open])

  async function submit() {
    try {
      await updateOutcome.mutateAsync({ id: meeting.id, note })
      toast.success(text.feedback.outcomeUpdated)
      onOpenChange(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, text.errors.mutation))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        dir="rtl"
        className="max-w-md gap-0 overflow-hidden rounded-[var(--app-radius-feature)] p-0"
      >
        <DialogHeader className="p-5 pb-4">
          <div className="mb-3 grid size-11 place-items-center rounded-2xl bg-[var(--success-light)] text-[var(--success)]">
            <CheckCircle2 className="size-5" />
          </div>
          <DialogTitle>{text.dialogs.outcomeTitle}</DialogTitle>
          <DialogDescription>{text.dialogs.outcomeDescription}</DialogDescription>
        </DialogHeader>
        <div className="px-5 pb-5">
          <textarea
            rows={6}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={text.placeholders.outcome}
            className="w-full rounded-xl border border-input bg-transparent p-3 text-sm"
          />
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-[var(--app-divider)] bg-[var(--app-background)]/55 p-4 sm:flex-row sm:justify-end">
          <Button variant="outline" className="rounded-xl" disabled={updateOutcome.isPending} onClick={() => onOpenChange(false)}>
            {uiText.common.cancel}
          </Button>
          <Button className="rounded-xl bg-[var(--success)]" disabled={updateOutcome.isPending} onClick={() => void submit()}>
            {updateOutcome.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {text.actions.saveOutcome}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
