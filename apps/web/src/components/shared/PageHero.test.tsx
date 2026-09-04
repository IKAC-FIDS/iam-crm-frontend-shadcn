import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ShieldCheck } from "lucide-react"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"
import type { ComponentProps } from "react"

import { PageHero } from "./PageHero"
import { PageHeader } from "./PageHeader"

function renderHero(props: Partial<ComponentProps<typeof PageHero>> = {}) {
  const onBack = vi.fn()
  const onRefresh = vi.fn()
  render(
    <MemoryRouter initialEntries={["/companies"]}>
      <PageHero
        title="شرکت‌ها"
        description="مدیریت حساب‌های مشتری"
        breadcrumbs={[{ label: "خانه", href: "/dashboard" }, { label: "شرکت‌ها" }]}
        accessBadge={{ label: "مدیریت مشتریان", icon: ShieldCheck }}
        onBack={onBack}
        onRefresh={onRefresh}
        {...props}
      />
    </MemoryRouter>
  )
  return { onBack, onRefresh }
}

describe("PageHero", () => {
  it("renders mandatory identity, navigation and accent elements", () => {
    renderHero()
    expect(screen.getByRole("heading", { name: "شرکت‌ها" })).toBeInTheDocument()
    expect(screen.getByText("مدیریت حساب‌های مشتری")).toBeInTheDocument()
    expect(screen.getByRole("navigation", { name: "مسیر صفحه" })).toBeInTheDocument()
    expect(screen.getByText("مدیریت مشتریان")).toBeInTheDocument()
    expect(screen.getByTestId("page-hero-accent")).toBeInTheDocument()
  })

  it("invokes back and refresh handlers", async () => {
    const user = userEvent.setup()
    const { onBack, onRefresh } = renderHero()
    await user.click(screen.getByRole("button", { name: "بازگشت" }))
    await user.click(screen.getByRole("button", { name: "به‌روزرسانی" }))
    expect(onBack).toHaveBeenCalledOnce()
    expect(onRefresh).toHaveBeenCalledOnce()
  })

  it("disables refresh and exposes its loading state", () => {
    renderHero({ refreshing: true })
    const refresh = screen.getByRole("button", { name: "به‌روزرسانی" })
    expect(refresh).toBeDisabled()
    expect(refresh.querySelector("svg")).toHaveClass("motion-safe:animate-spin")
  })

  it("renders optional actions and changes the active view", async () => {
    const user = userEvent.setup()
    const onPrimary = vi.fn()
    const onSecondary = vi.fn()
    const onViewChange = vi.fn()
    renderHero({
      primaryAction: { id: "create", label: "ایجاد", onClick: onPrimary },
      secondaryActions: [{ id: "export", label: "خروجی", onClick: onSecondary, variant: "outline" }],
      viewOptions: [{ id: "list", label: "فهرست" }, { id: "cards", label: "کارت" }],
      activeView: "list",
      onViewChange,
    })
    await user.click(screen.getByRole("button", { name: "ایجاد" }))
    await user.click(screen.getByRole("button", { name: "خروجی" }))
    await user.click(screen.getByRole("button", { name: "کارت" }))
    expect(onPrimary).toHaveBeenCalledOnce()
    expect(onSecondary).toHaveBeenCalledOnce()
    expect(onViewChange).toHaveBeenCalledWith("cards")
    expect(screen.getByRole("button", { name: "فهرست" })).toHaveAttribute("aria-pressed", "true")
  })

  it("omits optional regions when they are not configured", () => {
    renderHero()
    expect(screen.queryByRole("group", { name: "نوع نمایش" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "ایجاد" })).not.toBeInTheDocument()
  })

  it("keeps legacy detail pages on the same standard through PageHeader", () => {
    render(
      <MemoryRouter initialEntries={["/tasks/task-1"]}>
        <PageHeader title="پیگیری قرارداد" description="جزئیات کار" />
      </MemoryRouter>
    )
    expect(screen.getByRole("heading", { name: "پیگیری قرارداد" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "بازگشت" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "به‌روزرسانی" })).toBeInTheDocument()
  })
})
