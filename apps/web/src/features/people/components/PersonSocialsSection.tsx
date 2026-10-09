import { AtSign } from "lucide-react"
import { useState } from "react"

import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { ErrorState } from "@/components/shared/ErrorState"
import { LoadingState } from "@/components/shared/LoadingState"
import { uiText } from "@/config/uiText"

import { useCreatePersonSocial, useDeletePersonSocial, usePersonSocials, useUpdatePersonSocial } from "../hooks/usePeople"
import type { PersonSocial, PersonSocialPayload } from "../types/person.types"
import { getPersonSocialPlatformLabel } from "../constants/personOptions"
import { getPeopleErrorMessage } from "../utils/peopleError"
import { Badge, EmptyLine, RowActions, SectionHeader } from "./PersonContactsSection"
import { PersonSocialDialog } from "./PersonSocialDialog"

export function PersonSocialsSection({ personId, canEdit }: { personId: string; canEdit: boolean }) {
  const text = uiText.people
  const query = usePersonSocials(personId)
  const createMutation = useCreatePersonSocial(personId)
  const updateMutation = useUpdatePersonSocial(personId)
  const deleteMutation = useDeletePersonSocial(personId)
  const [editing, setEditing] = useState<PersonSocial | null | undefined>(undefined)
  const [deleting, setDeleting] = useState<PersonSocial | null>(null)
  const socials = Array.isArray(query.data) ? query.data : []
  async function save(payload: PersonSocialPayload) { if (editing) await updateMutation.mutateAsync({ id: editing.id, payload }); else await createMutation.mutateAsync(payload); setEditing(undefined) }
  return <><SectionHeader title={text.socialIdentity.title} canEdit={canEdit} addLabel={text.socialIdentity.add} onAdd={() => setEditing(null)} />
    {query.isLoading ? <LoadingState rows={2} /> : query.isError ? <ErrorState title={text.nested.loadError} description={getPeopleErrorMessage(query.error, text.nested.loadError)} retryLabel={uiText.common.retry} onRetry={() => void query.refetch()} /> : socials.length ? <div className="grid gap-2.5">{socials.map((social) => <div key={social.id} className="flex items-start gap-3 rounded-2xl border border-[var(--app-divider)] bg-[var(--app-background)]/45 p-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]"><AtSign className="size-4" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-xs font-bold text-[var(--app-heading)]">{getPersonSocialPlatformLabel(social.platform) || social.platformOption?.label || text.notSpecified}</p>{social.isPrimary ? <Badge /> : null}</div><p dir="auto" className="mt-1 break-all text-xs text-[var(--app-heading)]">{social.handle}</p>{social.note ? <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--app-text-secondary)]" title={social.note}>{social.note}</p> : null}</div>{canEdit ? <RowActions onEdit={() => setEditing(social)} onDelete={() => setDeleting(social)} /> : null}</div>)}</div> : <EmptyLine>{text.empty.socials}</EmptyLine>}
    <PersonSocialDialog open={editing !== undefined} onOpenChange={(open) => { if (!open) setEditing(undefined) }} social={editing} isPending={createMutation.isPending || updateMutation.isPending} error={createMutation.error || updateMutation.error} onSubmit={save} />
    <ConfirmDialog open={Boolean(deleting)} onOpenChange={(open) => { if (!open) setDeleting(null) }} title={text.socialIdentity.deleteTitle} description={deleteMutation.error ? getPeopleErrorMessage(deleteMutation.error, text.nested.deleteError) : text.socialIdentity.deleteDescription} confirmLabel={text.actions.delete} isPending={deleteMutation.isPending} onConfirm={async () => { if (deleting) { await deleteMutation.mutateAsync(deleting.id); setDeleting(null) } }} />
  </>
}
