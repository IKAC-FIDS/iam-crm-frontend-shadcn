import { Mail, Phone } from "lucide-react"
import { useState } from "react"

import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { QueryContent } from "@/components/shared/QueryContent"
import { uiText } from "@/config/uiText"

import {
  useCreatePersonContact,
  useDeletePersonContact,
  usePersonContacts,
  useUpdatePersonContact,
} from "../hooks/usePeople"
import type { PersonContact, PersonContactPayload } from "../types/person.types"
import { getPersonContactDisplayLabel } from "../utils/personContactDisplay"
import { getPeopleErrorMessage } from "../utils/peopleError"
import { PersonContactDialog } from "./PersonContactDialog"
import {
  PersonNestedEmptyLine,
  PersonNestedRowActions,
  PersonNestedSectionHeader,
  PersonPrimaryBadge,
} from "./PersonNestedSectionPrimitives"

export function PersonContactsSection({
  personId,
  canEdit,
}: {
  personId: string
  canEdit: boolean
}) {
  const text = uiText.people
  const query = usePersonContacts(personId)
  const createMutation = useCreatePersonContact(personId)
  const updateMutation = useUpdatePersonContact(personId)
  const deleteMutation = useDeletePersonContact(personId)
  const [editing, setEditing] = useState<PersonContact | null | undefined>(
    undefined
  )
  const [deleting, setDeleting] = useState<PersonContact | null>(null)
  const contacts = Array.isArray(query.data) ? query.data : []

  async function save(payload: PersonContactPayload) {
    if (editing) await updateMutation.mutateAsync({ id: editing.id, payload })
    else await createMutation.mutateAsync(payload)
    setEditing(undefined)
  }

  return (
    <>
      <PersonNestedSectionHeader
        title={text.contactHub.title}
        canEdit={canEdit}
        addLabel={text.contactHub.add}
        onAdd={() => setEditing(null)}
      />
      <QueryContent query={query} errorTitle={text.nested.loadError}>
        {contacts.length ? (
          <div className="grid gap-2.5">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex min-w-0 items-start gap-3 rounded-2xl border border-[var(--app-divider)] bg-[var(--app-background)]/45 p-3"
              >
                <span
                  aria-hidden="true"
                  className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
                >
                  {(contact.type || "").toUpperCase().includes("EMAIL") ? (
                    <Mail className="size-4" />
                  ) : (
                    <Phone className="size-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-bold text-[var(--app-heading)]">
                      {getPersonContactDisplayLabel(contact, text.notSpecified)}
                    </p>
                    {contact.isPrimary ? <PersonPrimaryBadge /> : null}
                  </div>
                  <p
                    dir="auto"
                    className="mt-1 text-xs break-all text-[var(--app-heading)]"
                  >
                    {contact.value}
                  </p>
                  {contact.note ? (
                    <p
                      className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--app-text-secondary)]"
                      title={contact.note}
                    >
                      {contact.note}
                    </p>
                  ) : null}
                </div>
                {canEdit ? (
                  <PersonNestedRowActions
                    onEdit={() => setEditing(contact)}
                    onDelete={() => setDeleting(contact)}
                  />
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <PersonNestedEmptyLine>{text.empty.contacts}</PersonNestedEmptyLine>
        )}
      </QueryContent>
      <PersonContactDialog
        open={editing !== undefined}
        onOpenChange={(open) => {
          if (!open) setEditing(undefined)
        }}
        contact={editing}
        isPending={createMutation.isPending || updateMutation.isPending}
        error={createMutation.error || updateMutation.error}
        onSubmit={save}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
        title={text.contactHub.deleteTitle}
        description={
          deleteMutation.error
            ? getPeopleErrorMessage(
                deleteMutation.error,
                text.nested.deleteError
              )
            : text.contactHub.deleteDescription
        }
        confirmLabel={text.actions.delete}
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          if (deleting) {
            await deleteMutation.mutateAsync(deleting.id)
            setDeleting(null)
          }
        }}
      />
    </>
  )
}
