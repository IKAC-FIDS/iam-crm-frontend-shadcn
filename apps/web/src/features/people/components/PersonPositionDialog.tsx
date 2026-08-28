import { X } from "lucide-react"
import { useMemo, useState } from "react"

import { PersianDatePicker } from "@/components/shared/PersianDatePicker"
import { uiText } from "@/config/uiText"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"

import type { EmploymentPosition, EmploymentPositionPayload } from "../types/person.types"

function toDate(value?: string | null) { if (!value) return undefined; const date = new Date(value); return Number.isNaN(date.getTime()) ? undefined : date }
function toApiDate(value?: Date) { if (!value) return undefined; const year = value.getFullYear(); const month = String(value.getMonth() + 1).padStart(2, "0"); const day = String(value.getDate()).padStart(2, "0"); return `${year}-${month}-${day}` }

export function PersonPositionDialog({ open, onOpenChange, position, isPending, error, onSubmit }: { open: boolean; onOpenChange: (open: boolean) => void; position?: EmploymentPosition | null; isPending: boolean; error?: unknown; onSubmit: (payload: EmploymentPositionPayload) => Promise<void> }) {
  const text = uiText.people.career
  const [title, setTitle] = useState(""); const [startDate, setStartDate] = useState<Date>(); const [endDate, setEndDate] = useState<Date>(); const [isCurrent, setIsCurrent] = useState(false); const [description, setDescription] = useState("")
  const resetInputs0 = [open, position] as const
  const [previousResetInputs0, setPreviousResetInputs0] = useState<typeof resetInputs0 | null>(null)
  if (previousResetInputs0 === null || previousResetInputs0[0] !== resetInputs0[0] || previousResetInputs0[1] !== resetInputs0[1]) {
    setPreviousResetInputs0(resetInputs0)
    if (open) { setTitle(position?.title || ""); setStartDate(toDate(position?.startDate)); setEndDate(toDate(position?.endDate)); setIsCurrent(Boolean(position?.isCurrent)); setDescription(position?.description || "") }
  }
  const dateInvalid = useMemo(() => Boolean(startDate && endDate && endDate < startDate), [endDate, startDate])
  async function submit(event: React.FormEvent) { event.preventDefault(); if (!title.trim() || dateInvalid) return; await onSubmit({ title: title.trim(), startDate: toApiDate(startDate), endDate: isCurrent ? undefined : toApiDate(endDate), isCurrent, description: description.trim() || undefined }) }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent showCloseButton={false} dir="rtl" className="max-h-[90vh] max-w-xl gap-0 overflow-y-auto rounded-[26px] border-[var(--app-divider)] bg-[var(--app-surface)] p-0"><DialogHeader className="flex-row items-center justify-between border-b border-[var(--app-divider)] p-5"><DialogTitle>{position ? text.editPosition : text.addPosition}</DialogTitle><Button type="button" variant="ghost" size="icon" className="rounded-xl" aria-label={uiText.people.actions.close} onClick={() => onOpenChange(false)}><X className="size-4" /></Button></DialogHeader><form onSubmit={submit} className="grid gap-4 p-5"><Field label={text.positionTitle}><Input value={title} onChange={(event) => setTitle(event.target.value)} className="h-11 rounded-xl" /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label={text.startDate}><PersianDatePicker value={startDate} onChange={setStartDate} /></Field><Field label={text.endDate}><PersianDatePicker value={endDate} onChange={setEndDate} minDate={startDate} disabled={isCurrent} /></Field></div><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isCurrent} onChange={(event) => { setIsCurrent(event.target.checked); if (event.target.checked) setEndDate(undefined) }} />{text.currentQuestion}</label>{dateInvalid ? <p className="text-xs text-[var(--destructive)]">{text.dateError}</p> : null}<Field label={text.description}><textarea value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-24 rounded-xl border border-input bg-background p-3 text-sm" /></Field>{error ? <p className="rounded-xl bg-[var(--destructive)]/5 p-3 text-xs text-[var(--destructive)]">{getApiErrorMessage(error, uiText.people.nested.mutationError)}</p> : null}<div className="flex justify-end gap-2 border-t border-[var(--app-divider)] pt-4"><Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>{uiText.common.cancel}</Button><Button type="submit" disabled={isPending || !title.trim() || dateInvalid} className="rounded-xl bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)]">{isPending ? uiText.common.processing : uiText.people.actions.save}</Button></div></form></DialogContent></Dialog>
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-2"><span className="text-xs font-bold">{label}</span>{children}</label> }
