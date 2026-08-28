import type { ComponentProps, ReactNode } from "react"
import { uiText } from "@/config/uiText"
import { PaginationControls } from "./PaginationControls"
import { LoadingState } from "./LoadingState"
import { EmptyState } from "./EmptyState"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

type DataTableColumn<Row> = {
  id: string
  header: ReactNode
  cell: (row: Row) => ReactNode
  className?: string
  headerClassName?: string
}

export function DataTableShell<Row>({
  rows,
  columns,
  getRowKey,
  emptyState,
  onRowClick,
  caption = uiText.common.table.caption,
  entityRows = true,
  renderRowActions,
  pagination,
  loading = false,
}: {
  rows: Row[]
  columns: DataTableColumn<Row>[]
  getRowKey: (row: Row) => string
  emptyState?: ReactNode
  onRowClick?: (row: Row) => void
  caption?: string
  entityRows?: boolean
  renderRowActions?: (row: Row) => ReactNode
  pagination?: ComponentProps<typeof PaginationControls>
  loading?: boolean
}) {
  const tableColumns = renderRowActions
    ? [
        ...columns.filter((column) => column.id !== "actions"),
        {
          id: "actions",
          header: uiText.common.filters.actions,
          cell: renderRowActions,
          className: "w-24",
        },
      ]
    : columns
  if (loading) return <LoadingState />

  return (
    <div className="grid min-w-0 gap-3">
      <div className="min-w-0 overflow-hidden rounded-[var(--app-radius-card)] border border-[var(--app-divider)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)]">
        {!rows.length ? (
          (emptyState ?? (
            <EmptyState
              title={uiText.common.table.noResults}
              description={uiText.common.table.noResultsDescription}
            />
          ))
        ) : (
          <Table className="min-w-max">
            <caption className="sr-only">{caption}</caption>
            <TableHeader className="bg-[var(--app-background)]/70">
              <TableRow className="hover:bg-transparent">
                {tableColumns.map((column) => (
                  <TableHead
                    key={column.id}
                    scope="col"
                    className={[
                      "h-[var(--app-table-header-height)] px-[var(--app-table-cell-padding)] text-xs font-bold text-[var(--app-primary-alt)]",
                      column.headerClassName ?? "",
                    ].join(" ")}
                  >
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={getRowKey(row)}
                  className={[
                    "border-[var(--app-divider)] hover:bg-[var(--app-background)]/55",
                    entityRows ? "h-[var(--app-table-row-height)]" : "h-12",
                    onRowClick ? "cursor-pointer" : "",
                  ].join(" ")}
                  onClick={() => onRowClick?.(row)}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={(event) => {
                    if (
                      event.target === event.currentTarget &&
                      onRowClick &&
                      (event.key === "Enter" || event.key === " ")
                    ) {
                      event.preventDefault()
                      onRowClick(row)
                    }
                  }}
                >
                  {tableColumns.map((column) => (
                    <TableCell
                      key={column.id}
                      className={[
                        "px-[var(--app-table-cell-padding)] py-3 text-sm text-[var(--app-heading)]",
                        entityRows ? "leading-5 whitespace-nowrap" : "",
                        column.className ?? "",
                      ].join(" ")}
                    >
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      {pagination ? <PaginationControls {...pagination} /> : null}
    </div>
  )
}

export type { DataTableColumn }
