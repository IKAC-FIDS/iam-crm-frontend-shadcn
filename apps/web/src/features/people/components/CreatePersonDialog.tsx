import { toast } from "sonner"

import { uiText } from "@/config/uiText"

import { useCreatePerson, usePeopleLookups } from "../hooks/usePeople"
import type {
  PersonDetail,
  PersonMutationPayload,
} from "../types/person.types"
import { PersonFormDialog } from "./PersonFormDialog"

export function CreatePersonDialog({
  open,
  onOpenChange,
  initialCompanyId,
  lockCompany = false,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialCompanyId?: string
  lockCompany?: boolean
  onCreated?: (person: PersonDetail) => void | Promise<unknown>
}) {
  const lookups = usePeopleLookups()
  const mutation = useCreatePerson()

  async function createPerson(payload: PersonMutationPayload) {
    const person = await mutation.mutateAsync(payload)
    toast.success(uiText.people.feedback.created)
    onOpenChange(false)
    await onCreated?.(person)
  }

  return (
    <PersonFormDialog
      open={open}
      onOpenChange={onOpenChange}
      mode="create"
      initialCompanyId={initialCompanyId}
      lockCompany={lockCompany}
      lookups={lookups.data}
      isPending={mutation.isPending}
      onSubmit={createPerson}
    />
  )
}
