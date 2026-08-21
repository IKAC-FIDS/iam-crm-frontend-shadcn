import { X } from "lucide-react"
import { useEffect, useState } from "react"

import { uiText } from "@/config/uiText"
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"

import { PERSON_CONTACT_TYPE_OPTIONS } from "../constants/personOptions"
import type { PersonContact, PersonContactPayload, PersonContactType } from "../types/person.types"
import { getPeopleErrorMessage } from "../utils/peopleError"

export function PersonContactDialog({ open, onOpenChange, contact, isPending, error, onSubmit }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact?: PersonContact | null
  isPending: boolean
  error?: unknown
  onSubmit: (payload: PersonContactPayload) => Promise<void>
}) {
  const text = uiText.people.contactHub
  const [type, setType] = useState<PersonContactType>("MOBILE")
  const [value, setValue] = useState("")
  const [note, setNote] = useState("")
  const [isPrimary, setIsPrimary] = useState(false)

  useEffect(() => {
    if (!open) return
    setType(PERSON_CONTACT_TYPE_OPTIONS.some((option) => option.value === contact?.type) ? contact?.type as PersonContactType : "MOBILE")
    setValue(contact?.value || "")
    setNote(contact?.note || "")
    setIsPrimary(Boolean(contact?.isPrimary))
  }, [contact, open])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!value.trim()) return
    await onSubmit({ type, value: value.trim(), note: note.trim() || undefined, isPrimary })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} dir="rtl" className="max-w-lg gap-0 rounded-[26px] border-[var(--app-divider)] bg-[var(--app-surface)] p-0">
        <DialogHeader className="flex-row items-center justify-between border-b border-[var(--app-divider)] p-5">
          <DialogTitle>{contact ? text.edit : text.add}</DialogTitle>
          <Button type="button" variant="ghost" size="icon" className="rounded-xl" aria-label={uiText.people.actions.close} onClick={() => onOpenChange(false)}><X className="size-4" /></Button>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 p-5">
          <Field label={text.type}>
            <select value={type} onChange={(event) => setType(event.target.value as PersonContactType)} className="h-11 rounded-xl border border-input bg-background px-3 text-sm">
              {PERSON_CONTACT_TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </Field>
          <Field label={text.value}><Input dir="auto" value={value} onChange={(event) => setValue(event.target.value)} className="h-11 rounded-xl" /></Field>
          <Field label={text.note}><textarea value={note} onChange={(event) => setNote(event.target.value)} className="min-h-24 rounded-xl border border-input bg-background p-3 text-sm" /></Field>
          <label className="flex items-center gap-2 text-sm text-[var(--app-heading)]"><input type="checkbox" checked={isPrimary} onChange={(event) => setIsPrimary(event.target.checked)} />{text.primary}</label>
          {error ? <InlineError message={getPeopleErrorMessage(error, uiText.people.nested.mutationError)} /> : null}
          <div className="flex justify-end gap-2 border-t border-[var(--app-divider)] pt-4">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>{uiText.common.cancel}</Button>
            <Button type="submit" disabled={isPending || !value.trim()} className="rounded-xl bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)]">{isPending ? uiText.common.processing : uiText.people.actions.save}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-2"><span className="text-xs font-bold text-[var(--app-heading)]">{label}</span>{children}</label> }
function InlineError({ message }: { message: string }) { return <p className="rounded-xl bg-[var(--destructive)]/5 p-3 text-xs text-[var(--destructive)]">{message}</p> }
