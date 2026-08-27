import { Mail, Pencil, Phone, Plus, Trash2 } from "lucide-react"
import { useState } from "react"

import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { ErrorState } from "@/components/shared/ErrorState"
import { LoadingState } from "@/components/shared/LoadingState"
import { uiText } from "@/config/uiText"
import { Button } from "@workspace/ui/components/button"

import { useCreatePersonContact, useDeletePersonContact, usePersonContacts, useUpdatePersonContact } from "../hooks/usePeople"
import type { PersonContact, PersonContactPayload } from "../types/person.types"
import { getPersonContactTypeLabel } from "../constants/personOptions"
import { getPeopleErrorMessage } from "../utils/peopleError"
import { PersonContactDialog } from "./PersonContactDialog"

export function PersonContactsSection({ personId, canEdit }: { personId: string; canEdit: boolean }) {
  const text = uiText.people
  const query = usePersonContacts(personId)
  const createMutation = useCreatePersonContact(personId)
  const updateMutation = useUpdatePersonContact(personId)
  const deleteMutation = useDeletePersonContact(personId)
  const [editing, setEditing] = useState<PersonContact | null | undefined>(undefined)
  const [deleting, setDeleting] = useState<PersonContact | null>(null)
  const contacts = Array.isArray(query.data) ? query.data : []

  async function save(payload: PersonContactPayload) {
    if (editing) await updateMutation.mutateAsync({ id: editing.id, payload })
    else await createMutation.mutateAsync(payload)
    setEditing(undefined)
  }

  return <>
    <SectionHeader title={text.contactHub.title} canEdit={canEdit} addLabel={text.contactHub.add} onAdd={() => setEditing(null)} />
    {query.isLoading ? <LoadingState rows={2} /> : query.isError ? <ErrorState title={text.nested.loadError} description={getPeopleErrorMessage(query.error, text.nested.loadError)} retryLabel={uiText.common.retry} onRetry={() => void query.refetch()} /> : contacts.length ? (
      <div className="grid gap-2.5">{contacts.map((contact) => <div key={contact.id} className="flex items-start gap-3 rounded-2xl border border-[var(--app-divider)] bg-[var(--app-background)]/45 p-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">{(contact.type || "").toUpperCase().includes("EMAIL") ? <Mail className="size-4" /> : <Phone className="size-4" />}</span>
        <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-xs font-bold text-[var(--app-heading)]">{getPersonContactTypeLabel(contact.type) || contact.typeOption?.label || text.notSpecified}</p>{contact.isPrimary ? <Badge /> : null}</div><p dir="auto" className="mt-1 break-all text-xs text-[var(--app-heading)]">{contact.value}</p>{contact.note ? <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--app-text-secondary)]" title={contact.note}>{contact.note}</p> : null}</div>
        {canEdit ? <RowActions onEdit={() => setEditing(contact)} onDelete={() => setDeleting(contact)} /> : null}
      </div>)}</div>
    ) : <EmptyLine>{text.empty.contacts}</EmptyLine>}
    <PersonContactDialog open={editing !== undefined} onOpenChange={(open) => { if (!open) setEditing(undefined) }} contact={editing} isPending={createMutation.isPending || updateMutation.isPending} error={createMutation.error || updateMutation.error} onSubmit={save} />
    <ConfirmDialog open={Boolean(deleting)} onOpenChange={(open) => { if (!open) setDeleting(null) }} title={text.contactHub.deleteTitle} description={deleteMutation.error ? getPeopleErrorMessage(deleteMutation.error, text.nested.deleteError) : text.contactHub.deleteDescription} confirmLabel={text.actions.delete} isPending={deleteMutation.isPending} onConfirm={async () => { if (deleting) { await deleteMutation.mutateAsync(deleting.id); setDeleting(null) } }} />
  </>
}

export function SectionHeader({ title, canEdit, addLabel, onAdd }: { title: string; canEdit: boolean; addLabel: string; onAdd: () => void }) { return <div className="mb-4 flex items-center justify-between gap-3"><h3 className="text-sm font-bold text-[var(--app-heading)]">{title}</h3>{canEdit ? <Button type="button" size="sm" variant="outline" className="rounded-xl" onClick={onAdd}><Plus className="size-3.5" />{addLabel}</Button> : null}</div> }
export function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) { return <div className="flex shrink-0 gap-1"><Button type="button" variant="ghost" size="icon" className="size-8 rounded-lg" aria-label={uiText.people.actions.edit} onClick={onEdit}><Pencil className="size-3.5" /></Button><Button type="button" variant="ghost" size="icon" className="size-8 rounded-lg text-[var(--destructive)]" aria-label={uiText.people.actions.delete} onClick={onDelete}><Trash2 className="size-3.5" /></Button></div> }
export function Badge() { return <span className="rounded-full bg-[var(--app-primary-soft)] px-2 py-0.5 text-[8px] font-bold text-[var(--app-primary)]">{uiText.people.nested.primary}</span> }
export function EmptyLine({ children }: { children: React.ReactNode }) { return <p className="rounded-2xl bg-[var(--app-background)]/55 p-4 text-center text-xs text-[var(--app-text-secondary)]">{children}</p> }
