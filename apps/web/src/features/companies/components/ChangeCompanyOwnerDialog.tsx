import { UserRoundCog } from "lucide-react"
import { useMemo, useState } from "react"

import { DialogHeroHeader } from "@/components/shared/DialogHeroHeader"
import { FormActions } from "@/components/shared/FormActions"
import { FormDialogBody, FormDialogFooter } from "@/components/shared/FormDialogLayout"
import { SearchableOptionSelect } from "@/components/shared/SearchableOptionSelect"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { uiText } from "@/config/uiText"
import {
  Dialog,
  DialogContent,
} from "@workspace/ui/components/dialog"

import {
  useChangeCompanyOwner,
  useCompanyOwnerOptions,
} from "../hooks/useCompanyMutations"
import type { Company } from "../types/company.types"

export function ChangeCompanyOwnerDialog({
  company,
  open,
  onOpenChange,
}: {
  company: Company
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const text = uiText.companies.detail
  const options = useCompanyOwnerOptions(open)
  const mutation = useChangeCompanyOwner(company.id)
  const [ownerId, setOwnerId] = useState(company.owner?.id ?? "")
  const [search, setSearch] = useState("")

  const resetInputs0 = [company.owner?.id, open] as const
  const [previousResetInputs0, setPreviousResetInputs0] = useState<typeof resetInputs0 | null>(null)
  if (previousResetInputs0 === null || previousResetInputs0[0] !== resetInputs0[0] || previousResetInputs0[1] !== resetInputs0[1]) {
    setPreviousResetInputs0(resetInputs0)
    if (open) setOwnerId(company.owner?.id ?? "")
  }

  const owners = useMemo(() => {
    const values = options.data ?? []
    if (!company.owner || values.some((item) => item.id === company.owner?.id)) {
      return values
    }
    return [
      {
        id: company.owner.id,
        fullName: company.owner.fullName,
        email: company.owner.email,
        team: company.owner.team,
      },
      ...values,
    ]
  }, [company.owner, options.data])

  const visibleOwners = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("fa-IR")
    if (!term) return owners
    return owners.filter((owner) =>
      [owner.fullName, owner.email, owner.team, owner.role]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase("fa-IR").includes(term))
    )
  }, [owners, search])

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) setSearch("")
    onOpenChange(nextOpen)
  }

  async function save() {
    if (!ownerId || ownerId === company.owner?.id) return
    await mutation.mutateAsync(ownerId)
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        dir="rtl"
        className="w-[min(620px,calc(100vw-24px))] max-w-none gap-0 overflow-hidden rounded-[28px] border-[var(--app-divider)] bg-[var(--app-surface)] p-0 shadow-[var(--app-shadow-elevated)] sm:max-w-none"
      >
        <DialogHeroHeader
          title="تغییر مالک شرکت"
          description="مالک جدید را از میان کاربران مجاز انتخاب کنید."
          icon={UserRoundCog}
          onClose={() => handleOpenChange(false)}
        />

        <FormDialogBody>
          <div className="rounded-2xl border border-[var(--app-divider)] bg-[var(--app-background)]/45 p-4">
            <p className="text-xs font-bold text-[var(--app-text-secondary)]">
              {text.fields.owner}
            </p>
            <p className="mt-2 text-sm font-bold text-[var(--app-heading)]">
              {company.owner?.fullName || text.unassigned}
            </p>
          </div>

          <SearchableOptionSelect
            ariaLabel="انتخاب مالک جدید"
            value={ownerId}
            options={visibleOwners.map((owner) => ({
              id: owner.id,
              label: owner.fullName,
              description: [owner.email, owner.teamRef?.name || owner.team]
                .filter(Boolean)
                .join(" · "),
            }))}
            search={search}
            onSearchChange={setSearch}
            onChange={(value) => setOwnerId(value ?? "")}
            placeholder={options.isLoading ? uiText.common.loading : "انتخاب مالک جدید"}
            disabled={options.isLoading || mutation.isPending}
          />

          {mutation.isError ? (
            <p role="alert" className="text-sm text-destructive">
              {getApiErrorMessage(mutation.error, "تغییر مالک شرکت انجام نشد.")}
            </p>
          ) : null}
        </FormDialogBody>
        <FormDialogFooter>
          <form onSubmit={(event) => { event.preventDefault(); void save() }}>
            <FormActions
              onCancel={() => handleOpenChange(false)}
              pending={mutation.isPending}
              submitLabel={uiText.common.confirm}
              disabled={!ownerId || ownerId === company.owner?.id}
            />
          </form>
        </FormDialogFooter>
      </DialogContent>
    </Dialog>
  )
}
