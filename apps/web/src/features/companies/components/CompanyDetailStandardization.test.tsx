import { fireEvent, render, screen } from "@testing-library/react"
import { Building2 } from "lucide-react"
import { describe, expect, it, vi } from "vitest"

import { Company360ActionSection } from "./Company360ActionSection"
import { CompanyMetricCard } from "./CompanyMetricCard"
import {
  CreateCompanySocialDialog,
  UploadCompanyLegalDocumentDialog,
} from "./CompanyRelationCreateDialogs"

describe("company detail standardization", () => {
  it("uses an accessible standard metric card for drill-down navigation", () => {
    const onClick = vi.fn()
    render(
      <CompanyMetricCard
        icon={Building2}
        label="فرصت‌های فعال"
        value="۱۲"
        onClick={onClick}
      />
    )

    const metric = screen.getByRole("button", { name: /فرصت‌های فعال/ })
    fireEvent.click(metric)
    fireEvent.keyDown(metric, { key: "Enter" })

    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it("keeps the section create action visible with its text label", () => {
    const onCreate = vi.fn()
    render(
      <Company360ActionSection
        title="شعب"
        createLabel="ثبت شعبه"
        onCreate={onCreate}
      >
        <span>محتوا</span>
      </Company360ActionSection>
    )

    fireEvent.click(screen.getByRole("button", { name: "ثبت شعبه" }))
    expect(onCreate).toHaveBeenCalledOnce()
  })

  it("uses standard selectors and the Persian date picker in relation dialogs", () => {
    const { container, rerender } = render(
      <CreateCompanySocialDialog
        companyId="company-1"
        open
        onClose={vi.fn()}
        onCreated={vi.fn()}
      />
    )

    expect(container.querySelector("select")).toBeNull()
    expect(
      screen.getByRole("button", { name: "انتخاب شبکه اجتماعی" })
    ).toBeInTheDocument()

    rerender(
      <UploadCompanyLegalDocumentDialog
        companyId="company-1"
        open
        onClose={vi.fn()}
        onCreated={vi.fn()}
      />
    )

    expect(container.querySelector('input[type="date"]')).toBeNull()
    expect(
      screen.getByRole("button", { name: "انتخاب تاریخ سند" })
    ).toBeInTheDocument()
  })
})
