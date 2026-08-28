import type { ReactNode } from "react"
import { uiText } from "@/config/uiText"

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
}: {
  rows: Row[]
  columns: DataTableColumn<Row>[]
  getRowKey: (row: Row) => string
  emptyState?: ReactNode
  onRowClick?: (row: Row) => void
  caption?: string
}) {
  if (!rows.length && emptyState) {
    return <>{emptyState}</>
  }

  return (
    <div className="min-w-0 overflow-x-auto rounded-[var(--app-radius-card)] border border-[var(--app-divider)] bg-[var(--app-surface)]">
      <Table className="min-w-max">
        <caption className="sr-only">{caption}</caption>
        <TableHeader className="bg-[var(--app-background)]/70">
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => (
              <TableHead
                key={column.id}
                scope="col"
                className={[
                  "h-11 px-4 text-xs font-bold text-[var(--app-primary-alt)]",
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
                "h-12 border-[var(--app-divider)] hover:bg-[var(--app-background)]/55",
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
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  className={[
                    "px-4 py-3 text-sm text-[var(--app-heading)]",
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
    </div>
  )
}

export type { DataTableColumn }
