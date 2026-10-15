import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { CustomerRequestInternalDetailPage } from "./CustomerRequestInternalDetailPage"
import { internalRequestApi } from "./customerRequests.api"
import type { CustomerRequest } from "./customerRequests.types"

const auth = vi.hoisted(() => ({
  user: {
    id: "user-1",
    permissions: [
      "customer-request:triage",
      "customer-request:assign",
      "customer-request:route",
      "customer-request:link",
      "task:create",
      "opportunity:create",
      "technical-document:manage",
    ],
  },
}))
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))

vi.mock("@/store/authStore", () => ({
  useAuthStore: (selector: (state: typeof auth) => unknown) => selector(auth),
}))
vi.mock("sonner", () => ({ toast }))
vi.mock("./customerRequests.api", () => ({
  internalRequestApi: {
    detail: vi.fn(),
    assignees: vi.fn(),
    triageOptions: vi.fn(),
    triageHistory: vi.fn(),
    links: vi.fn(),
    updateTriage: vi.fn(),
    linkExisting: vi.fn(),
    unlink: vi.fn(),
    createLinkedTask: vi.fn(),
    createLinkedOpportunity: vi.fn(),
    createLinkedTechnicalDocument: vi.fn(),
    status: vi.fn(),
  },
}))

const request: CustomerRequest = {
  id: "request-1",
  trackingNumber: "CR-1001",
  title: "درخواست نصب و راه‌اندازی",
  status: "UNDER_REVIEW",
  priority: "HIGH",
  triageStatus: "TRIAGED",
  assignedToId: "user-2",
  responsibleTeamId: "team-1",
  routingDestination: "TASK",
  revision: 3,
  submittedAt: "2026-10-15T08:30:00.000Z",
  createdAt: "2026-10-15T08:00:00.000Z",
  updatedAt: "2026-10-15T09:00:00.000Z",
  creatorMembershipId: "membership-1",
  requestType: {
    id: "type-1",
    code: "INSTALLATION",
    displayName: "نصب",
  },
  company: {
    id: "company-1",
    legalName: "شرکت نمونه",
    brandName: "نمونه",
  },
  creator: {
    id: "creator-1",
    fullName: "کاربر مشتری",
    email: "customer@example.com",
  },
  formVersion: {
    id: "form-1",
    version: 1,
    schema: {
      fields: [{ key: "subject", type: "TEXT", label: "موضوع" }],
    },
  },
  answers: { subject: "راه‌اندازی شعبه جدید" },
  histories: [
    {
      id: "history-1",
      previousStatus: "SUBMITTED",
      newStatus: "UNDER_REVIEW",
      customerVisibleExplanation: "درخواست در حال بررسی است.",
      createdAt: "2026-10-15T09:00:00.000Z",
    },
  ],
  allowedTransitions: ["IN_PROGRESS", "WAITING_FOR_CUSTOMER"],
}

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/customer-requests/request-1"]}>
        <Routes>
          <Route
            path="/customer-requests/:id"
            element={<CustomerRequestInternalDetailPage />}
          />
          <Route path="/customer-requests" element={<p>فهرست درخواست‌ها</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe("CustomerRequestInternalDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    auth.user.permissions = [
      "customer-request:triage",
      "customer-request:assign",
      "customer-request:route",
      "customer-request:link",
      "task:create",
      "opportunity:create",
      "technical-document:manage",
    ]
    vi.mocked(internalRequestApi.detail).mockResolvedValue(request)
    vi.mocked(internalRequestApi.assignees).mockResolvedValue([
      { id: "user-2", fullName: "کارشناس پشتیبانی" },
    ])
    vi.mocked(internalRequestApi.triageOptions).mockResolvedValue({
      teams: [{ id: "team-1", name: "پشتیبانی", code: "SUPPORT" }],
      requestTypes: [],
    })
    vi.mocked(internalRequestApi.triageHistory).mockResolvedValue([])
    vi.mocked(internalRequestApi.links).mockResolvedValue([])
    vi.mocked(internalRequestApi.status).mockResolvedValue(request)
    vi.mocked(internalRequestApi.updateTriage).mockResolvedValue(request)
    vi.mocked(internalRequestApi.unlink).mockResolvedValue({
      id: "link-1",
      targetType: "TASK",
    })
  })

  it("announces loading and renders the populated detail with semantic status", async () => {
    let resolveDetail: ((value: CustomerRequest) => void) | undefined
    vi.mocked(internalRequestApi.detail).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveDetail = resolve
        })
    )
    renderPage()

    expect(screen.getByRole("status")).toBeInTheDocument()
    resolveDetail?.(request)

    expect(
      await screen.findByRole("heading", { name: request.title })
    ).toBeVisible()
    expect(screen.getAllByText("در حال بررسی").length).toBeGreaterThan(0)
    expect(screen.getByDisplayValue("راه‌اندازی شعبه جدید")).toBeDisabled()
    expect(screen.getByLabelText("وضعیت جدید")).toBeInTheDocument()
    expect(
      screen.getByLabelText("توضیح برای مشتری")
    ).toHaveAccessibleDescription("این متن برای مشتری قابل مشاهده است.")
  })

  it("shows a safe query error and retries without leaking transport details", async () => {
    const user = userEvent.setup()
    vi.mocked(internalRequestApi.detail)
      .mockRejectedValueOnce(new Error("private stack and database host"))
      .mockResolvedValueOnce(request)
    renderPage()

    expect(await screen.findByRole("alert")).not.toHaveTextContent(
      "private stack"
    )
    await user.click(screen.getByRole("button", { name: "تلاش دوباره" }))
    expect(
      await screen.findByRole("heading", { name: request.title })
    ).toBeVisible()
    expect(internalRequestApi.detail).toHaveBeenCalledTimes(2)
  })

  it("distinguishes a missing request from a transient failure", async () => {
    vi.mocked(internalRequestApi.detail).mockRejectedValue({
      isAxiosError: true,
      response: { status: 404, data: {} },
    })
    renderPage()

    expect(
      await screen.findByRole("heading", { name: "درخواست در دسترس نیست" })
    ).toBeVisible()
    expect(
      screen.queryByRole("button", { name: "تلاش دوباره" })
    ).not.toBeInTheDocument()
  })

  it("keeps restricted operational actions hidden or disabled", async () => {
    auth.user.permissions = []
    renderPage()

    await screen.findByRole("heading", { name: request.title })
    expect(screen.queryByText("تریاژ و ارجاع داخلی")).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "ایجاد کار" })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "حذف پیوند" })
    ).not.toBeInTheDocument()
  })

  it("submits only an allowed transition and exposes the pending state", async () => {
    const user = userEvent.setup()
    let resolveStatus: ((value: CustomerRequest) => void) | undefined
    vi.mocked(internalRequestApi.status).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveStatus = resolve
        })
    )
    renderPage()
    await screen.findByRole("heading", { name: request.title })

    await user.selectOptions(screen.getByLabelText("وضعیت جدید"), "IN_PROGRESS")
    await user.type(screen.getByLabelText("توضیح برای مشتری"), "رسیدگی آغاز شد")
    await user.click(screen.getByRole("button", { name: "ثبت وضعیت" }))

    expect(internalRequestApi.status).toHaveBeenCalledWith(
      "request-1",
      "IN_PROGRESS",
      "رسیدگی آغاز شد",
      ""
    )
    expect(screen.getByRole("button", { name: "در حال ثبت..." })).toBeDisabled()
    resolveStatus?.(request)
    await waitFor(() => expect(toast.success).toHaveBeenCalled())
  })

  it("uses safe mutation feedback and never shows a raw internal failure", async () => {
    const user = userEvent.setup()
    vi.mocked(internalRequestApi.status).mockRejectedValue(
      new Error("SQL connection secret")
    )
    renderPage()
    await screen.findByRole("heading", { name: request.title })

    await user.selectOptions(screen.getByLabelText("وضعیت جدید"), "IN_PROGRESS")
    await user.click(screen.getByRole("button", { name: "ثبت وضعیت" }))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("ثبت وضعیت انجام نشد.")
    )
    expect(toast.error).not.toHaveBeenCalledWith(
      expect.stringContaining("SQL connection")
    )
  })

  it("requires confirmation before unlinking a related CRM record", async () => {
    const user = userEvent.setup()
    vi.mocked(internalRequestApi.links).mockResolvedValue([
      {
        id: "link-1",
        targetType: "TASK",
        task: { id: "task-1", title: "پیگیری نصب" },
      },
    ])
    renderPage()

    await user.click(await screen.findByRole("button", { name: "حذف پیوند" }))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(internalRequestApi.unlink).not.toHaveBeenCalled()

    await user.click(screen.getByRole("button", { name: "حذف پیوند" }))
    await waitFor(() =>
      expect(internalRequestApi.unlink).toHaveBeenCalledWith(
        "request-1",
        "link-1",
        "حذف پیوند"
      )
    )
  })
})
