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

it("combines operations and management and groups related routes", async () => {
  render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <AppTopNavigation />
    </MemoryRouter>
  )

  const labels = [
    "عملیات و مدیریت",
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
    screen.getByRole("button", { name: "عملیات و مدیریت" })
  )
  expect(await screen.findByText("فروش و ارتباط با مشتری")).toBeInTheDocument()
  expect(screen.getByText("برنامه‌ریزی و پیگیری")).toBeInTheDocument()
  expect(screen.getByText("مرکز فنی")).toBeInTheDocument()
  expect(screen.getByText("سازمان و دسترسی‌ها")).toBeInTheDocument()
  expect(
    await screen.findByRole("menuitem", {
      name: new RegExp(uiText.navigation.meetings),
    })
  ).toBeInTheDocument()

  expect(
    await screen.findByRole("menuitem", {
      name: new RegExp(uiText.navigation.companies),
    })
  ).toBeInTheDocument()
  expect(screen.queryByRole("button", { name: uiText.navigation.groups.sales })).toBeNull()
  expect(screen.queryByRole("button", { name: uiText.navigation.groups.technical })).toBeNull()
  expect(screen.queryByRole("button", { name: uiText.navigation.groups.management })).toBeNull()
})
