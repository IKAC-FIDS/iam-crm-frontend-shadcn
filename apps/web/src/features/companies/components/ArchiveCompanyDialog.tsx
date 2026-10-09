import { Archive, RefreshCcw, X } from "lucide-react"
import { useState } from "react"

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
  useRestoreCompany,
} from "../hooks/useCompanyMutations"
import type { Company } from "../types/company.types"

export function ArchiveCompanyDialog({
  company,
  open,
  onOpenChange,
}: {
  company: Company
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const text = uiText.companies.detail
  const archiveMutation = useArchiveCompany(company.id)
  const restoreMutation = useRestoreCompany(company.id)
  const [reason, setReason] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)

  const archived = Boolean(company.archivedAt)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          dir="rtl"
          className="w-[min(620px,calc(100vw-24px))] max-w-none gap-0 overflow-hidden rounded-[28px] border-[var(--app-divider)] bg-[var(--app-surface)] p-0 shadow-[var(--app-shadow-elevated)] sm:max-w-none"
        >
          <DialogHeader className="border-b border-[var(--app-divider)] px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={[
                  "grid size-10 place-items-center rounded-2xl",
                  archived
                    ? "bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
                    : "bg-[var(--destructive-soft)] text-[var(--destructive)]",
                ].join(" ")}>
                  {archived ? (
                    <RefreshCcw className="size-4" />
                  ) : (
                    <Archive className="size-4" />
                  )}
                </div>
                <DialogTitle className="text-base font-bold text-[var(--app-heading)]">
                  {archived ? text.active : text.archived}
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
              <p className="text-sm font-bold text-[var(--app-heading)]">
                {company.brandName || company.legalName}
              </p>
              <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                {archived ? text.archived : text.active}
              </p>
            </div>

            {!archived ? (
              <Input
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder={text.notSpecified}
                className="h-11 rounded-xl"
              />
            ) : null}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => onOpenChange(false)}
              >
                {uiText.common.cancel}
              </Button>

              {archived ? (
                <Button
                  type="button"
                  className="rounded-xl bg-[var(--app-primary)] text-[var(--app-on-primary)] hover:bg-[var(--app-primary-hover)]"
                  disabled={restoreMutation.isPending}
                  onClick={() => setConfirmOpen(true)}
                >
                  <RefreshCcw className="size-4" />
                  {text.active}
                </Button>
              ) : (
                <Button
                  type="button"
                  className="rounded-xl bg-[var(--destructive)] text-white hover:bg-[var(--destructive)]/90"
                  disabled={archiveMutation.isPending}
                  onClick={() => setConfirmOpen(true)}
                >
                  <Archive className="size-4" />
                  {text.archived}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={archived ? text.active : text.archived}
        description={company.brandName || company.legalName}
        confirmLabel={archived ? text.active : text.archived}
        tone={archived ? "primary" : "danger"}
        isPending={
          archived ? restoreMutation.isPending : archiveMutation.isPending
        }
        onConfirm={async () => {
          if (archived) {
            await restoreMutation.mutateAsync()
          } else {
            await archiveMutation.mutateAsync(reason)
          }
          setConfirmOpen(false)
          onOpenChange(false)
        }}
      />
    </>
  )
}
