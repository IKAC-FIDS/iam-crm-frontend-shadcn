import { useState } from "react"
import { Layers3 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent } from "@workspace/ui/components/dialog"
import { DialogHeroHeader } from "@/components/shared/DialogHeroHeader"
import {
  FormDialogBody,
  FormDialogFooter,
} from "@/components/shared/FormDialogLayout"
import { FormSection } from "@/components/shared/FormSection"
import { PersianDateTimePicker } from "@/components/shared/PersianDateTimePicker"
import { SearchableOptionSelect } from "@/components/shared/SearchableOptionSelect"
import type { CompanyEngagementStatus } from "../types/company.types"
import { companyEngagementLabels } from "../utils/companyPresentation"

export function CompanyEngagementDialog({
  company,
  open,
  pending,
  onClose,
  onSubmit,
}: {
  company: {
    id: string
    legalName: string
    brandName?: string | null
    engagementStatus: CompanyEngagementStatus
    engagementReason?: string | null
    nextReviewAt?: string | null
  } | null
  open: boolean
  pending: boolean
  onClose: () => void
  onSubmit: (value: {
    status: CompanyEngagementStatus
    reason?: string
    nextReviewAt?: string
  }) => Promise<void>
}) {
  const [draft, setDraft] = useState<{
    companyId: string
    status: CompanyEngagementStatus
    reason: string
    nextReviewAt?: Date
  }>()
  const current =
    draft && draft.companyId === company?.id
      ? draft
      : {
          companyId: company?.id ?? "",
          status: company?.engagementStatus ?? ("NEEDS_ACTION" as const),
          reason: company?.engagementReason ?? "",
          nextReviewAt: company?.nextReviewAt
            ? new Date(company.nextReviewAt)
            : undefined,
        }
  const { status, reason, nextReviewAt } = current
  const updateDraft = (patch: Partial<typeof current>) =>
    setDraft({ ...current, ...patch })
  const needsDate = status === "NURTURE" || status === "SNOOZED"

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent
        showCloseButton={false}
        dir="rtl"
        className="max-h-[92dvh] w-[calc(100%-1rem)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden rounded-[var(--app-radius-hero)] p-0 sm:max-w-2xl"
      >
        <DialogHeroHeader
          title="وضعیت شرکت در سبد فروش"
          description={company?.brandName || company?.legalName}
          icon={Layers3}
          onClose={onClose}
        />
        <form
          className="contents"
          onSubmit={(event) => {
            event.preventDefault()
            void onSubmit({
              status,
              reason: reason.trim() || undefined,
              nextReviewAt: needsDate ? nextReviewAt?.toISOString() : undefined,
            })
          }}
        >
          <FormDialogBody>
            <FormSection
              title="برنامه پیگیری"
              description="این وضعیت مستقل از وضعیت ثبتی شرکت و مراحل فرصت‌های فروش است."
            >
              <div className="grid gap-4">
                <label className="grid gap-2 text-sm font-semibold">
                  وضعیت سبد فروش
                  <SearchableOptionSelect
                    value={status}
                    options={Object.entries(companyEngagementLabels).map(
                      ([id, label]) => ({ id, label })
                    )}
                    search=""
                    onSearchChange={() => undefined}
                    onChange={(value) =>
                      updateDraft({ status: value as CompanyEngagementStatus })
                    }
                    ariaLabel="وضعیت سبد فروش شرکت"
                    searchable={false}
                    allowEmpty={false}
                  />
                </label>
                {needsDate ? (
                  <label className="grid gap-2 text-sm font-semibold">
                    زمان بازگشت به پیگیری
                    <PersianDateTimePicker
                      value={nextReviewAt}
                      onChange={(value) => updateDraft({ nextReviewAt: value })}
                      placeholder="تاریخ و ساعت پیگیری بعدی"
                    />
                  </label>
                ) : null}
                <label className="grid gap-2 text-sm font-semibold">
                  دلیل یا یادداشت
                  <textarea
                    value={reason}
                    onChange={(event) =>
                      updateDraft({ reason: event.target.value })
                    }
                    rows={3}
                    maxLength={500}
                    className="min-h-24 resize-y rounded-xl border border-input bg-background px-3 py-2 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="مثلاً بودجه مشتری در فصل بعدی تأمین می‌شود"
                  />
                </label>
              </div>
            </FormSection>
          </FormDialogBody>
          <FormDialogFooter>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                انصراف
              </Button>
              <Button
                type="submit"
                disabled={pending || (needsDate && !nextReviewAt)}
              >
                ذخیره وضعیت
              </Button>
            </div>
          </FormDialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
