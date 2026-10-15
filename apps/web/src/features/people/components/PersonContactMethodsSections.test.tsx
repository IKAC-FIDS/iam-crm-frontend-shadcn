import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { PersonContactsSection } from "./PersonContactsSection"
import { PersonSocialsSection } from "./PersonSocialsSection"

const mocks = vi.hoisted(() => ({
  contactsQuery: {
    data: [] as Array<Record<string, unknown>>,
    isLoading: false,
    isError: false,
    error: null as unknown,
    refetch: vi.fn(),
  },
  socialsQuery: {
    data: [] as Array<Record<string, unknown>>,
    isLoading: false,
    isError: false,
    error: null as unknown,
    refetch: vi.fn(),
  },
  mutation: {
    isPending: false,
    error: null as unknown,
    mutateAsync: vi.fn(),
  },
}))

vi.mock("../hooks/usePeople", () => ({
  usePersonContacts: () => mocks.contactsQuery,
  usePersonSocials: () => mocks.socialsQuery,
  useCreatePersonContact: () => mocks.mutation,
  useUpdatePersonContact: () => mocks.mutation,
  useDeletePersonContact: () => mocks.mutation,
  useCreatePersonSocial: () => mocks.mutation,
  useUpdatePersonSocial: () => mocks.mutation,
  useDeletePersonSocial: () => mocks.mutation,
}))

vi.mock("./PersonContactDialog", () => ({
  PersonContactDialog: () => null,
}))

vi.mock("./PersonSocialDialog", () => ({
  PersonSocialDialog: () => null,
}))

describe("People contact method sections", () => {
  beforeEach(() => {
    Object.assign(mocks.contactsQuery, {
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    })
    Object.assign(mocks.socialsQuery, {
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    })
    mocks.contactsQuery.refetch.mockReset()
    mocks.socialsQuery.refetch.mockReset()
  })

  it("uses the canonical loading and empty states for contact methods", () => {
    mocks.contactsQuery.isLoading = true
    const { rerender } = render(
      <PersonContactsSection personId="person-1" canEdit={false} />
    )

    expect(screen.getByRole("status")).toBeInTheDocument()

    mocks.contactsQuery.isLoading = false
    rerender(<PersonContactsSection personId="person-1" canEdit={false} />)

    expect(screen.getByText("راه ارتباطی ثبت نشده است.")).toBeVisible()
  })

  it("shows a safe error state and retries the failed query", async () => {
    const user = userEvent.setup()
    mocks.contactsQuery.isError = true
    mocks.contactsQuery.error = new Error("internal stack detail")
    render(<PersonContactsSection personId="person-1" canEdit={false} />)

    expect(screen.getByRole("alert")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "تلاش دوباره" }))

    expect(mocks.contactsQuery.refetch).toHaveBeenCalledOnce()
  })

  it("renders compact contact records with accessible actions", () => {
    mocks.contactsQuery.data = [
      {
        id: "contact-1",
        type: "MOBILE",
        value: "09121234567",
        isPrimary: true,
        note: "شماره اصلی",
        typeOption: { id: "type-mobile", label: "موبایل" },
      },
    ]
    render(<PersonContactsSection personId="person-1" canEdit />)

    expect(screen.getByText("09121234567")).toBeVisible()
    expect(screen.getByText("شماره اصلی")).toBeVisible()
    expect(screen.getByRole("button", { name: "ویرایش" })).toBeVisible()
    expect(screen.getByRole("button", { name: "حذف" })).toBeVisible()
  })

  it("uses the same query-state contract for social identities", () => {
    mocks.socialsQuery.data = [
      {
        id: "social-1",
        platform: "LINKEDIN",
        handle: "@neshane",
        isPrimary: true,
      },
    ]
    render(<PersonSocialsSection personId="person-1" canEdit={false} />)

    expect(screen.getByText("@neshane")).toBeVisible()
    expect(screen.getByText("اصلی")).toBeVisible()
    expect(
      screen.queryByRole("button", { name: "ویرایش" })
    ).not.toBeInTheDocument()
  })
})
