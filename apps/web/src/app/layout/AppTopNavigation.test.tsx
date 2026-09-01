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
        "task:view",
        "activity:view",
        "notification:view",
        "technical-release:view",
        "user:view",
        "meeting:view",
      ],
    },
    status: "authenticated",
  })
})

it("renders operations as a permission-aware group without a standalone meetings button", async () => {
  render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <AppTopNavigation />
    </MemoryRouter>
  )

  const labels = [
    uiText.navigation.groups.sales,
    uiText.navigation.groups.operations,
    uiText.navigation.groups.technical,
    uiText.navigation.groups.management,
    uiText.navigation.groups.account,
  ]
  labels.forEach((label) =>
    expect(screen.getByRole("button", { name: label })).toBeInTheDocument()
  )
  expect(screen.queryByRole("button", { name: "همه بخش‌ها" })).toBeNull()

  expect(
    screen.queryByRole("button", { name: uiText.navigation.meetings })
  ).toBeNull()

  await userEvent.click(
    screen.getByRole("button", { name: uiText.navigation.groups.operations })
  )
  expect(
    await screen.findByRole("menuitem", {
      name: new RegExp(uiText.navigation.meetings),
    })
  ).toBeInTheDocument()

  await userEvent.click(
    screen.getByRole("button", { name: uiText.navigation.groups.sales })
  )
  expect(
    await screen.findByRole("menuitem", {
      name: new RegExp(uiText.navigation.companies),
    })
  ).toBeInTheDocument()
})
