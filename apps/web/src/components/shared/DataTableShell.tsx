import type { ReactNode } from "react"

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
}: {
  rows: Row[]
  columns: DataTableColumn<Row>[]
  getRowKey: (row: Row) => string
  emptyState?: ReactNode
}) {
  if (!rows.length && emptyState) {
    return <>{emptyState}</>
  }

  return (
    <div className="overflow-hidden rounded-[var(--app-radius-card)] border border-[var(--app-divider)] bg-[var(--app-surface)]">
      <Table>
        <TableHeader className="bg-[var(--app-background)]/70">
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => (
              <TableHead
                key={column.id}
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
              className="h-12 border-[var(--app-divider)] hover:bg-[var(--app-background)]/55"
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
