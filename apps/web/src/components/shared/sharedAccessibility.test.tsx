import { render } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import type { ReactNode } from "react"
import { axe, toHaveNoViolations } from "jest-axe"
import { expect, test } from "vitest"
import { Eye } from "lucide-react"

import { PageHero } from "./PageHero"
import { DataTableShell } from "./DataTableShell"
import { MobileEntityCard } from "./MobileEntityCard"
import { PaginationControls } from "./PaginationControls"
import { ResponsiveModal } from "./ResponsiveModal"
import { EntityRowActions } from "./EntityRowActions"

expect.extend(toHaveNoViolations)
const accessible = async (ui: ReactNode) => {
  const { container, unmount } = render(<MemoryRouter>{ui}</MemoryRouter>)
  expect(await axe(container)).toHaveNoViolations()
  unmount()
}

test("shared page and list primitives have no axe violations", async () => {
  await accessible(
    <PageHero
      title="شرکت‌ها"
      description="فهرست شرکت‌ها"
      primaryAction={{ label: "افزودن", onClick() {} }}
    />
  )
  await accessible(
    <DataTableShell
      rows={[{ id: "1", name: "نمونه" }]}
      columns={[{ id: "name", header: "نام", cell: (row) => row.name }]}
      getRowKey={(row) => row.id}
    />
  )
  await accessible(
    <MobileEntityCard
      row={{ name: "نمونه" }}
      config={{
        title: (row) => row.name,
        fields: [{ id: "status", label: "وضعیت", render: () => "فعال" }],
      }}
    />
  )
  await accessible(
    <PaginationControls
      page={1}
      pageCount={2}
      onPageChange={() => {}}
      total={20}
    />
  )
})

test("shared dialogs and action controls have no axe violations", async () => {
  await accessible(
    <ResponsiveModal open onClose={() => {}} title="ویرایش">
      <label htmlFor="name">نام</label>
      <input id="name" />
    </ResponsiveModal>
  )
  await accessible(
    <EntityRowActions
      actions={[{ id: "view", label: "مشاهده", icon: Eye, onClick() {} }]}
    />
  )
})
