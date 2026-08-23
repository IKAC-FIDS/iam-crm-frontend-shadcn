import {
  Building2,
  CalendarClock,
  Pencil,
  UserRound,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import {
  ACTIVITY_TYPE_OPTIONS,
  type Activity,
} from "../types/activity.types"

function formatDate(value?: string | null) {
  if (!value) return "—"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function typeLabel(activity: Activity) {
  return (
    ACTIVITY_TYPE_OPTIONS.find(
      (item) => item.value === activity.type
    )?.label || activity.type
  )
}

function companyLabel(activity: Activity) {
  return (
    activity.company?.brandName ||
    activity.company?.legalName ||
    "—"
  )
}

export function ActivityDetailDialog({
  activity,
  open,
  onOpenChange,
  canUpdate,
  onEdit,
}: {
  activity: Activity | null
  open: boolean
  onOpenChange: (open: boolean) => void
  canUpdate: boolean
  onEdit: () => void
}) {
  const navigate = useNavigate()

  if (!activity) return null

  const companyId =
    activity.companyId || activity.company?.id || ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="max-h-[90vh] w-full max-w-[calc(100%_-_1rem)] overflow-y-auto rounded-[26px] sm:max-w-[760px]"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            جزئیات فعالیت
          </DialogTitle>
          <DialogDescription>
            اطلاعات ثبت‌شده برای این تعامل با مشتری
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <section className="rounded-[20px] border border-[var(--app-divider)] bg-[var(--app-background)]/55 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="inline-flex rounded-full bg-[var(--app-primary-soft)] px-2.5 py-1 text-[10px] font-bold text-[var(--app-primary)]">
                  {typeLabel(activity)}
                </span>
                <h3 className="mt-3 text-base font-bold text-[var(--app-heading)]">
                  {activity.title ||
                    activity.outcome ||
                    typeLabel(activity)}
                </h3>
              </div>

              <span
                className={[
                  "rounded-full px-2.5 py-1 text-[10px] font-bold",
                  activity.status === "COMPLETED"
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "bg-slate-500/10 text-slate-700 dark:text-slate-300",
                ].join(" ")}
              >
                {activity.status === "COMPLETED"
                  ? "تکمیل‌شده"
                  : "ثبت‌شده"}
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Info
                icon={<Building2 className="size-4" />}
                label="شرکت"
                value={companyLabel(activity)}
              />
              <Info
                icon={<UserRound className="size-4" />}
                label="شخص"
                value={activity.person?.fullName || "—"}
              />
              <Info
                icon={<CalendarClock className="size-4" />}
                label="تاریخ فعالیت"
                value={formatDate(
                  activity.activityDate || activity.occurredAt
                )}
              />
              <Info
                icon={<CalendarClock className="size-4" />}
                label="تاریخ ایجاد"
                value={formatDate(activity.createdAt)}
              />
              <Info
                label="ایجادکننده"
                value={
                  activity.createdBy?.fullName ||
                  activity.user?.fullName ||
                  "—"
                }
              />
              <Info
                label="مالک شرکت"
                value={activity.owner?.fullName || "—"}
              />
            </div>
          </section>

          <section className="rounded-[20px] border border-[var(--app-divider)] p-4">
            <h4 className="text-xs font-bold text-[var(--app-heading)]">
              نتیجه فعالیت
            </h4>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[var(--app-text-secondary)]">
              {activity.outcome?.trim() || "نتیجه‌ای ثبت نشده است."}
            </p>
          </section>

          <section className="rounded-[20px] border border-[var(--app-divider)] p-4">
            <h4 className="text-xs font-bold text-[var(--app-heading)]">
              یادداشت‌ها
            </h4>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[var(--app-text-secondary)]">
              {activity.notes?.trim() ||
                activity.description?.trim() ||
                "یادداشتی ثبت نشده است."}
            </p>
          </section>

          <div className="flex flex-wrap justify-end gap-2">
            {companyId ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false)
                  navigate(`/companies/${companyId}`)
                }}
              >
                <Building2 className="size-4" />
                مشاهده شرکت
              </Button>
            ) : null}

            {canUpdate && activity.type !== "STAGE_CHANGE" ? (
              <Button
                type="button"
                onClick={() => {
                  onOpenChange(false)
                  onEdit()
                }}
              >
                <Pencil className="size-4" />
                ویرایش فعالیت
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Info({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-[var(--app-divider)] bg-[var(--app-surface)] p-3">
      <div className="flex items-center gap-2 text-[10px] text-[var(--app-text-secondary)]">
        {icon}
        {label}
      </div>
      <div className="mt-1.5 text-sm font-bold text-[var(--app-heading)]">
        {value}
      </div>
    </div>
  )
}
