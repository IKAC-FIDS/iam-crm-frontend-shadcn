import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { expect, it, vi } from "vitest"
import { DataTableShell } from "./DataTableShell"
import { QueryContent } from "./QueryContent"
import { EmptyState } from "./EmptyState"
import { uiText } from "@/config/uiText"
import { httpError } from "@/test/fixtures"

const columns = [
  {
    id: "name",
    header: "نام",
    cell: (row: { id: string; name: string }) => row.name,
  },
]
const query = {
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
}
it("renders accessible loading without a misleading empty table", () => {
  render(
    <QueryContent query={{ ...query, isLoading: true }}>
      <DataTableShell rows={[]} columns={columns} getRowKey={(row) => row.id} />
    </QueryContent>
  )
  expect(
    screen.getByRole("status", { name: uiText.common.loading })
  ).toBeInTheDocument()
  expect(screen.queryByRole("table")).not.toBeInTheDocument()
})
it("renders empty content and safe retryable errors", async () => {
  const { rerender } = render(
    <DataTableShell
      rows={[]}
      columns={columns}
      getRowKey={(row) => row.id}
      emptyState={<EmptyState title="خالی" description="فیلتر را تغییر دهید" />}
    />
  )
  expect(screen.getByText("خالی")).toBeInTheDocument()
  rerender(
    <QueryContent
      query={{
        ...query,
        isError: true,
        error: httpError(500, { message: "SQL secret" }),
      }}
    >
      rows
    </QueryContent>
  )
  expect(screen.getByRole("alert")).toHaveTextContent(uiText.app.server)
  expect(screen.queryByText("SQL secret")).not.toBeInTheDocument()
  await userEvent.click(
    screen.getByRole("button", { name: uiText.common.retry })
  )
  expect(query.refetch).toHaveBeenCalled()
})
it("renders typed rows, overflow and keyboard navigation without swallowing action events", async () => {
  const open = vi.fn(),
    action = vi.fn()
  render(
    <DataTableShell
      caption="شرکت‌ها"
      rows={[{ id: "1", name: "نمونه" }]}
      columns={[
        ...columns,
        {
          id: "action",
          header: "عملیات",
          cell: () => (
            <button
              onClick={(event) => {
                event.stopPropagation()
                action()
              }}
            >
              ویرایش
            </button>
          ),
        },
      ]}
      getRowKey={(row) => row.id}
      onRowClick={open}
    />
  )
  const table = screen.getByRole("table", { name: "شرکت‌ها" })
  expect(table.closest('[data-slot="table-container"]')).toHaveClass(
    "overflow-x-auto"
  )
  const row = within(table).getAllByRole("row")[1]!
  row.focus()
  await userEvent.keyboard("{Enter}")
  expect(open).toHaveBeenCalledTimes(1)
  await userEvent.click(screen.getByRole("button", { name: "ویرایش" }))
  expect(action).toHaveBeenCalledTimes(1)
  expect(open).toHaveBeenCalledTimes(1)
})

it("renders one responsive mobile summary from the same rows and actions", async () => {
  const action = vi.fn()
  render(
    <DataTableShell
      rows={[{ id: "1", name: "شرکت نمونه", owner: "سارا" }]}
      columns={[
        { id: "name", header: "نام", cell: (row) => row.name },
        { id: "owner", header: "مسئول", cell: (row) => row.owner },
      ]}
      getRowKey={(row) => row.id}
      renderRowActions={() => <button onClick={action}>عملیات مشترک</button>}
      mobile={{
        title: (row) => row.name,
        subtitle: () => "زیرعنوان اختیاری",
        status: () => <span>فعال</span>,
        fields: [{ id: "owner", label: "مسئول", render: (row) => row.owner }],
      }}
    />
  )
  expect(screen.getAllByText("شرکت نمونه")).toHaveLength(2)
  expect(screen.getByText("زیرعنوان اختیاری")).toBeInTheDocument()
  expect(screen.getByText("فعال")).toBeInTheDocument()
  expect(screen.getAllByText("مسئول").some((node) => node.tagName === "DT")).toBe(true)
  expect(screen.getAllByRole("button", { name: "عملیات مشترک" })).toHaveLength(2)
  await userEvent.click(screen.getAllByRole("button", { name: "عملیات مشترک" })[1]!)
  expect(action).toHaveBeenCalledOnce()
})

it("keeps subtitle, status and actions optional in mobile cards", () => {
  render(
    <DataTableShell
      rows={[{ id: "1", name: "مورد ساده" }]}
      columns={columns}
      getRowKey={(row) => row.id}
      mobile={{ title: (row) => row.name, fields: [] }}
    />
  )
  expect(screen.getAllByText("مورد ساده")).toHaveLength(2)
  expect(screen.queryByRole("button")).not.toBeInTheDocument()
})
