import {
  Activity,
  BriefcaseBusiness,
  ListPlus,
  MessageSquareText,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { CompanyAvatar } from "@/features/companies/components/CompanyAvatar"
import { companyPriorityTone } from "@/features/companies/utils/companyPresentation"
import { getActivityTypeLabel } from "@/features/activities/utils/activityDisplay"
import type { OperationsCompanyRow as OperationsCompanyRowType } from "../types/operations.types"
import {
  attentionPresentation,
  formatRelativeOperationTime,
  priorityLabels,
} from "../utils/operationsFormatters"

export type RowAction = "task" | "opportunity" | "activity" | "conversation"

function ActionButton({
  label,
  icon: Icon,
  onClick,
  badge,
}: {
  label: string
  icon: LucideIcon
  onClick: () => void
  badge?: number
}) {
  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      className="relative size-9 rounded-xl"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      <Icon className="size-4" />
      {badge ? (
        <span className="absolute -end-1 -top-1 min-w-4 rounded-full bg-[var(--destructive)] px-1 text-[10px] leading-4 text-white">
          {badge.toLocaleString("fa-IR")}
        </span>
      ) : null}
    </Button>
  )
}

export function OperationsCompanyRow({
  row,
  permissions,
  onAction,
}: {
  row: OperationsCompanyRowType
  permissions: readonly string[]
  onAction: (action: RowAction, row: OperationsCompanyRowType) => void
}) {
  const attention = attentionPresentation[row.attention.state]
  const next =
    row.nextAction ??
    (row.tasks.next?.dueAt
      ? {
          type: "TASK" as const,
          id: row.tasks.next.id,
          title: row.tasks.next.title,
          at: row.tasks.next.dueAt,
        }
      : null)
  const actions = (
    <div
      className="flex shrink-0 items-center gap-1"
      aria-label={`عملیات ${row.company.legalName}`}
    >
      {permissions.includes("task:create") ? (
        <ActionButton
          label={`ایجاد کار برای ${row.company.legalName}`}
          icon={ListPlus}
          onClick={() => onAction("task", row)}
        />
      ) : null}
      {permissions.includes("activity:create") ? (
        <ActionButton
          label={`ثبت فعالیت برای ${row.company.legalName}`}
          icon={Activity}
          onClick={() => onAction("activity", row)}
        />
      ) : null}
      <ActionButton
        label={`گفتگوی ${row.company.legalName}`}
        icon={MessageSquareText}
        badge={row.conversation.unreadCount}
        onClick={() => onAction("conversation", row)}
      />
      {permissions.includes("opportunity:create") ? (
        <ActionButton
          label={`ایجاد فرصت برای ${row.company.legalName}`}
          icon={BriefcaseBusiness}
          onClick={() => onAction("opportunity", row)}
        />
      ) : null}
    </div>
  )
  return (
    <article
      data-testid="operations-company-row"
      className={cn(
        "rounded-2xl border border-[var(--app-divider)] bg-[var(--app-surface)] p-4 transition hover:border-[var(--app-primary)]/30",
        row.attention.state === "OVERDUE" &&
          "border-s-4 border-s-[var(--destructive)]",
        row.attention.state === "NO_NEXT_ACTION" &&
          "border-s-4 border-s-[var(--warning)]"
      )}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(220px,1.5fr)_110px_120px_minmax(190px,1.2fr)_125px_minmax(150px,1fr)_auto] lg:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <CompanyAvatar
            name={row.company.brandName || row.company.legalName}
            companyId={row.company.id}
            hasLogo={Boolean(row.company.logoObjectKey)}
          />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-[var(--app-heading)]">
              {row.company.legalName}
            </h3>
            {row.company.brandName &&
            row.company.brandName !== row.company.legalName ? (
              <p className="mt-1 truncate text-xs text-[var(--app-text-secondary)]">
                {row.company.brandName}
              </p>
            ) : null}
          </div>
        </div>
        <div>
          <span className="mb-1 block text-[11px] text-[var(--app-text-secondary)] lg:hidden">
            اولویت
          </span>
          <StatusBadge tone={companyPriorityTone[row.company.priority]}>
            {priorityLabels[row.company.priority]}
          </StatusBadge>
        </div>
        <details className="relative">
          <summary className="cursor-pointer list-none">
            <span className="mb-1 block text-[11px] text-[var(--app-text-secondary)] lg:hidden">
              فرصت‌های فعال
            </span>
            <StatusBadge
              tone={row.activeOpportunities.count ? "success" : "neutral"}
              icon={BriefcaseBusiness}
              dot={false}
            >
              {row.activeOpportunities.count.toLocaleString("fa-IR")} فرصت
            </StatusBadge>
          </summary>
          {row.activeOpportunities.items.length ? (
            <div className="z-10 mt-2 grid min-w-64 gap-2 rounded-xl border border-[var(--app-divider)] bg-[var(--app-background)] p-3 shadow-lg lg:absolute">
              <strong className="text-xs">فرصت‌های فعال</strong>
              {row.activeOpportunities.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 text-xs"
                >
                  <span className="truncate">{item.title}</span>
                  <StatusBadge size="xs" tone="info">
                    {item.stage.label}
                  </StatusBadge>
                </div>
              ))}
            </div>
          ) : null}
        </details>
        <div className="min-w-0">
          <span className="mb-1 block text-[11px] text-[var(--app-text-secondary)]">
            اقدام بعدی
          </span>
          {next ? (
            <>
              <p className="truncate text-sm font-semibold">{next.title}</p>
              <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                {formatRelativeOperationTime(next.at)}
              </p>
            </>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-[var(--app-text-secondary)]">
                ثبت نشده
              </span>
              {row.attention.state === "NO_NEXT_ACTION" &&
              permissions.includes("task:create") ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-lg text-xs text-[var(--warning)]"
                  onClick={() => onAction("task", row)}
                >
                  ایجاد پیگیری
                </Button>
              ) : null}
            </div>
          )}
        </div>
        <div>
          <span className="mb-1 block text-[11px] text-[var(--app-text-secondary)] lg:hidden">
            وضعیت
          </span>
          <StatusBadge tone={attention.tone}>{attention.label}</StatusBadge>
        </div>
        <div className="min-w-0">
          <span className="mb-1 block text-[11px] text-[var(--app-text-secondary)]">
            آخرین تعامل
          </span>
          {row.lastActivity ? (
            <p className="truncate text-xs">
              <span className="font-semibold">
                {getActivityTypeLabel(row.lastActivity.type)}
              </span>
              <span className="text-[var(--app-text-secondary)]">
                {" "}
                · {formatRelativeOperationTime(row.lastActivity.occurredAt)}
              </span>
            </p>
          ) : (
            <span className="text-xs text-[var(--app-text-secondary)]">
              تعامل ثبت نشده
            </span>
          )}
        </div>
        <div className="border-t border-[var(--app-divider)] pt-3 lg:border-0 lg:pt-0">
          {actions}
        </div>
      </div>
    </article>
  )
}
