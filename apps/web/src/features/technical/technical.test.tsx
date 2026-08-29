import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import userEvent from "@testing-library/user-event"
import { axe, toHaveNoViolations } from "jest-axe"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { api } from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { user } from "@/test/fixtures"
import { TechnicalForm } from "./components/TechnicalForm"
import {
  LifecycleActions,
  ResponsiveTechnicalList,
  TechnicalStatusBadge,
} from "./components/TechnicalPrimitives"
import { technicalApi } from "./api"
import { releasePresentation, releaseTransitions } from "./presentation"
import { TechnicalDocumentsPage } from "./pages/TechnicalListPages"

vi.mock("@/lib/api", () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))
expect.extend(toHaveNoViolations)
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
  >
    {children}
  </QueryClientProvider>
)

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(api.get).mockResolvedValue({ data: { data: [] } })
})

describe("Technical Center contract", () => {
  it("sends supported list filters and transition payload to backend routes", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { data: { data: [], meta: { page: 2, limit: 10, total: 0 } } },
    })
    await technicalApi.releases.list({
      page: 2,
      limit: 10,
      productId: "p1",
      status: "PLANNED",
      from: "2026-08-01",
      to: "2026-08-31",
    })
    expect(api.get).toHaveBeenCalledWith("/technical/releases", {
      params: expect.objectContaining({ productId: "p1", status: "PLANNED" }),
    })

    vi.mocked(api.post).mockResolvedValue({ data: { data: { id: "r1" } } })
    await technicalApi.releases.transition("r1", "RELEASED", 3, "approved")
    expect(api.post).toHaveBeenCalledWith("/technical/releases/r1/transition", {
      status: "RELEASED",
      revision: 3,
      reason: "approved",
    })

    await technicalApi.documents.list({
      page: 1,
      limit: 20,
      confidentiality: "CONFIDENTIAL",
      tenderId: "t1",
    })
    expect(api.get).toHaveBeenLastCalledWith("/technical/documents", {
      params: expect.objectContaining({
        confidentiality: "CONFIDENTIAL",
        tenderId: "t1",
      }),
    })
  })

  it("uses the tender requirement and deliverable relationship endpoints", async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { data: { id: "x" } } })
    await technicalApi.tenders.saveRequirement("t1", { title: "الزام فنی" })
    await technicalApi.tenders.addDeliverable("t1", { documentId: "d1" })
    expect(api.post).toHaveBeenNthCalledWith(
      1,
      "/technical/tenders/t1/requirements",
      { title: "الزام فنی" }
    )
    expect(api.post).toHaveBeenNthCalledWith(
      2,
      "/technical/tenders/t1/deliverables",
      { documentId: "d1" }
    )
  })
})

describe("Technical Center behavior", () => {
  it("sends document confidentiality and tender filters from the URL-backed UI", async () => {
    useAuthStore.setState({
      user: { ...user, permissions: ["technical-document:view"] },
      status: "authenticated",
    })
    vi.mocked(api.get).mockImplementation(async (url, config) => ({
      data:
        url === "/technical/documents"
          ? {
              data: {
                data: [],
                meta: {
                  page: 1,
                  limit: 20,
                  total: 0,
                  totalPages: 1,
                  hasNext: false,
                  hasPrevious: false,
                },
              },
            }
          : url === "/technical/tenders"
            ? { data: { data: [{ id: "t1", title: "مناقصه نمونه" }] } }
            : { data: { data: [] } },
      config,
    }))
    render(
      <MemoryRouter initialEntries={["/technical/documents"]}>
        <TechnicalDocumentsPage />
      </MemoryRouter>,
      { wrapper }
    )
    await userEvent.selectOptions(
      await screen.findByLabelText("محرمانگی"),
      "CONFIDENTIAL"
    )
    await userEvent.selectOptions(await screen.findByLabelText("مناقصه"), "t1")
    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith(
        "/technical/documents",
        expect.objectContaining({
          params: expect.objectContaining({
            confidentiality: "CONFIDENTIAL",
            tenderId: "t1",
          }),
        })
      )
    )
  })

  it("opens the shared create dialog instead of navigating to a create page", async () => {
    useAuthStore.setState({
      user: {
        ...user,
        permissions: ["technical-document:view", "technical-document:manage"],
      },
      status: "authenticated",
    })
    vi.mocked(api.get).mockResolvedValue({
      data: {
        data: {
          data: [],
          meta: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false,
          },
        },
      },
    })

    render(
      <MemoryRouter initialEntries={["/technical/documents"]}>
        <TechnicalDocumentsPage />
      </MemoryRouter>,
      { wrapper }
    )

    await userEvent.click(await screen.findByRole("button", { name: "ایجاد" }))
    expect(
      await screen.findByRole("heading", { name: "ایجاد سند فنی" })
    ).toBeInTheDocument()
    expect(screen.getByLabelText("تاریخ اثر")).toHaveTextContent("انتخاب تاریخ")
  })

  it("hides lifecycle actions that the permission policy does not allow", () => {
    render(
      <LifecycleActions
        targets={releaseTransitions.PLANNED}
        presentation={releasePresentation}
        pending={false}
        canTarget={(target) => target !== "RELEASED"}
        onTransition={vi.fn()}
      />
    )
    expect(screen.queryByRole("button", { name: /منتشرشده/ })).toBeNull()
  })

  it("validates domain-required release fields before save", async () => {
    const save = vi.fn()
    render(
      <TechnicalForm
        kind="releases"
        pending={false}
        onCancel={vi.fn()}
        onSubmit={save}
      />,
      { wrapper }
    )
    await userEvent.type(screen.getByLabelText("عنوان"), "انتشار جدید")
    await userEvent.click(screen.getByRole("button", { name: "ذخیره" }))
    expect(await screen.findByText("محصول الزامی است")).toBeInTheDocument()
    expect(screen.getByText("نسخه الزامی است")).toBeInTheDocument()
    expect(save).not.toHaveBeenCalled()
  })

  it("renders both responsive representations, pagination and accessible status", async () => {
    const { container } = render(
      <ResponsiveTechnicalList
        rows={[{ id: "r1", title: "نسخه پایدار", status: "RELEASED" as const }]}
        columns={[{ id: "title", header: "عنوان", cell: (row) => row.title }]}
        mobile={{
          title: (row) => row.title,
          status: (row) => (
            <TechnicalStatusBadge
              status={row.status}
              presentation={releasePresentation}
            />
          ),
          fields: [],
        }}
        getKey={(row) => row.id}
        onOpen={vi.fn()}
        meta={{
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        }}
        pageSize={20}
        onPage={vi.fn()}
        onPageSize={vi.fn()}
      />
    )
    expect(screen.getByRole("table")).toHaveTextContent("نسخه پایدار")
    expect(screen.getByText("۱ ردیف")).toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()
  })
})
