import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, expect, it } from "vitest"

import { uiText } from "@/config/uiText"
import { useAuthStore } from "@/store/authStore"
import { user } from "@/test/fixtures"

import { AppTopNavigation } from "./AppTopNavigation"

beforeEach(() => {
  useAuthStore.setState({
    user: {
      ...user,
      permissions: [
        "company:view",
        "technical-release:view",
        "user:view",
        "meeting:view",
      ],
    },
    status: "authenticated",
  })
})

it("renders every navigation group as a menu option and keeps meetings at the desktop end", async () => {
  render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <AppTopNavigation />
    </MemoryRouter>
  )

  const labels = [
    uiText.navigation.groups.sales,
    uiText.navigation.groups.technical,
    uiText.navigation.groups.management,
    uiText.navigation.groups.account,
  ]
  labels.forEach((label) =>
    expect(screen.getByRole("button", { name: label })).toBeInTheDocument()
  )
  expect(screen.queryByRole("button", { name: "همه بخش‌ها" })).toBeNull()

  const meetings = screen.getByRole("button", {
    name: uiText.navigation.meetings,
  })
  expect(meetings).toHaveClass("ms-auto")

  await userEvent.click(
    screen.getByRole("button", { name: uiText.navigation.groups.sales })
  )
  expect(
    await screen.findByRole("menuitem", {
      name: new RegExp(uiText.navigation.companies),
    })
  ).toBeInTheDocument()
})
