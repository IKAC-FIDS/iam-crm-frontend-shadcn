import { X } from "lucide-react"
import { useState } from "react"

import { PersianDatePicker } from "@/components/shared/PersianDatePicker"
import { uiText } from "@/config/uiText"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"

import { useUniversities } from "../hooks/usePeople"
import type { EducationHistory, EducationHistoryPayload, PersonEducationDegree } from "../types/person.types"
import { SearchableUniversitySelect } from "./SearchableUniversitySelect"

const degrees: PersonEducationDegree[] = ["DIPLOMA", "ASSOCIATE", "BACHELOR", "PHD", "POSTDOC"]
function toDate(value?: string | null) { if (!value) return undefined; const date = new Date(value); return Number.isNaN(date.getTime()) ? undefined : date }
function toApiDate(value?: Date) { if (!value) return undefined; return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}` }

export function PersonEducationDialog({ open, onOpenChange, education, isPending, error, onSubmit }: { open: boolean; onOpenChange: (open: boolean) => void; education?: EducationHistory | null; isPending: boolean; error?: unknown; onSubmit: (payload: EducationHistoryPayload) => Promise<void> }) {
  const text = uiText.people.education; const universities = useUniversities(open); const [degree, setDegree] = useState<PersonEducationDegree | "">(""); const [universityId, setUniversityId] = useState(""); const [educationDate, setEducationDate] = useState<Date>(); const [description, setDescription] = useState("")
  const resetInputs0 = [education, open] as const
  const [previousResetInputs0, setPreviousResetInputs0] = useState<typeof resetInputs0 | null>(null)
  if (previousResetInputs0 === null || previousResetInputs0[0] !== resetInputs0[0] || previousResetInputs0[1] !== resetInputs0[1]) {
    setPreviousResetInputs0(resetInputs0)
    if (open) { setDegree(education?.degree || ""); setUniversityId(education?.universityId || education?.university?.id || ""); setEducationDate(toDate(education?.educationDate)); setDescription(education?.description || "") }
  }
  const valid = Boolean(degree || universityId || educationDate || description.trim())
  async function submit(event: React.FormEvent) { event.preventDefault(); if (valid) await onSubmit({ degree: degree || undefined, universityId: universityId || undefined, educationDate: toApiDate(educationDate), description: description.trim() || undefined }) }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent showCloseButton={false} dir="rtl" className="max-h-[90vh] max-w-xl gap-0 overflow-y-auto rounded-[26px] border-[var(--app-divider)] bg-[var(--app-surface)] p-0"><DialogHeader className="flex-row items-center justify-between border-b border-[var(--app-divider)] p-5"><DialogTitle>{education ? text.edit : text.add}</DialogTitle><Button type="button" variant="ghost" size="icon" className="rounded-xl" aria-label={uiText.people.actions.close} onClick={() => onOpenChange(false)}><X className="size-4" /></Button></DialogHeader><form onSubmit={submit} className="grid gap-4 p-5"><Field label={text.degree}><select value={degree} onChange={(event) => setDegree(event.target.value as PersonEducationDegree | "")} className="h-11 rounded-xl border border-input bg-background px-3 text-sm"><option value="">{text.selectDegree}</option>{degrees.map((item) => <option key={item} value={item}>{text.degrees[item]}</option>)}</select></Field><Field label={text.university}><SearchableUniversitySelect value={universityId || undefined} options={universities.data} onChange={(value) => setUniversityId(value || "")} disabled={universities.isError} /></Field>{universities.isError ? <p className="rounded-xl bg-[var(--destructive)]/5 p-3 text-xs text-[var(--destructive)]">{text.universityPermissionError}</p> : null}<Field label={text.educationDate}><PersianDatePicker value={educationDate} onChange={setEducationDate} /></Field><Field label={text.description}><textarea value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-24 rounded-xl border border-input bg-background p-3 text-sm" /></Field>{error ? <p className="rounded-xl bg-[var(--destructive)]/5 p-3 text-xs text-[var(--destructive)]">{getApiErrorMessage(error, uiText.people.nested.mutationError)}</p> : null}<div className="flex justify-end gap-2 border-t border-[var(--app-divider)] pt-4"><Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>{uiText.common.cancel}</Button><Button type="submit" disabled={isPending || !valid} className="rounded-xl bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)]">{isPending ? uiText.common.processing : uiText.people.actions.save}</Button></div></form></DialogContent></Dialog>
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-2"><span className="text-xs font-bold">{label}</span>{children}</label> }
