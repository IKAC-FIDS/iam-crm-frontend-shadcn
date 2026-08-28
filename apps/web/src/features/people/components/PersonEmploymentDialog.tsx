import { X } from "lucide-react"
import { useState } from "react"

import { uiText } from "@/config/uiText"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"

import type { EmploymentHistory, EmploymentHistoryPayload } from "../types/person.types"
import { SearchableCompanySelect } from "./SearchableCompanySelect"

export function PersonEmploymentDialog({ open, onOpenChange, employment, isPending, error, onSubmit }: { open: boolean; onOpenChange: (open: boolean) => void; employment?: EmploymentHistory | null; isPending: boolean; error?: unknown; onSubmit: (payload: EmploymentHistoryPayload) => Promise<void> }) {
  const text = uiText.people.career
  const [companyId, setCompanyId] = useState("")
  const [description, setDescription] = useState("")
  const resetInputs0 = [employment, open] as const
  const [previousResetInputs0, setPreviousResetInputs0] = useState<typeof resetInputs0 | null>(null)
  if (previousResetInputs0 === null || previousResetInputs0[0] !== resetInputs0[0] || previousResetInputs0[1] !== resetInputs0[1]) {
    setPreviousResetInputs0(resetInputs0)
    if (open) { setCompanyId(employment?.companyId || employment?.company?.id || ""); setDescription(employment?.description || "") }
  }
  async function submit(event: React.FormEvent) { event.preventDefault(); if (companyId) await onSubmit({ companyId, description: description.trim() || undefined }) }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent showCloseButton={false} dir="rtl" className="max-w-lg gap-0 rounded-[26px] border-[var(--app-divider)] bg-[var(--app-surface)] p-0"><DialogHeader className="flex-row items-center justify-between border-b border-[var(--app-divider)] p-5"><DialogTitle>{employment ? text.editEmployment : text.addEmployment}</DialogTitle><Button type="button" variant="ghost" size="icon" className="rounded-xl" aria-label={uiText.people.actions.close} onClick={() => onOpenChange(false)}><X className="size-4" /></Button></DialogHeader><form onSubmit={submit} className="grid gap-4 p-5"><label className="grid gap-2"><span className="text-xs font-bold">{uiText.people.fields.company}</span><SearchableCompanySelect value={companyId || undefined} onChange={(value) => setCompanyId(value || "")} allowEmpty={false} /></label><label className="grid gap-2"><span className="text-xs font-bold">{text.companyDescription}</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-28 rounded-xl border border-input bg-background p-3 text-sm" /></label>{error ? <p className="rounded-xl bg-[var(--destructive)]/5 p-3 text-xs text-[var(--destructive)]">{getApiErrorMessage(error, uiText.people.nested.mutationError)}</p> : null}<div className="flex justify-end gap-2 border-t border-[var(--app-divider)] pt-4"><Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>{uiText.common.cancel}</Button><Button type="submit" disabled={isPending || !companyId} className="rounded-xl bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)]">{isPending ? uiText.common.processing : uiText.people.actions.save}</Button></div></form></DialogContent></Dialog>
}
