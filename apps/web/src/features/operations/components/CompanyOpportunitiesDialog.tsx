import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { BriefcaseBusiness, CalendarDays } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { ResponsiveModal } from "@/components/shared/ResponsiveModal"
import { QueryContent } from "@/components/shared/QueryContent"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { formatJalaliDate } from "@/lib/date/jalali"
import { getOperationsCompanyOpportunities } from "../api/operations.api"
import type { OperationsCompanyRow } from "../types/operations.types"
import { operationsKeys } from "../hooks/useOperationsWorkspace"
import { priorityLabels } from "../utils/operationsFormatters"

export function CompanyOpportunitiesDialog({
  row,
  onClose,
}: {
  row: OperationsCompanyRow | null
  onClose: () => void
}) {
  const navigate = useNavigate()
  const query = useQuery({
    queryKey: [
      ...operationsKeys.companies(),
      row?.company.id,
      "active-opportunities",
    ],
    queryFn: () => getOperationsCompanyOpportunities(row!.company.id),
    enabled: Boolean(row),
  })
  return (
    <ResponsiveModal
      open={Boolean(row)}
      onClose={onClose}
      title={`فرصت‌های فعال ${row?.company.brandName || row?.company.legalName || "شرکت"}`}
      description="مرحله، اولویت و زمان مورد انتظار بستن فرصت‌ها"
      icon={BriefcaseBusiness}
      width="max-w-3xl"
    >
      <QueryContent query={query} errorTitle="دریافت فرصت‌های شرکت ناموفق بود">
        <div className="grid gap-2">
          {(query.data?.data ?? []).map((item) => (
            <button
              key={item.id}
              type="button"
              className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-[var(--app-divider)] p-3 text-start hover:border-[var(--app-primary)]/40 hover:bg-[var(--app-background)]"
              onClick={() => navigate(`/opportunities/${item.id}`)}
            >
              <span className="min-w-0">
                <strong className="block truncate">{item.title}</strong>
                <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <StatusBadge size="xs" tone="info">
                    {item.stage.label}
                  </StatusBadge>
                  <span>
                    {item.priority
                      ? priorityLabels[item.priority]
                      : "بدون اولویت"}
                  </span>
                  {item.expectedCloseDate ? (
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="size-3.5" />
                      {formatJalaliDate(item.expectedCloseDate)}
                    </span>
                  ) : null}
                </span>
              </span>
              <span className="text-xs font-bold text-[var(--app-primary)]">
                مشاهده جزئیات
              </span>
            </button>
          ))}
          {!query.isLoading && !query.data?.data.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              فرصت فعالی وجود ندارد.
            </p>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="mt-2"
            onClick={() =>
              navigate(`/opportunities?companyId=${row?.company.id ?? ""}`)
            }
          >
            مشاهده همه فرصت‌های شرکت
          </Button>
        </div>
      </QueryContent>
    </ResponsiveModal>
  )
}
