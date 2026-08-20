import { Archive, RefreshCcw, UserRoundCog, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { uiText } from "@/config/uiText"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"

import {
  useArchiveCompany,
  useChangeCompanyOwner,
  useCompanyOwnerOptions,
  useRestoreCompany,
} from "../hooks/useCompanyMutations"
import type { Company } from "../types/company.types"

export function CompanyManagementDialog({
  company,
  permissions,
  open,
  onOpenChange,
}: {
  company: Company
  permissions: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const text = uiText.companies.detail
  const canLoadOwners =
    permissions.includes("company:assign-owner") &&
    permissions.includes("company:change-owner")
  const ownerOptions = useCompanyOwnerOptions(open && canLoadOwners)
  const ownerMutation = useChangeCompanyOwner(company.id)
  const archiveMutation = useArchiveCompany(company.id)
  const restoreMutation = useRestoreCompany(company.id)

  const [ownerId, setOwnerId] = useState(company.owner?.id ?? "")
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false)
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false)
  const [archiveReason, setArchiveReason] = useState("")

  useEffect(() => {
    if (open) setOwnerId(company.owner?.id ?? "")
  }, [company.owner?.id, open])

  const owners = useMemo(() => {
    const items = ownerOptions.data ?? []
    if (!company.owner || items.some((item) => item.id === company.owner?.id)) {
      return items
    }
    return [
      {
        id: company.owner.id,
        fullName: company.owner.fullName,
        email: company.owner.email,
        team: company.owner.team,
      },
      ...items,
    ]
  }, [company.owner, ownerOptions.data])

  async function saveOwner() {
    if (!ownerId || ownerId === company.owner?.id) return
    await ownerMutation.mutateAsync(ownerId)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          dir="rtl"
          className="w-[min(680px,calc(100vw-24px))] max-w-none gap-0 overflow-hidden rounded-[28px] border-[var(--app-divider)] bg-[var(--app-surface)] p-0 shadow-[var(--app-shadow-elevated)] sm:max-w-none"
        >
          <DialogHeader className="border-b border-[var(--app-divider)] bg-[linear-gradient(155deg,var(--app-primary-soft),var(--app-surface)_70%)] px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-2xl bg-[var(--app-primary)] text-[var(--app-on-primary)]">
                  <UserRoundCog className="size-4" />
                </div>
                <DialogTitle className="text-base font-bold text-[var(--app-heading)]">
                  {text.edit}
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

          <div className="grid gap-5 p-5 sm:p-6">
            <section className="rounded-[22px] border border-[var(--app-divider)] bg-[var(--app-background)]/40 p-4">
              <div className="mb-4 flex items-center gap-2">
                <UserRoundCog className="size-4 text-[var(--app-primary)]" />
                <h3 className="text-sm font-bold text-[var(--app-heading)]">
                  {text.fields.owner}
                </h3>
              </div>

              {canLoadOwners ? (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <select
                    value={ownerId}
                    onChange={(event) => setOwnerId(event.target.value)}
                    disabled={ownerOptions.isLoading || ownerMutation.isPending}
                    className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <option value="">{text.unassigned}</option>
                    {owners.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.fullName}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    className="rounded-xl bg-[var(--app-primary)] text-[var(--app-on-primary)] hover:bg-[var(--app-primary-hover)]"
                    disabled={
                      !ownerId ||
                      ownerId === company.owner?.id ||
                      ownerMutation.isPending
                    }
                    onClick={() => void saveOwner()}
                  >
                    {uiText.common.confirm}
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-[var(--app-text-secondary)]">
                  {company.owner?.fullName || text.unassigned}
                </p>
              )}
            </section>

            <section className="rounded-[22px] border border-[var(--app-divider)] bg-[var(--app-background)]/40 p-4">
              <div className="mb-4 flex items-center gap-2">
                {company.archivedAt ? (
                  <RefreshCcw className="size-4 text-[var(--app-primary)]" />
                ) : (
                  <Archive className="size-4 text-[var(--destructive)]" />
                )}
                <h3 className="text-sm font-bold text-[var(--app-heading)]">
                  {company.archivedAt ? text.archived : text.active}
                </h3>
              </div>

              {company.archivedAt && permissions.includes("company:restore") ? (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setRestoreConfirmOpen(true)}
                >
                  <RefreshCcw className="size-4" />
                  {text.active}
                </Button>
              ) : !company.archivedAt &&
                permissions.includes("company:archive") ? (
                <div className="grid gap-3">
                  <Input
                    value={archiveReason}
                    onChange={(event) => setArchiveReason(event.target.value)}
                    placeholder={text.notSpecified}
                    className="h-11 rounded-xl"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-fit rounded-xl border-[var(--destructive)]/30 text-[var(--destructive)] hover:bg-[var(--destructive-soft)]"
                    onClick={() => setArchiveConfirmOpen(true)}
                  >
                    <Archive className="size-4" />
                    {text.archived}
                  </Button>
                </div>
              ) : null}
            </section>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={archiveConfirmOpen}
        onOpenChange={setArchiveConfirmOpen}
        title={text.archived}
        description={company.brandName || company.legalName}
        confirmLabel={text.archived}
        isPending={archiveMutation.isPending}
        onConfirm={async () => {
          await archiveMutation.mutateAsync(archiveReason)
          setArchiveConfirmOpen(false)
          onOpenChange(false)
        }}
      />

      <ConfirmDialog
        open={restoreConfirmOpen}
        onOpenChange={setRestoreConfirmOpen}
        title={text.active}
        description={company.brandName || company.legalName}
        confirmLabel={text.active}
        tone="primary"
        isPending={restoreMutation.isPending}
        onConfirm={async () => {
          await restoreMutation.mutateAsync()
          setRestoreConfirmOpen(false)
          onOpenChange(false)
        }}
      />
    </>
  )
}
