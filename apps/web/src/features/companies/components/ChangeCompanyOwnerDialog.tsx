import { UserRoundCog, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { uiText } from "@/config/uiText"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

  useEffect(() => {
    if (open) setOwnerId(company.owner?.id ?? "")
  }, [company.owner?.id, open])

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

  async function save() {
    if (!ownerId || ownerId === company.owner?.id) return
    await mutation.mutateAsync(ownerId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        dir="rtl"
        className="w-[min(620px,calc(100vw-24px))] max-w-none gap-0 overflow-hidden rounded-[28px] border-[var(--app-divider)] bg-[var(--app-surface)] p-0 shadow-[var(--app-shadow-elevated)] sm:max-w-none"
      >
        <DialogHeader className="border-b border-[var(--app-divider)] bg-[linear-gradient(155deg,var(--app-primary-soft),var(--app-surface)_72%)] px-5 py-5 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-2xl bg-[var(--app-primary)] text-[var(--app-on-primary)]">
                <UserRoundCog className="size-4" />
              </div>
              <DialogTitle className="text-base font-bold text-[var(--app-heading)]">
                {text.fields.owner}
              </DialogTitle>
            </div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="rounded-xl"
              aria-label={uiText.companies.form.close}
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid gap-4 p-5 sm:p-6">
          <div className="rounded-2xl border border-[var(--app-divider)] bg-[var(--app-background)]/45 p-4">
            <p className="text-xs font-bold text-[var(--app-text-secondary)]">
              {text.fields.owner}
            </p>
            <p className="mt-2 text-sm font-bold text-[var(--app-heading)]">
              {company.owner?.fullName || text.unassigned}
            </p>
          </div>

          <select
            value={ownerId}
            onChange={(event) => setOwnerId(event.target.value)}
            disabled={options.isLoading || mutation.isPending}
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="">{text.unassigned}</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.fullName}
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              disabled={mutation.isPending}
              onClick={() => onOpenChange(false)}
            >
              {uiText.common.cancel}
            </Button>
            <Button
              type="button"
              className="rounded-xl bg-[var(--app-primary)] text-[var(--app-on-primary)] hover:bg-[var(--app-primary-hover)]"
              disabled={
                !ownerId ||
                ownerId === company.owner?.id ||
                mutation.isPending
              }
              onClick={() => void save()}
            >
              {mutation.isPending ? uiText.common.processing : uiText.common.confirm}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
