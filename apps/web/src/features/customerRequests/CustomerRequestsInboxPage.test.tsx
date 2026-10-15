import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { CustomerRequestsInboxPage } from "./CustomerRequestsInboxPage"
import { internalRequestApi } from "./customerRequests.api"
import type { CustomerRequest, Page } from "./customerRequests.types"

vi.mock("./customerRequests.api", () => ({
  internalRequestApi: {
    triageList: vi.fn(),
    assignees: vi.fn(),
    triageOptions: vi.fn(),
  },
}))

const request: CustomerRequest = {
  id: "request-1",
  trackingNumber: "CR-1001",
  title: "درخواست نصب و راه‌اندازی",
  status: "UNDER_REVIEW",
  priority: "HIGH",
  triageStatus: "TRIAGED",
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
  assignedTo: { id: "user-1", fullName: "کارشناس پشتیبانی" },
}

function pageResult(
  data: CustomerRequest[] = [],
  page = 1,
  totalPages = data.length ? 1 : 0
): Page<CustomerRequest> {
  return {
    data,
    meta: {
      total: data.length || (totalPages ? 41 : 0),
      page,
      limit: 20,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    },
  }
}

function LocationProbe() {
  const location = useLocation()
  return (
    <output data-testid="location">
      {location.pathname + location.search}
    </output>
  )
}

function renderPage(initialEntry = "/customer-requests") {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route
            path="*"
            element={
              <>
                <CustomerRequestsInboxPage />
                <LocationProbe />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe("CustomerRequestsInboxPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(internalRequestApi.assignees).mockResolvedValue([
      { id: "user-1", fullName: "کارشناس پشتیبانی" },
    ])
    vi.mocked(internalRequestApi.triageOptions).mockResolvedValue({
      teams: [],
      requestTypes: [{ id: "type-1", displayName: "نصب" }],
    })
    vi.mocked(internalRequestApi.triageList).mockResolvedValue(
      pageResult([request])
    )
  })

  it("announces loading and renders the populated desktop and mobile representations", async () => {
    let resolveList: ((value: Page<CustomerRequest>) => void) | undefined
    vi.mocked(internalRequestApi.triageList).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveList = resolve
        })
    )
    renderPage()

    expect(
      screen.getByRole("status", { name: "در حال دریافت اطلاعات..." })
    ).toBeInTheDocument()
    resolveList?.(pageResult([request]))

    expect(
      await screen.findByRole("table", {
        name: "فهرست درخواست‌های مشتریان",
      })
    ).toBeInTheDocument()
    expect(screen.getAllByText(request.title)).toHaveLength(2)
    const mobileCard = screen.getByRole("article")
    expect(within(mobileCard).getByText("نمونه")).toBeVisible()
    expect(within(mobileCard).getByText("نصب")).toBeVisible()
    expect(within(mobileCard).getByText("کارشناس پشتیبانی")).toBeVisible()
  })

  it("distinguishes true empty from filtered empty and clears filters", async () => {
    const user = userEvent.setup()
    vi.mocked(internalRequestApi.triageList).mockResolvedValue(pageResult())
    const { unmount } = renderPage()

    expect(
      (await screen.findAllByText("هنوز درخواستی ثبت نشده است")).length
    ).toBeGreaterThan(0)
    expect(
      screen.queryByRole("button", { name: "پاک‌کردن فیلترها" })
    ).not.toBeInTheDocument()

    unmount()
    renderPage("/customer-requests?status=SUBMITTED&page=3")
    expect(
      (await screen.findAllByText("درخواستی با این فیلترها پیدا نشد")).length
    ).toBeGreaterThan(0)

    await user.click(
      screen.getAllByRole("button", { name: "پاک‌کردن فیلترها" })[0]
    )
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/customer-requests"
    )
  })

  it("shows the canonical query error and retries", async () => {
    const user = userEvent.setup()
    vi.mocked(internalRequestApi.triageList)
      .mockRejectedValueOnce(new Error("transport detail"))
      .mockResolvedValueOnce(pageResult([request]))
    renderPage()

    expect(await screen.findByRole("alert")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "تلاش دوباره" }))

    expect(await screen.findAllByText(request.title)).toHaveLength(2)
    expect(internalRequestApi.triageList).toHaveBeenCalledTimes(2)
  })

  it("preserves server pagination and URL filter state", async () => {
    const user = userEvent.setup()
    vi.mocked(internalRequestApi.triageList).mockResolvedValue(
      pageResult([request], 2, 3)
    )
    renderPage("/customer-requests?page=2&priority=HIGH")

    await screen.findAllByText(request.title)
    expect(internalRequestApi.triageList).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, priority: "HIGH" })
    )

    await user.click(screen.getByRole("button", { name: "بعدی" }))
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/customer-requests?page=3&priority=HIGH"
    )
  })

  it("renders semantic statuses and only the permitted view row action", async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findAllByText(request.title)
    expect(screen.getAllByText("در حال بررسی").length).toBeGreaterThan(0)
    expect(screen.getAllByText("زیاد").length).toBeGreaterThan(0)
    expect(
      screen.queryByRole("button", { name: /حذف درخواست/ })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /ویرایش درخواست/ })
    ).not.toBeInTheDocument()

    await user.click(
      screen.getAllByRole("button", {
        name: `مشاهده درخواست ${request.title}`,
      })[0]
    )
    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent(
        "/customer-requests/request-1"
      )
    )
  })
})
