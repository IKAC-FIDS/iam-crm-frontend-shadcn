import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import type { Opportunity } from "../types/opportunity.types"
import { OpportunityEntityCard } from "./OpportunityEntityCard"

const opportunity = {
  id: "opportunity-1",
  companyId: "company-1",
  title: "فرصت نیازمند پیگیری",
  company: { id: "company-1", legalName: "شرکت نمونه" },
  stageId: "stage-1",
  stage: { id: "stage-1", code: "QUALIFIED", label: "واجد شرایط", sortOrder: 2 },
  priority: "HIGH",
  ageDays: 10,
  currentStageAgeDays: 5,
  maxDurationDays: 3,
  isStageOverdue: true,
  stageOverdueDays: 2,
} satisfies Opportunity

describe("OpportunityEntityCard aging", () => {
  it("shows total age, current-stage age, limit, and an explicit overdue warning", () => {
    render(
      <OpportunityEntityCard
        opportunity={opportunity}
        permissions={{ update: false, changeOwner: false, changeStage: false, archive: false, restore: false }}
        financialVisible={false}
        onView={vi.fn()}
        onEdit={vi.fn()}
        onChangeOwner={vi.fn()}
        onChangeStage={vi.fn()}
        onArchiveToggle={vi.fn()}
      />
    )

    expect(screen.getByText("۲ روز تأخیر")).toBeVisible()
    expect(screen.getByText("۱۰ روز")).toBeVisible()
    expect(screen.getByText("۵ از ۳ روز مجاز")).toBeVisible()
  })
})
