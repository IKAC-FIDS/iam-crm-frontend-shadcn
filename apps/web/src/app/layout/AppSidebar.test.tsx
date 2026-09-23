import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, expect, it, vi } from "vitest"

import { SidebarProvider } from "@workspace/ui/components/sidebar"

import { useAuthStore } from "@/store/authStore"
import { user } from "@/test/fixtures"

import { AppSidebar } from "./AppSidebar"
import { MobileNavigation } from "./MobileNavigation"

beforeEach(() => {
  vi.stubGlobal("matchMedia", vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })))
  useAuthStore.setState({
    user: {
      ...user,
      permissions: ["company:view", "meeting:view", "user:view", "timesheet:view"],
    },
    status: "authenticated",
  })
})

function renderSidebar() {
  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />
      </SidebarProvider>
    </MemoryRouter>,
  )
}

it("opens the workspace flyout by click and closes it with Escape", async () => {
  const interaction = userEvent.setup()
  renderSidebar()

  const trigger = screen.getByRole("button", { name: "عملیات و مدیریت" })
  expect(trigger).toHaveAttribute("aria-expanded", "false")
  await interaction.click(trigger)

  expect(await screen.findByRole("dialog", { name: "عملیات و مدیریت" })).toBeInTheDocument()
  expect(screen.getByRole("link", { name: /شرکت‌ها/ })).toBeInTheDocument()
  expect(screen.queryByRole("link", { name: /نقش‌ها و مجوزها/ })).toBeNull()

  await interaction.keyboard("{Escape}")
  expect(screen.queryByRole("dialog", { name: "عملیات و مدیریت" })).toBeNull()
  expect(trigger).toHaveFocus()
})

it("closes the workspace flyout when its trigger is clicked again", async () => {
  const interaction = userEvent.setup()
  renderSidebar()
  const trigger = screen.getByRole("button", { name: "عملیات و مدیریت" })

  await interaction.click(trigger)
  await interaction.click(trigger)
  expect(screen.queryByRole("dialog", { name: "عملیات و مدیریت" })).toBeNull()
})

it("uses the same permission-aware navigation in the mobile drill-down", async () => {
  vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
    matches: true,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
  const interaction = userEvent.setup()
  render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <SidebarProvider defaultOpen={false}>
        <MobileNavigation />
        <AppSidebar />
      </SidebarProvider>
    </MemoryRouter>,
  )

  await interaction.click(screen.getByRole("button", { name: "باز کردن منوی اصلی" }))
  await interaction.click(await screen.findByRole("button", { name: "عملیات و مدیریت" }))
  expect(screen.getByRole("button", { name: "بازگشت به منوی اصلی" })).toBeInTheDocument()
  expect(screen.getByRole("link", { name: /جلسات/ })).toBeInTheDocument()
  expect(screen.queryByRole("link", { name: /نقش‌ها و مجوزها/ })).toBeNull()
})
