import { Building2 } from "lucide-react"
import { EmptyState } from "@/components/shared/EmptyState"
import { PaginationControls } from "@/components/shared/PaginationControls"
import type {
  OperationsCompanyRow as OperationsCompanyRowType,
  OperationsCompaniesPage,
} from "../types/operations.types"
import { OperationsCompanyRow, type RowAction } from "./OperationsCompanyRow"

export function OperationsCompanyList({
  page,
  pageSize,
  result,
  permissions,
  fetching,
  filtered,
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
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onAction: (action: RowAction, row: OperationsCompanyRowType) => void
}) {
  const rows = result?.data ?? []
  if (!rows.length)
    return (
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
    )
  return (
    <div className="grid min-w-0 gap-3">
      <div className="hidden grid-cols-[minmax(220px,1.5fr)_110px_120px_minmax(190px,1.2fr)_125px_minmax(150px,1fr)_auto] gap-4 px-4 text-xs font-semibold text-[var(--app-text-secondary)] lg:grid">
        <span>شرکت</span>
        <span>اولویت</span>
        <span>فرصت</span>
        <span>اقدام بعدی</span>
        <span>وضعیت</span>
        <span>آخرین تعامل</span>
        <span>عملیات</span>
      </div>
      <div className="grid gap-2.5">
        {rows.map((row) => (
          <OperationsCompanyRow
            key={row.company.id}
            row={row}
            permissions={permissions}
            onAction={onAction}
          />
        ))}
      </div>
      <PaginationControls
        page={result?.meta.page ?? page}
        pageCount={result?.meta.totalPages ?? 1}
        pageSize={pageSize}
        total={result?.meta.total}
        disabled={fetching}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  )
}
