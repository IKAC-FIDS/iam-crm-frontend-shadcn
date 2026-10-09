import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  Activity,
  BriefcaseBusiness,
  Building2,
  Eye,
  ListPlus,
  MessageSquareText,
  Layers3,
  Pin,
  PinOff,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  DataTableShell,
  type DataTableColumn,
} from "@/components/shared/DataTableShell"
import { EmptyState } from "@/components/shared/EmptyState"
import {
  EntityRowActions,
  type EntityAction,
} from "@/components/shared/EntityRowActions"
import { EntityTableCell } from "@/components/shared/EntityTableCell"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { CompanyAvatar } from "@/features/companies/components/CompanyAvatar"
import { companyPriorityTone } from "@/features/companies/utils/companyPresentation"
import { getActivityTypeLabel } from "@/features/activities/utils/activityDisplay"
import type {
  OperationsCompanyRow,
  OperationsCompaniesPage,
} from "../types/operations.types"
import {
  attentionPresentation,
  engagementLabels,
  formatRelativeOperationTime,
  priorityLabels,
} from "../utils/operationsFormatters"

export type OperationsRowAction =
  | "task"
  | "opportunity"
  | "activity"
  | "conversation"
  | "opportunities"
  | "activity-detail"
  | "engagement"
  | "pin"

export function OperationsCompanyList({
  page,
  pageSize,
  result,
  permissions,
  fetching,
  filtered,
  allowPersonalization = true,
  onPageChange,
  onPageSizeChange,
  onAction,
}: {
  page: number
  pageSize: number
  result?: OperationsCompaniesPage
  permissions: readonly string[]
  fetching: boolean
  filtered: boolean
  allowPersonalization?: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onAction: (action: OperationsRowAction, row: OperationsCompanyRow) => void
}) {
  const navigate = useNavigate()
  const rows = result?.data ?? []
  const nextAction = (row: OperationsCompanyRow) =>
    row.nextAction ??
    (row.tasks.next?.dueAt
      ? {
          type: "TASK" as const,
          id: row.tasks.next.id,
          title: row.tasks.next.title,
          at: row.tasks.next.dueAt,
        }
      : null)
  const actionsFor = (row: OperationsCompanyRow): EntityAction[] => [
    {
      id: "view",
      label: "مشاهده شرکت",
      icon: Eye,
      onClick: () => navigate(`/companies/${row.company.id}`),
    },
    {
      id: "engagement",
      label: "تغییر وضعیت سبد فروش",
      icon: Layers3,
      visible: permissions.includes("company:update"),
      onClick: () => onAction("engagement", row),
    },
    {
      id: "pin",
      label: row.company.isPinned ? "برداشتن از مهم‌ها" : "افزودن به مهم‌ها",
      icon: row.company.isPinned ? PinOff : Pin,
      visible: allowPersonalization,
      onClick: () => onAction("pin", row),
    },
    {
      id: "task",
      label: "ایجاد کار",
      icon: ListPlus,
      visible: permissions.includes("task:create"),
      onClick: () => onAction("task", row),
    },
    {
      id: "activity",
      label: "ثبت فعالیت",
      icon: Activity,
      visible: permissions.includes("activity:create"),
      onClick: () => onAction("activity", row),
    },
    {
      id: "conversation",
      label: "گفتگوها",
      icon: MessageSquareText,
      onClick: () => onAction("conversation", row),
    },
    {
      id: "opportunity",
      label: "ایجاد فرصت",
      icon: BriefcaseBusiness,
      visible: permissions.includes("opportunity:create"),
      onClick: () => onAction("opportunity", row),
    },
  ]
  const columns = useMemo<DataTableColumn<OperationsCompanyRow>[]>(
    () => [
      {
        id: "company",
        header: "شرکت",
        cell: (row) => (
          <EntityTableCell
            title={row.company.legalName}
            subtitle={
              row.company.brandName !== row.company.legalName
                ? row.company.brandName
                : undefined
            }
            avatar={
              <CompanyAvatar
                name={row.company.brandName || row.company.legalName}
                companyId={row.company.id}
                hasLogo={Boolean(row.company.logoObjectKey)}
              />
            }
          />
        ),
      },
      {
        id: "portfolio",
        header: "سبد فروش",
        cell: (row) => (
          <div className="flex items-center gap-1.5">
            {row.company.isPinned ? (
              <Pin className="size-3.5 fill-current text-[var(--app-primary)]" />
            ) : null}
            <StatusBadge
              tone={
                row.company.engagementStatus === "ACTIVE"
                  ? "success"
                  : row.company.engagementStatus === "NEEDS_ACTION"
                    ? "warning"
                    : row.company.engagementStatus === "DISQUALIFIED"
                      ? "danger"
                      : "neutral"
              }
            >
              {engagementLabels[row.company.engagementStatus]}
            </StatusBadge>
          </div>
        ),
      },
      {
        id: "priority",
        header: "اولویت",
        cell: (row) => (
          <StatusBadge tone={companyPriorityTone[row.company.priority]}>
            {priorityLabels[row.company.priority]}
          </StatusBadge>
        ),
      },
      {
        id: "opportunities",
        header: "فرصت‌های فعال",
        cell: (row) => (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={
              !row.activeOpportunities.count ||
              !permissions.includes("opportunity:view")
            }
            onClick={(event) => {
              event.stopPropagation()
              onAction("opportunities", row)
            }}
          >
            <BriefcaseBusiness className="size-4" />
            {row.activeOpportunities.count.toLocaleString("fa-IR")}
          </Button>
        ),
      },
      {
        id: "next",
        header: "اقدام بعدی",
        className: "min-w-52",
        cell: (row) => {
          const next = nextAction(row)
          return next ? (
            <button
              type="button"
              className="max-w-52 text-start hover:text-[var(--app-primary)] hover:underline"
              onClick={(event) => {
                event.stopPropagation()
                navigate(
                  `/${next.type === "TASK" ? "tasks" : "meetings"}/${next.id}`
                )
              }}
            >
              <span className="block truncate font-semibold">{next.title}</span>
              <span className="text-xs text-muted-foreground">
                {formatRelativeOperationTime(next.at)}
              </span>
            </button>
          ) : (
            <span className="text-xs text-muted-foreground">ثبت نشده</span>
          )
        },
      },
      {
        id: "attention",
        header: "وضعیت",
        cell: (row) => (
          <StatusBadge tone={attentionPresentation[row.attention.state].tone}>
            {attentionPresentation[row.attention.state].label}
          </StatusBadge>
        ),
      },
      {
        id: "activity",
        header: "آخرین تعامل",
        className: "min-w-44",
        cell: (row) =>
          row.lastActivity ? (
            <button
              type="button"
              className="text-start hover:text-[var(--app-primary)] hover:underline"
              onClick={(event) => {
                event.stopPropagation()
                onAction("activity-detail", row)
              }}
            >
              <span className="font-semibold">
                {getActivityTypeLabel(row.lastActivity.type)}
              </span>
              <span className="text-xs text-muted-foreground">
                {" "}
                · {formatRelativeOperationTime(row.lastActivity.occurredAt)}
              </span>
            </button>
          ) : (
            <span className="text-xs text-muted-foreground">
              تعامل ثبت نشده
            </span>
          ),
      },
      {
        id: "messages",
        header: "پیام",
        cell: (row) => (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="relative"
            aria-label={`گفتگوهای ${row.company.legalName}`}
            onClick={(event) => {
              event.stopPropagation()
              onAction("conversation", row)
            }}
          >
            <MessageSquareText className="size-4" />
            {row.conversation.unreadCount ? (
              <span className="absolute -end-1 -top-1 min-w-4 rounded-full bg-destructive px-1 text-[10px] text-white">
                {row.conversation.unreadCount.toLocaleString("fa-IR")}
              </span>
            ) : null}
          </Button>
        ),
      },
    ],
    [navigate, onAction, permissions]
  )

  return (
    <DataTableShell
      rows={rows}
      columns={columns}
      getRowKey={(row) => row.company.id}
      caption="شرکت‌های عملیاتی"
      loading={fetching && !result}
      onRowClick={(row) => navigate(`/companies/${row.company.id}`)}
      renderRowActions={(row) => <EntityRowActions actions={actionsFor(row)} />}
      emptyState={
        <EmptyState
          icon={Building2}
          title={
            filtered
              ? "شرکتی با این فیلتر پیدا نشد"
              : "شرکتی برای عملیات روزانه ندارید"
          }
          description={
            filtered
              ? "فیلترها را تغییر دهید یا پاک کنید."
              : "پس از تخصیص شرکت‌ها، موارد عملیاتی اینجا نمایش داده می‌شوند."
          }
        />
      }
      mobile={{
        title: (row) => row.company.brandName || row.company.legalName,
        subtitle: (row) => row.company.legalName,
        avatar: (row) => (
          <CompanyAvatar
            name={row.company.brandName || row.company.legalName}
            companyId={row.company.id}
            hasLogo={Boolean(row.company.logoObjectKey)}
          />
        ),
        status: (row) => (
          <StatusBadge tone={attentionPresentation[row.attention.state].tone}>
            {attentionPresentation[row.attention.state].label}
          </StatusBadge>
        ),
        fields: [
          {
            id: "portfolio",
            label: "سبد فروش",
            render: (row) => engagementLabels[row.company.engagementStatus],
          },
          {
            id: "opportunities",
            label: "فرصت فعال",
            render: (row) =>
              row.activeOpportunities.count.toLocaleString("fa-IR"),
          },
          {
            id: "next",
            label: "اقدام بعدی",
            render: (row) => nextAction(row)?.title ?? "ثبت نشده",
          },
          {
            id: "activity",
            label: "آخرین تعامل",
            render: (row) =>
              row.lastActivity
                ? `${getActivityTypeLabel(row.lastActivity.type)} · ${formatRelativeOperationTime(row.lastActivity.occurredAt)}`
                : "ثبت نشده",
          },
        ],
      }}
      pagination={{
        page: result?.meta.page ?? page,
        pageCount: result?.meta.totalPages ?? 1,
        pageSize,
        total: result?.meta.total,
        disabled: fetching,
        onPageChange,
        onPageSizeChange,
      }}
    />
  )
}
