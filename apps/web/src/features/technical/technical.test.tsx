import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
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
import { technicalApi, technicalLookups } from "./api"
import { releasePresentation, releaseTransitions } from "./presentation"
import { TechnicalDocumentsPage } from "./pages/TechnicalListPages"
import {
  TechnicalDocumentDetailPage,
  TechnicalTenderDetailPage,
} from "./pages/TechnicalDetailPages"

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
  it("preserves pagination metadata from the standard API envelope", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        success: true,
        data: [{ id: "t1", title: "مناقصه نمونه" }],
        meta: {
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      },
    })

    const result = await technicalApi.tenders.list({ page: 1, limit: 20 })

    expect(result.data).toEqual([
      expect.objectContaining({ id: "t1", title: "مناقصه نمونه" }),
    ])
    expect(result.meta).toEqual(expect.objectContaining({ total: 1, page: 1 }))
  })

  it("sends supported list filters and transition payload to backend routes", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        success: true,
        data: [],
        meta: {
          page: 2,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrevious: true,
        },
      },
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

  it("uses typed readiness and review workflow endpoints", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: { overallReady: false, blockers: [] } } })
    await technicalApi.tenders.readiness("t1")
    await technicalApi.tenders.reviews("t1")
    vi.mocked(api.post).mockResolvedValue({ data: { data: { id: "rv1" } } })
    await technicalApi.tenders.requestReview("t1", { type: "TECHNICAL", revision: 2 })
    await technicalApi.tenders.decideReview("t1", "rv1", { status: "REJECTED", comment: "نیازمند اصلاح", revision: 2 })
    expect(api.get).toHaveBeenCalledWith("/technical/tenders/t1/readiness")
    expect(api.get).toHaveBeenCalledWith("/technical/tenders/t1/reviews")
    expect(api.post).toHaveBeenCalledWith("/technical/tenders/t1/reviews/rv1/decision", expect.objectContaining({ status: "REJECTED", comment: "نیازمند اصلاح" }))
  })

  it("uploads a technical document file and version in one request", async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { data: { id: "v1", version: "2.0" } } })
    const file = new File(["content"], "architecture.pdf", { type: "application/pdf" })

    await technicalApi.documents.uploadVersion("d1", { version: "2.0", file })

    expect(api.post).toHaveBeenCalledWith(
      "/technical/documents/d1/versions/upload",
      expect.any(FormData),
      expect.objectContaining({ onUploadProgress: expect.any(Function) })
    )
    const form = vi.mocked(api.post).mock.calls[0]?.[1] as FormData
    expect(form.get("version")).toBe("2.0")
    expect(form.get("file")).toBe(file)
  })

  it("uses qualification, dependency and requirement task endpoints", async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: { data: { id: "t1" } } })
    vi.mocked(api.post).mockResolvedValue({ data: { data: { id: "link1" } } })
    await technicalApi.tenders.saveQualification("t1", { qualificationDecision: "CONDITIONAL_GO", qualificationConditions: "تأیید قیمت" })
    await technicalApi.tenders.addDependency("t1", "r1", "r2")
    await technicalApi.tenders.linkTask("t1", "r1", "task1")
    expect(api.patch).toHaveBeenCalledWith("/technical/tenders/t1/qualification", expect.objectContaining({ qualificationDecision: "CONDITIONAL_GO" }))
    expect(api.post).toHaveBeenCalledWith("/technical/tenders/t1/requirements/r1/dependencies", { dependsOnRequirementId: "r2" })
    expect(api.post).toHaveBeenCalledWith("/technical/tenders/t1/requirements/r1/link-task", { taskId: "task1" })
  })

  it("requests tender people from the selected server-side team scope", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: { data: [], meta: { total: 0 } } } })
    await technicalLookups("tender-users", "علی", undefined, "team-1")
    expect(api.get).toHaveBeenCalledWith("/users/assignee-options", { params: expect.objectContaining({ search: "علی", teamId: "team-1" }) })
  })
})

describe("Technical Center behavior", () => {
  it("submits the selected file from the document version dialog", async () => {
    useAuthStore.setState({
      user: {
        ...user,
        permissions: [
          "technical-document:view",
          "technical-document:manage",
          "attachment:view",
        ],
      },
      status: "authenticated",
    })
    const document = {
      id: "d1",
      title: "سند معماری",
      documentType: "ARCHITECTURE",
      status: "DRAFT",
      confidentiality: "INTERNAL",
      ownerId: "u1",
      revision: 1,
      versions: [],
      createdAt: "2026-09-01",
      updatedAt: "2026-09-01",
    }
    vi.mocked(api.get).mockResolvedValue({ data: { data: document } })
    vi.mocked(api.post).mockResolvedValue({
      data: { data: { id: "v1", documentId: "d1", version: "1.0", createdAt: "2026-09-03" } },
    })

    render(
      <MemoryRouter initialEntries={["/technical/documents/d1"]}>
        <Routes>
          <Route path="/technical/documents/:id" element={<TechnicalDocumentDetailPage />} />
        </Routes>
      </MemoryRouter>,
      { wrapper }
    )

    await userEvent.click(await screen.findByRole("button", { name: "نسخه جدید" }))
    await userEvent.type(screen.getByLabelText("شماره نسخه"), "1.0")
    const file = new File(["content"], "architecture.pdf", { type: "application/pdf" })
    await userEvent.upload(screen.getByLabelText("فایل نسخه"), file)
    await userEvent.click(screen.getByRole("button", { name: "بارگذاری و ثبت نسخه" }))

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(
        "/technical/documents/d1/versions/upload",
        expect.any(FormData),
        expect.any(Object)
      )
    )
  })

  it("renders actionable tender readiness blockers and separate reviews", async () => {
    useAuthStore.setState({ user: { ...user, permissions: ["technical-tender:view"] }, status: "authenticated" })
    const readiness = {
      overallReady: false,
      blockers: [{ code: "MANDATORY_REQUIREMENTS_INCOMPLETE", count: 2 }], warnings: [],
      checks: {
        mandatoryRequirements: { total: 3, satisfied: 1, unresolved: 2, blocked: 0 },
        requirements: { total: 3, verified: 1, inProgress: 1, open: 1, blocked: 0, overdue: 0, unassigned: 0 },
        deliverables: { total: 0, required: 0, completedRequired: 0, missing: 0 },
        technicalReview: { status: "PENDING" }, commercialReview: { status: "NOT_STARTED" },
        submissionDeadline: { value: "2026-09-01", overdue: false }, requiredTenderFields: { complete: true, missing: [] },
      },
    }
    const tender = { id: "t1", title: "مناقصه تست", tenderType: "RFP", status: "PREPARING", ownerId: "u1", revision: 1, bidDecision: "BID", qualificationDecision: "CONDITIONAL_GO", fitScore: 85, riskScore: 35, feasibilityScore: 80, qualificationConditions: "تأیید قیمت", requirements: [], deliverables: [], readiness, createdAt: "2026-08-30", updatedAt: "2026-08-30" }
    vi.mocked(api.get).mockImplementation(async (url) => ({ data: { data: url.endsWith("/readiness") ? readiness : url.endsWith("/reviews") || url.endsWith("/requirements") || url.endsWith("/history") ? [] : tender } }))
    render(<MemoryRouter initialEntries={["/technical/tenders/t1"]}><Routes><Route path="/technical/tenders/:id" element={<TechnicalTenderDetailPage />} /></Routes></MemoryRouter>, { wrapper })
    expect(await screen.findByText("آماده ارسال نیست")).toBeInTheDocument()
    expect(screen.getByText(/الزامات الزامی تکمیل نشده‌اند/)).toBeInTheDocument()
    expect(screen.getByText("بازبینی فنی")).toBeInTheDocument()
    expect(screen.getByText("بازبینی تجاری")).toBeInTheDocument()
    expect(screen.getByText("ادامه مشروط")).toBeInTheDocument()
    expect(screen.getByText(/تأیید قیمت/)).toBeInTheDocument()
    expect(screen.getByText("مسیر عملیاتی مناقصه")).toBeInTheDocument()
    expect(screen.getByText("پاسخ مناقصه را آماده کنید")).toBeInTheDocument()
    expect(screen.getByText(/در وضعیت فعلی اقدامی متناسب با دسترسی‌های شما وجود ندارد/)).toBeInTheDocument()
  })
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
    await userEvent.click(await screen.findByLabelText("محرمانگی"))
    await userEvent.click(screen.getByRole("button", { name: "محرمانه" }))
    await userEvent.click(screen.getByLabelText("مناقصه"))
    await userEvent.click(
      await screen.findByRole("button", { name: "مناقصه نمونه" })
    )
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

  it("explains why an allowed lifecycle action is not ready yet", () => {
    render(
      <LifecycleActions
        targets={["COMMERCIAL_REVIEW"]}
        presentation={{ label: { COMMERCIAL_REVIEW: "بازبینی تجاری" } }}
        pending={false}
        canTarget={() => true}
        getTargetBlockReason={() => "تأیید فنی هنوز ثبت نشده است."}
        onTransition={vi.fn()}
      />
    )
    expect(screen.getByRole("button", { name: /بازبینی تجاری/ })).toBeDisabled()
    expect(screen.getByText(/تأیید فنی هنوز ثبت نشده است/)).toBeInTheDocument()
  })

  it("requires and forwards a reason for consequential lifecycle changes", async () => {
    const transition = vi.fn().mockResolvedValue(undefined)
    render(
      <LifecycleActions
        targets={["CANCELLED"]}
        presentation={{ label: { CANCELLED: "لغوشده" } }}
        pending={false}
        canTarget={() => true}
        requiresReason={() => true}
        onTransition={transition}
      />
    )
    await userEvent.click(screen.getByRole("button", { name: /لغوشده/ }))
    const confirm = screen.getByRole("button", { name: "تأیید" })
    expect(confirm).toBeDisabled()
    await userEvent.type(screen.getByLabelText("دلیل تغییر وضعیت"), "تغییر تصمیم مشتری")
    await userEvent.click(confirm)
    expect(transition).toHaveBeenCalledWith("CANCELLED", "تغییر تصمیم مشتری")
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
