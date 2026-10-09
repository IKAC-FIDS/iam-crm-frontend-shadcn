import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { expect, it, vi } from "vitest"
import { OpportunityFormDialog } from "./OpportunityFormDialog"
import { httpError } from "@/test/fixtures"
import { uiText } from "@/config/uiText"
import { formatJalaliDate } from "@/lib/date/jalali"
import type { Opportunity } from "../types/opportunity.types"

vi.mock("../hooks/useOpportunities", () => ({
  useOpportunityCompanyPeople: () => ({
    data: [],
    isLoading: false,
    isError: false,
  }),
  useOpportunitySources: () => ({ data: [], isLoading: false, isError: false }),
  useOpportunityOwners: () => ({ data: [], isLoading: false, isError: false }),
}))
vi.mock("@/features/people/components/SearchableCompanySelect", () => ({
  SearchableCompanySelect: () => <button type="button">شرکت نمونه</button>,
}))

const opportunity: Opportunity = {
  id: "o1",
  companyId: "c1",
  title: "فرصت قبلی",
  stageId: "s1",
  stage: { id: "s1", code: "LEAD", label: "سرنخ", sortOrder: 1 },
  priority: "MEDIUM",
  expectedCloseDate: "2026-08-30",
}
it("keeps edit values, validates probability and maps a rejected title to the field", async () => {
  const submit = vi.fn().mockRejectedValue(
    httpError(422, {
      error: {
        message: "اصلاح عنوان",
        fieldErrors: { title: ["عنوان تکراری"] },
      },
    })
  )
  const props = {
    open: true,
    onOpenChange: vi.fn(),
    opportunity,
    stages: [],
    isPending: false,
    onSubmit: submit,
  }
  const { rerender } = render(<OpportunityFormDialog {...props} />)
  expect(
    screen.getByLabelText(new RegExp(uiText.opportunities.fields.title))
  ).toHaveValue("فرصت قبلی")
  expect(
    screen.getByLabelText(uiText.opportunities.fields.expectedCloseDate)
  ).toHaveTextContent(formatJalaliDate(opportunity.expectedCloseDate))
  const probability = screen.getByLabelText(
    uiText.opportunities.fields.probability
  )
  await userEvent.type(probability, "101")
  await userEvent.click(
    screen.getByRole("button", { name: uiText.opportunities.actions.save })
  )
  expect(submit).not.toHaveBeenCalled()
  expect(
    await screen.findByText(uiText.opportunities.form.invalidProbability)
  ).toBeInTheDocument()
  await userEvent.clear(probability)
  await userEvent.type(probability, "50")
  await userEvent.click(
    screen.getByRole("button", { name: uiText.opportunities.actions.save })
  )
  expect(await screen.findByText("عنوان تکراری")).toBeInTheDocument()
  expect(submit).toHaveBeenCalledWith(
    expect.objectContaining({ title: "فرصت قبلی", probability: 50 })
  )
  expect(submit.mock.calls[0]?.[0]).not.toHaveProperty("companyId")
  rerender(
    <OpportunityFormDialog
      {...props}
      opportunity={{ ...opportunity, id: "o2", title: "فرصت جدید" }}
    />
  )
  await waitFor(() =>
    expect(
      screen.getByLabelText(new RegExp(uiText.opportunities.fields.title))
    ).toHaveValue("فرصت جدید")
  )
  expect(screen.queryByText("عنوان تکراری")).not.toBeInTheDocument()
})
