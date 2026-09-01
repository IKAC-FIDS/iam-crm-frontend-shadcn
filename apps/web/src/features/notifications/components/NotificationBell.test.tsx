import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { expect, it, vi } from "vitest"

import { NotificationBell } from "./NotificationBell"

vi.mock("../hooks/useNotifications", () => ({
  useUnreadCount: () => ({ data: 3 }),
}))

it("keeps the header notification shortcut alongside full navigation", () => {
  render(<MemoryRouter><NotificationBell enabled /></MemoryRouter>)
  expect(screen.getByRole("button", { name: "اعلان‌ها" })).toBeInTheDocument()
  expect(screen.getByText("3")).toBeInTheDocument()
})
