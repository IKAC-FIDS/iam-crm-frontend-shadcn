import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"

import type { Opportunity } from "../types/opportunity.types"
import { OpportunityDetailPage } from "./OpportunityDetailPage"

const { permissions } = vi.hoisted(() => ({
  permissions: [
    "opportunity:view",
    "opportunity:update",
    "opportunity:change-owner",
    "opportunity:change-stage",
    "opportunity:archive",
    "company:view",
    "person:view",
    "financial:view",
  ],
}))

const opportunity: Opportunity = {
  id: "opportunity-1",
  companyId: "company-1",
  title: "فرصت نمونه",
  description: "شرح فرصت نمونه",
  company: {
    id: "company-1",
    legalName: "شرکت نمونه",
    logoObjectKey: "company-logo",
  },
  ownerId: "user-1",
  owner: {
    id: "user-1",
    fullName: "مالک نمونه",
    avatarObjectKey: "owner-avatar",
  },
  stageId: "stage-1",
  stage: {
    id: "stage-1",
    code: "LEAD",
    label: "سرنخ",
    sortOrder: 1,
  },
  priority: "HIGH",
  estimatedValue: 1_000_000,
  probability: 40,
  expectedCloseDate: "2026-09-30",
  createdAt: "2026-09-01T08:00:00.000Z",
  updatedAt: "2026-09-02T08:00:00.000Z",
  activities: [],
  stageHistories: [],
}

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>("react-router-dom")
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: opportunity.id }),
  }
})

vi.mock("@/store/authStore", () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({ user: { id: "user-1", role: "ADMIN", permissions } }),
}))

vi.mock("../hooks/useOpportunities", () => ({
  useOpportunity: () => ({
    data: opportunity,
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
  usePipelineStages: () => ({
    data: [opportunity.stage],
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
  usePipelineTransitions: () => ({
    data: [],
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
  useUpdateOpportunity: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useChangeOpportunityOwner: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
  useChangeOpportunityStage: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
  useArchiveOpportunity: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useRestoreOpportunity: () => ({ isPending: false, mutateAsync: vi.fn() }),
}))

vi.mock("@/components/shared/IdentityAvatar", () => ({
  IdentityAvatar: ({
    name,
    mediaPath,
    hasMedia,
  }: {
    name: string
    mediaPath?: string | null
    hasMedia?: boolean
  }) => (
    <span
      data-testid="identity-avatar"
      data-media-path={mediaPath}
      data-has-media={hasMedia}
    >
      {name}
    </span>
  ),
}))

vi.mock("../components/OpportunityCommercialSection", () => ({
  OpportunityCommercialSection: () => <div>محتوای تجاری</div>,
}))
vi.mock("../components/OpportunityExecutionSection", () => ({
  OpportunityExecutionSection: () => <div>محتوای اجرا</div>,
}))
vi.mock("../components/OpportunityFilesHistorySection", () => ({
  OpportunityFilesHistorySection: () => <div>تاریخچه فایل‌ها</div>,
}))
vi.mock("../components/OpportunityFormDialog", () => ({
  OpportunityFormDialog: () => null,
}))
vi.mock("../components/ChangeOpportunityOwnerDialog", () => ({
  ChangeOpportunityOwnerDialog: () => null,
}))
vi.mock("../components/ChangeOpportunityStageDialog", () => ({
  ChangeOpportunityStageDialog: () => null,
}))
vi.mock("@/features/artifacts/components/ArtifactPanel", () => ({
  ArtifactPanel: () => null,
}))
vi.mock("@/features/people/components/Person360WorkspaceDialog", () => ({
  Person360WorkspaceDialog: () => null,
}))

describe("OpportunityDetailPage", () => {
  it("uses accessible hero tabs and standard identity media", async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={["/opportunities/opportunity-1"]}>
        <OpportunityDetailPage />
      </MemoryRouter>
    )

    expect(
      screen.getByRole("heading", { name: opportunity.title })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("tablist", { name: "بخش‌های فرصت" })
    ).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "نمای کلی" })).toHaveAttribute(
      "aria-selected",
      "true"
    )
    expect(screen.getByRole("tabpanel")).toHaveAccessibleName("نمای کلی")

    const avatars = screen.getAllByTestId("identity-avatar")
    expect(avatars.map((item) => item.getAttribute("data-media-path"))).toEqual(
      expect.arrayContaining([
        "/companies/company-1/logo",
        "/users/user-1/avatar",
      ])
    )
    expect(
      avatars
        .filter((item) => item.getAttribute("data-media-path"))
        .every((item) => item.getAttribute("data-has-media") === "true")
    ).toBe(true)

    await user.click(screen.getByRole("tab", { name: "تجاری" }))
    expect(screen.getByRole("tabpanel")).toHaveAccessibleName("تجاری")
    expect(screen.getByText("محتوای تجاری")).toBeInTheDocument()
  })
})
