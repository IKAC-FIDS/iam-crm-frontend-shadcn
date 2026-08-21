import { CheckCircle2, Loader2, XCircle } from "lucide-react"
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

import { useCancelMeeting, useCompleteMeeting } from "../hooks/useMeetings"
import type { Meeting } from "../types/meeting.types"

export function MeetingStatusActionDialog({
  meeting,
  action,
  open,
  onOpenChange,
}: {
  meeting: Meeting
  action: "complete" | "cancel"
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const text = uiText.meetings
  const [note, setNote] = useState("")
  const complete = useCompleteMeeting()
  const cancel = useCancelMeeting()
  const pending = complete.isPending || cancel.isPending
  const isCancel = action === "cancel"
  useEffect(() => {
    if (open) setNote("")
  }, [action, meeting.id, open])

  async function submit() {
    try {
      if (isCancel) await cancel.mutateAsync({ id: meeting.id, reason: note })
      else await complete.mutateAsync({ id: meeting.id, note })
      toast.success(
        isCancel ? text.feedback.cancelled : text.feedback.completed
      )
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
          <div
            className={`mb-3 grid size-11 place-items-center rounded-2xl ${
              isCancel
                ? "bg-[var(--destructive-soft)] text-[var(--destructive)]"
                : "bg-[var(--success-light)] text-[var(--success)]"
            }`}
          >
            {isCancel ? (
              <XCircle className="size-5" />
            ) : (
              <CheckCircle2 className="size-5" />
            )}
          </div>
          <DialogTitle>
            {isCancel ? text.dialogs.cancelTitle : text.dialogs.completeTitle}
          </DialogTitle>
          <DialogDescription>
            {isCancel
              ? text.dialogs.cancelDescription
              : text.dialogs.completeDescription}
          </DialogDescription>
        </DialogHeader>
        <div className="px-5 pb-5">
          <textarea
            rows={4}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={text.placeholders.optionalNote}
            className="w-full rounded-xl border border-input bg-transparent p-3 text-sm"
          />
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-[var(--app-divider)] bg-[var(--app-background)]/55 p-4 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            className="rounded-xl"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            {uiText.common.cancel}
          </Button>
          <Button
            className={`rounded-xl ${isCancel ? "bg-[var(--destructive)]" : "bg-[var(--success)]"}`}
            disabled={pending}
            onClick={() => void submit()}
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {isCancel ? text.actions.cancel : text.actions.complete}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
