import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { CustomerRequestTypeEditorPage } from "./InternalCustomerRequestPages"
import { internalRequestApi } from "./customerRequests.api"

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))

vi.mock("sonner", () => ({ toast }))

const requestType = {
  id: "type-1",
  code: "SUPPORT",
  displayName: "پشتیبانی فنی",
  isEnabled: true,
  retiredAt: null,
  defaultRoutingDestination: "MANUAL" as const,
  companyAvailability: [],
  currentPublishedVersion: {
    id: "published-1",
    version: 1,
    schema: {
      fields: [
        {
          key: "subject",
          type: "TEXT" as const,
          label: "موضوع درخواست",
          required: true,
        },
      ],
    },
  },
}

function renderEditor() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/admin/customer-request-types/type-1"]}>
        <Routes>
          <Route
            path="/admin/customer-request-types/:id"
            element={<CustomerRequestTypeEditorPage />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe("CustomerRequestTypeEditorPage", () => {
  beforeEach(() => {
    vi.spyOn(internalRequestApi, "types").mockResolvedValue([requestType])
    vi.spyOn(internalRequestApi, "versions").mockResolvedValue([
      {
        id: "draft-2",
        version: 2,
        status: "DRAFT",
        schema: requestType.currentPublishedVersion.schema,
      },
      {
        id: "published-1",
        version: 1,
        status: "PUBLISHED",
        schema: requestType.currentPublishedVersion.schema,
      },
    ])
    vi.spyOn(internalRequestApi, "companies").mockResolvedValue([
      { id: "company-1", legalName: "شرکت نمونه", brandName: null },
    ])
    vi.spyOn(internalRequestApi, "updateType").mockResolvedValue(requestType)
    vi.spyOn(internalRequestApi, "availability").mockResolvedValue({})
    vi.spyOn(internalRequestApi, "saveForm").mockResolvedValue({})
    vi.spyOn(internalRequestApi, "publish").mockResolvedValue({})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  it("renders the editor with canonical labelled controls and status patterns", async () => {
    renderEditor()

    expect(
      await screen.findByRole("heading", { name: "طراحی فرم: پشتیبانی فنی" })
    ).toBeInTheDocument()
    expect(screen.getByLabelText("مسیر پیشنهادی پیش‌فرض")).toHaveAttribute(
      "data-slot",
      "native-select"
    )
    expect(screen.getAllByLabelText("کلید فیلد")[0]).toHaveValue("subject")
    expect(screen.getAllByLabelText("عنوان فیلد")[0]).toHaveValue(
      "موضوع درخواست"
    )
    expect(screen.getAllByLabelText("نوع فیلد")[0]).toHaveValue("TEXT")
    expect(screen.getByText("منتشرشده")).toBeInTheDocument()
    expect(screen.getByText("پیش‌نویس")).toBeInTheDocument()
  })

  it("preserves routing and company availability mutation payloads", async () => {
    const user = userEvent.setup()
    renderEditor()

    await user.selectOptions(
      await screen.findByLabelText("مسیر پیشنهادی پیش‌فرض"),
      "TASK"
    )
    expect(internalRequestApi.updateType).toHaveBeenCalledWith("type-1", {
      defaultRoutingDestination: "TASK",
    })

    await user.click(screen.getByRole("checkbox", { name: "شرکت نمونه" }))
    expect(internalRequestApi.availability).toHaveBeenCalledWith("type-1", [
      "company-1",
    ])
  })

  it("preserves the edited form schema when saving a draft", async () => {
    const user = userEvent.setup()
    renderEditor()

    const keyInput = (await screen.findAllByLabelText("کلید فیلد"))[0]
    await user.clear(keyInput)
    await user.type(keyInput, "request_subject")
    await user.click(screen.getByRole("button", { name: "ذخیره پیش‌نویس" }))

    await waitFor(() =>
      expect(internalRequestApi.saveForm).toHaveBeenCalledWith(
        "type-1",
        expect.objectContaining({
          fields: [
            expect.objectContaining({
              key: "request_subject",
              label: "موضوع درخواست",
              type: "TEXT",
            }),
          ],
        })
      )
    )
  })

  it("shows a safe query error without exposing an internal message", async () => {
    vi.mocked(internalRequestApi.types).mockRejectedValueOnce(
      new Error("database connection details")
    )
    renderEditor()

    expect(
      await screen.findByText("دریافت تنظیمات نوع درخواست انجام نشد")
    ).toBeInTheDocument()
    expect(
      screen.queryByText("database connection details")
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "تلاش دوباره" })
    ).toBeInTheDocument()
  })
})
