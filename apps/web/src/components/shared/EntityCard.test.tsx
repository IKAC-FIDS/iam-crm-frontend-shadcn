import { fireEvent, render, screen } from "@testing-library/react"
import { Eye, Pencil } from "lucide-react"
import { describe, expect, it, vi } from "vitest"

import { EntityCard } from "./EntityCard"

describe("EntityCard", () => {
  it("renders reusable identity, badges, owner, metadata and actions", () => {
    const open = vi.fn()
    const edit = vi.fn()
    const { container } = render(
      <EntityCard
        id="company-1"
        title="شرکت بسیار طولانی نمونه برای کنترل برش ایمن عنوان"
        subtitle="صنعت فناوری"
        initials="ش"
        badges={[{ id: "status", label: "فعال", tone: "success" }]}
        owner={{ name: "کاربر نمونه", role: "فروش" }}
        metadata={[{ id: "updated", label: "آخرین بروزرسانی", value: "۱ مهر ۱۴۰۵" }]}
        accentColor="#2563eb"
        actions={[
          { id: "view", label: "مشاهده", icon: Eye, onClick: open },
          { id: "edit", label: "ویرایش", icon: Pencil, onClick: edit },
        ]}
        onClick={open}
        ariaLabel="شرکت نمونه"
      />,
    )

    expect(screen.getByText("فعال")).toBeInTheDocument()
    expect(screen.getByText("کاربر نمونه")).toBeInTheDocument()
    expect(screen.getByText("۱ مهر ۱۴۰۵")).toBeInTheDocument()
    expect(container.querySelector('[data-entity-accent="true"]')).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "ویرایش" }))
    expect(edit).toHaveBeenCalledOnce()
    expect(open).not.toHaveBeenCalled()
  })

  it("supports missing owners, keyboard opening and archived state", () => {
    const open = vi.fn()
    const { container } = render(
      <EntityCard
        id="company-2"
        title="شرکت بدون مالک"
        ownerFallback="بدون مالک"
        archived
        onClick={open}
      />,
    )

    fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" })
    expect(open).toHaveBeenCalledOnce()
    expect(screen.getByText("بدون مالک")).toBeInTheDocument()
    expect(container.querySelector('[data-archived="true"]')).toBeInTheDocument()
  })

  it("does not expose hidden actions", () => {
    render(
      <EntityCard
        id="company-3"
        title="شرکت"
        actions={[{ id: "edit", label: "ویرایش", icon: Pencil, onClick: vi.fn(), visible: false }]}
      />,
    )
    expect(screen.queryByRole("button", { name: "ویرایش" })).not.toBeInTheDocument()
  })
})
