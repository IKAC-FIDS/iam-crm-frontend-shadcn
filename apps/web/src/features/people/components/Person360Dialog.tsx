import { Building2, Pencil, Star, Trash2, UserRound, X } from "lucide-react"

import { ErrorState } from "@/components/shared/ErrorState"
import { LoadingState } from "@/components/shared/LoadingState"
import { uiText } from "@/config/uiText"
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"

import { usePeopleLookups, usePerson } from "../hooks/usePeople"
import type { PeopleLookupSet, PersonDetail } from "../types/person.types"
import { formatPersonDate, personCompanyName, personDisplayValues } from "../utils/personFormatters"
import { PersonContactsSection } from "./PersonContactsSection"
import { PersonEducationSection } from "./PersonEducationSection"
import { PersonEmploymentSection } from "./PersonEmploymentSection"
import { PersonSocialsSection } from "./PersonSocialsSection"

export function Person360Dialog({ personId, open, onOpenChange, canEdit, canDelete, onEdit, onDelete }: {
  personId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  canEdit: boolean
  canDelete: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const text = uiText.people
  const query = usePerson(personId)
  const lookups = usePeopleLookups()

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent showCloseButton={false} dir="rtl" className="max-h-[94vh] w-[min(1180px,calc(100vw-20px))] max-w-none gap-0 overflow-hidden rounded-[32px] border-[var(--app-divider)] bg-[var(--app-surface)] p-0 shadow-[var(--app-shadow-elevated)] sm:max-w-none">
    {query.isLoading ? <div className="p-8"><LoadingState /></div> : query.isError || !query.data ? <div className="p-8"><ErrorState title={text.errors.detailTitle} description={text.errors.detailDescription} retryLabel={uiText.common.retry} onRetry={() => void query.refetch()} /></div> : <Workspace person={query.data} lookups={lookups.data} personId={personId || query.data.id} canEdit={canEdit} canDelete={canDelete} onEdit={onEdit} onDelete={onDelete} onClose={() => onOpenChange(false)} />}
  </DialogContent></Dialog>
}

function Workspace({ person, lookups, personId, canEdit, canDelete, onEdit, onDelete, onClose }: { person: PersonDetail; lookups: PeopleLookupSet; personId: string; canEdit: boolean; canDelete: boolean; onEdit: () => void; onDelete: () => void; onClose: () => void }) {
  const text = uiText.people
  const display = personDisplayValues(person, lookups)
  const ownerTeam = person.company?.owner?.teamRef?.name || person.company?.owner?.team || ""
  return <>
    <DialogHeader className="relative overflow-hidden border-b border-[var(--app-divider)] bg-[linear-gradient(145deg,var(--app-primary-soft),var(--app-surface)_70%)] px-5 py-5 sm:px-7">
      <div className="pointer-events-none absolute -end-14 -top-20 size-52 rounded-full bg-[var(--app-primary)]/10 blur-3xl" />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div className="flex min-w-0 items-start gap-4"><div className="grid size-14 shrink-0 place-items-center rounded-[20px] bg-[var(--app-primary)] text-[var(--app-on-primary)] shadow-sm"><UserRound className="size-6" /></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><DialogTitle className="text-xl font-bold text-[var(--app-heading)]">{person.fullName}</DialogTitle>{person.isPrimaryContact ? <RoleBadge label={text.contactRole.primary} primary /> : null}{person.isSecondaryContact ? <RoleBadge label={text.contactRole.secondary} /> : null}</div><p className="mt-1 text-xs font-medium text-[var(--app-text-secondary)]">{display.jobTitle || text.notSpecified}</p><div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-[var(--app-text-secondary)]"><span className="inline-flex items-center gap-1.5"><Building2 className="size-3.5" />{personCompanyName(person) || text.notSpecified}</span>{display.department ? <span>{display.department}</span> : null}</div><div className="mt-3 flex flex-wrap gap-2">{display.personaRole ? <IntelligenceBadge label={display.personaRole} /> : null}{display.seniorityLevel ? <IntelligenceBadge label={display.seniorityLevel} /> : null}</div></div></div><div className="flex shrink-0 items-center gap-2">{canEdit ? <Button type="button" variant="outline" className="rounded-xl" onClick={onEdit}><Pencil className="size-4" />{text.actions.edit}</Button> : null}{canDelete ? <Button type="button" variant="outline" className="rounded-xl border-[var(--destructive)]/30 text-[var(--destructive)]" onClick={onDelete}><Trash2 className="size-4" />{text.actions.delete}</Button> : null}<Button type="button" variant="ghost" size="icon" className="rounded-xl" aria-label={text.actions.close} onClick={onClose}><X className="size-4" /></Button></div></div>
    </DialogHeader>
    <div className="min-h-0 overflow-y-auto p-4 sm:p-6"><Panel><div className="mb-4"><h3 className="text-sm font-bold text-[var(--app-heading)]">{text.sections.profile}</h3></div><InfoGrid items={[[text.fields.jobTitle, display.jobTitle], [text.fields.department, display.department], [text.fields.personaRole, display.personaRole], [text.fields.seniorityLevel, display.seniorityLevel], [text.fields.owner, person.company?.owner?.fullName], [text.fields.ownerTeam, ownerTeam], [text.fields.createdAt, formatPersonDate(person.createdAt)], [text.fields.updatedAt, formatPersonDate(person.updatedAt)]]} /></Panel><div className="mt-4 grid gap-4 xl:grid-cols-2"><div className="grid content-start gap-4"><Panel><PersonContactsSection personId={personId} canEdit={canEdit} /></Panel><Panel><PersonSocialsSection personId={personId} canEdit={canEdit} /></Panel></div><div className="grid content-start gap-4"><Panel><PersonEmploymentSection personId={personId} canEdit={canEdit} /></Panel><Panel><PersonEducationSection personId={personId} canEdit={canEdit} /></Panel></div></div></div>
  </>
}

function Panel({ children }: { children: React.ReactNode }) { return <section className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-4 shadow-sm sm:p-5">{children}</section> }
function InfoGrid({ items }: { items: Array<[string, string | null | undefined]> }) { return <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">{items.map(([label, value]) => <div key={label} className="rounded-2xl bg-[var(--app-background)]/60 p-3"><p className="text-[9px] font-bold text-[var(--app-text-secondary)]">{label}</p><p className="mt-1.5 text-xs text-[var(--app-heading)]">{value || uiText.people.notSpecified}</p></div>)}</div> }
function RoleBadge({ label, primary = false }: { label: string; primary?: boolean }) { return <span className={primary ? "inline-flex items-center gap-1 rounded-full bg-[var(--app-primary-soft)] px-2.5 py-1 text-[9px] font-bold text-[var(--app-primary)]" : "inline-flex items-center gap-1 rounded-full border border-[var(--app-outline)] bg-[var(--app-surface)] px-2.5 py-1 text-[9px] font-bold text-[var(--app-primary-alt)]"}><Star className={primary ? "size-3 fill-current" : "size-3"} />{label}</span> }
function IntelligenceBadge({ label }: { label: string }) { return <span className="rounded-full border border-[var(--app-primary)]/15 bg-[var(--app-surface)]/75 px-2.5 py-1 text-[9px] font-bold text-[var(--app-on-primary-container)]">{label}</span> }
