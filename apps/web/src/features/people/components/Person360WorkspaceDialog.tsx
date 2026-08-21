import { useEffect, useState } from "react"

import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { uiText } from "@/config/uiText"
import { useAuthStore } from "@/store/authStore"

import {
  useDeletePerson,
  usePerson,
  usePeopleLookups,
  useUpdatePerson,
} from "../hooks/usePeople"
import type { PersonMutationPayload } from "../types/person.types"
import { Person360Dialog } from "./Person360Dialog"
import { PersonFormDialog } from "./PersonFormDialog"

export function Person360WorkspaceDialog({
  personId,
  open,
  onOpenChange,
  onPersonChanged,
}: {
  personId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onPersonChanged?: () => void | Promise<unknown>
}) {
  const text = uiText.people
  const permissions = useAuthStore((state) => state.user?.permissions ?? [])
  const canView = permissions.includes("person:view")
  const canEdit = permissions.includes("person:update")
  const canDelete = permissions.includes("person:delete")
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const person = usePerson(open ? personId : null)
  const lookups = usePeopleLookups()
  const updateMutation = useUpdatePerson(personId ?? "")
  const deleteMutation = useDeletePerson()

  useEffect(() => {
    if (!open) {
      setEditOpen(false)
      setDeleteOpen(false)
    }
  }, [open])

  async function updatePerson(payload: PersonMutationPayload) {
    if (!personId) return
    const { companyId: _ignoredCompanyId, ...data } = payload
    await updateMutation.mutateAsync(data)
    await onPersonChanged?.()
    setEditOpen(false)
  }

  async function deletePerson() {
    if (!personId) return
    await deleteMutation.mutateAsync(personId)
    await onPersonChanged?.()
    setDeleteOpen(false)
    onOpenChange(false)
  }

  return (
    <>
      <Person360Dialog
        personId={personId}
        open={open && canView && !editOpen && !deleteOpen}
        onOpenChange={onOpenChange}
        canEdit={canEdit && canView}
        canDelete={canDelete && canView}
        onEdit={() => setEditOpen(true)}
        onDelete={() => setDeleteOpen(true)}
      />

      <PersonFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        person={person.data ?? null}
        lookups={lookups.data}
        isPending={updateMutation.isPending}
        onSubmit={updatePerson}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={text.delete.title}
        description={text.delete.description}
        confirmLabel={text.actions.delete}
        tone="danger"
        isPending={deleteMutation.isPending}
        onConfirm={deletePerson}
      />
    </>
  )
}
