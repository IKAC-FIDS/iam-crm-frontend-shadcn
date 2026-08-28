import { X } from "lucide-react"
import { useState } from "react"

import { uiText } from "@/config/uiText"
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"

import { PERSON_SOCIAL_PLATFORM_OPTIONS } from "../constants/personOptions"
import type { PersonSocial, PersonSocialPayload, PersonSocialPlatform } from "../types/person.types"
import { getPeopleErrorMessage } from "../utils/peopleError"

export function PersonSocialDialog({ open, onOpenChange, social, isPending, error, onSubmit }: {
  open: boolean; onOpenChange: (open: boolean) => void; social?: PersonSocial | null; isPending: boolean; error?: unknown; onSubmit: (payload: PersonSocialPayload) => Promise<void>
}) {
  const text = uiText.people.socialIdentity
  const [platform, setPlatform] = useState<PersonSocialPlatform>("LINKEDIN")
  const [handle, setHandle] = useState("")
  const [note, setNote] = useState("")
  const [isPrimary, setIsPrimary] = useState(false)
  const resetInputs0 = [open, social] as const
  const [previousResetInputs0, setPreviousResetInputs0] = useState<typeof resetInputs0 | null>(null)
  if (previousResetInputs0 === null || previousResetInputs0[0] !== resetInputs0[0] || previousResetInputs0[1] !== resetInputs0[1]) {
    setPreviousResetInputs0(resetInputs0)
    if (open) { setPlatform(PERSON_SOCIAL_PLATFORM_OPTIONS.some((option) => option.value === social?.platform) ? social?.platform as PersonSocialPlatform : "LINKEDIN"); setHandle(social?.handle || ""); setNote(social?.note || ""); setIsPrimary(Boolean(social?.isPrimary)) }
  }
  async function submit(event: React.FormEvent) { event.preventDefault(); if (handle.trim()) await onSubmit({ platform, handle: handle.trim(), note: note.trim() || undefined, isPrimary }) }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent showCloseButton={false} dir="rtl" className="max-w-lg gap-0 rounded-[26px] border-[var(--app-divider)] bg-[var(--app-surface)] p-0"><DialogHeader className="flex-row items-center justify-between border-b border-[var(--app-divider)] p-5"><DialogTitle>{social ? text.edit : text.add}</DialogTitle><Button type="button" variant="ghost" size="icon" className="rounded-xl" aria-label={uiText.people.actions.close} onClick={() => onOpenChange(false)}><X className="size-4" /></Button></DialogHeader><form onSubmit={submit} className="grid gap-4 p-5">
    <Field label={text.platform}><select value={platform} onChange={(event) => setPlatform(event.target.value as PersonSocialPlatform)} className="h-11 rounded-xl border border-input bg-background px-3 text-sm">{PERSON_SOCIAL_PLATFORM_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
    <Field label={text.handle}><Input dir="auto" value={handle} onChange={(event) => setHandle(event.target.value)} className="h-11 rounded-xl" /></Field>
    <Field label={text.note}><textarea value={note} onChange={(event) => setNote(event.target.value)} className="min-h-24 rounded-xl border border-input bg-background p-3 text-sm" /></Field>
    <label className="flex items-center gap-2 text-sm text-[var(--app-heading)]"><input type="checkbox" checked={isPrimary} onChange={(event) => setIsPrimary(event.target.checked)} />{text.primary}</label>
    {error ? <InlineError message={getPeopleErrorMessage(error, uiText.people.nested.mutationError)} /> : null}
    <div className="flex justify-end gap-2 border-t border-[var(--app-divider)] pt-4"><Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>{uiText.common.cancel}</Button><Button type="submit" disabled={isPending || !handle.trim()} className="rounded-xl bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)]">{isPending ? uiText.common.processing : uiText.people.actions.save}</Button></div>
  </form></DialogContent></Dialog>
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-2"><span className="text-xs font-bold text-[var(--app-heading)]">{label}</span>{children}</label> }
function InlineError({ message }: { message: string }) { return <p className="rounded-xl bg-[var(--destructive)]/5 p-3 text-xs text-[var(--destructive)]">{message}</p> }
