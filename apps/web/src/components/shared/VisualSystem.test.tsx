import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { expect, it, vi } from "vitest"
import { Eye, Pencil, Trash2, Plus } from "lucide-react"
import { MemoryRouter } from "react-router-dom"
import { EntityRowActions } from "./EntityRowActions"
import { PageHero } from "./PageHero"
import { DataTableShell } from "./DataTableShell"
import { DataTableToolbar } from "./DataTableToolbar"
import { uiText } from "@/config/uiText"

it("Hero omits absent actions and supports composed secondary and primary actions", async () => {
  const create = vi.fn()
  const { rerender } = render(
    <MemoryRouter initialEntries={["/companies"]}>
      <PageHero title="عنوان" description="توضیحات صفحه" />
    </MemoryRouter>
  )
  expect(screen.queryByRole("button", { name: "ایجاد" })).not.toBeInTheDocument()
  expect(screen.queryByRole("button", { name: "خروجی" })).not.toBeInTheDocument()
  rerender(
    <MemoryRouter initialEntries={["/companies"]}>
      <PageHero
        title="عنوان"
        description="توضیحات صفحه"
        primaryAction={{ label: "ایجاد", icon: Plus, onClick: create }}
        actions={<button>خروجی</button>}
      />
    </MemoryRouter>
  )
  await userEvent.click(screen.getByRole("button", { name: "ایجاد" }))
  expect(create).toHaveBeenCalledOnce()
  expect(screen.getByRole("button", { name: "خروجی" })).toBeInTheDocument()
})
it("Row actions hide unauthorized operations and render view/edit using the same controls", async () => {
  const view = vi.fn(),
    edit = vi.fn()
  render(
    <EntityRowActions
      actions={[
        { id: "view", label: "مشاهده", icon: Eye, onClick: view },
        { id: "edit", label: "ویرایش", icon: Pencil, onClick: edit },
        {
          id: "delete",
          label: "حذف",
          icon: Trash2,
          onClick: vi.fn(),
          enabled: false,
        },
      ]}
    />
  )
  expect(
    screen.queryByRole("button", { name: uiText.common.moreActions })
  ).not.toBeInTheDocument()
  expect(screen.queryByText("حذف")).not.toBeInTheDocument()
  await userEvent.click(screen.getByRole("button", { name: "مشاهده" }))
  await userEvent.click(screen.getByRole("button", { name: "ویرایش" }))
  expect(view).toHaveBeenCalledOnce()
  expect(edit).toHaveBeenCalledOnce()
})
it("Destructive overflow action requires confirmation and preserves cancellation", async () => {
  const remove = vi.fn().mockResolvedValue(undefined)
  render(
    <EntityRowActions
      actions={[
        {
          id: "delete",
          label: "حذف",
          icon: Trash2,
          onClick: remove,
          tone: "danger",
          confirmation: { title: "حذف مورد", description: "مطمئن هستید؟" },
        },
      ]}
    />
  )
  await userEvent.click(
    screen.getByRole("button", { name: uiText.common.moreActions })
  )
  await userEvent.click(await screen.findByRole("menuitem", { name: "حذف" }))
  expect(remove).not.toHaveBeenCalled()
  await userEvent.click(
    screen.getByRole("button", { name: uiText.common.cancel })
  )
  expect(remove).not.toHaveBeenCalled()
  await userEvent.click(
    screen.getByRole("button", { name: uiText.common.moreActions })
  )
  await userEvent.click(await screen.findByRole("menuitem", { name: "حذف" }))
  await userEvent.click(
    screen.getByRole("button", { name: uiText.common.confirm })
  )
  expect(remove).toHaveBeenCalledOnce()
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  )
})
it("DataTable composes custom actions, canonical paging, loading and empty states", async () => {
  const changePage = vi.fn(),
    open = vi.fn()
  const props = {
    rows: [{ id: "1", name: "نمونه" }],
    columns: [
      {
        id: "name",
        header: "نام",
        cell: (row: { id: string; name: string }) => row.name,
      },
    ],
    getRowKey: (row: { id: string }) => row.id,
  }
  const { rerender } = render(
    <DataTableShell
      {...props}
      renderRowActions={() => <EntityRowActions onView={open} />}
      pagination={{
        page: 1,
        pageCount: 2,
        onPageChange: changePage,
        pageSize: 20,
        onPageSizeChange: vi.fn(),
        total: 30,
      }}
    />
  )
  expect(screen.getByRole("table")).toHaveTextContent("نمونه")
  await userEvent.click(
    screen.getByRole("button", { name: uiText.common.view })
  )
  expect(open).toHaveBeenCalledOnce()
  await userEvent.click(
    screen.getByRole("button", { name: uiText.common.pagination.next })
  )
  expect(changePage).toHaveBeenCalledWith(2)
  rerender(<DataTableShell {...props} loading />)
  expect(screen.getByRole("status")).toBeInTheDocument()
  rerender(<DataTableShell {...props} rows={[]} />)
  expect(screen.getByText(uiText.common.table.noResults)).toBeInTheDocument()
})
it("Toolbar has no empty search/filter controls and exposes reset only for active filters", async () => {
  const reset = vi.fn()
  const { rerender } = render(
    <DataTableToolbar actions={<button>خروجی</button>} />
  )
  expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
  expect(
    screen.queryByText(uiText.common.table.clearFilters)
  ).not.toBeInTheDocument()
  rerender(
    <DataTableToolbar
      searchValue="نمونه"
      onSearchChange={vi.fn()}
      hasActiveFilters
      onClearFilters={reset}
    />
  )
  await userEvent.click(
    screen.getByRole("button", { name: uiText.common.table.clearFilters })
  )
  expect(reset).toHaveBeenCalledOnce()
})
