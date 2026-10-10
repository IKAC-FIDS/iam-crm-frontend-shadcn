import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { expect, it, vi } from "vitest"

import type { Activity } from "../types/activity.types"
import { ActivityFormDialog } from "./ActivityFormDialog"

const updateActivity = vi.fn().mockResolvedValue({})

vi.mock("../hooks/useActivities", () => ({
  useCreateActivity: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useUpdateActivity: () => ({ isPending: false, mutateAsync: updateActivity }),
  useActivityTypes: () => ({
    data: [{ id: "type-1", code: "CALL", label: "تماس", isActive: true }],
    isLoading: false,
    isError: false,
  }),
  useActivityTaskOptions: () => ({ data: [], isLoading: false }),
  useActivityPeopleOptions: () => ({ data: [], isLoading: false }),
  useActivityOpportunityOptions: () => ({
    data: [
      { id: "opportunity-1", label: "فرصت فعلی" },
      { id: "opportunity-2", label: "فرصت جدید" },
    ],
    isLoading: false,
  }),
}))

vi.mock("@/features/people/components/SearchableCompanySelect", () => ({
  SearchableCompanySelect: () => <button type="button">شرکت نمونه</button>,
}))

const activity: Activity = {
  id: "activity-1",
  targetType: "COMPANY",
  companyId: "company-1",
  opportunityId: "opportunity-1",
  opportunity: { id: "opportunity-1", title: "فرصت فعلی" },
  type: "CALL",
  notes: "",
  outcome: "",
  occurredAt: "2026-10-10T08:00:00.000Z",
}

it("allows changing the related opportunity while editing an activity", async () => {
  const user = userEvent.setup()
  render(
    <ActivityFormDialog
      open
      onOpenChange={vi.fn()}
      activity={activity}
    />
  )

  const opportunitySelect = screen.getByRole("combobox", {
    name: "فرصت فروش",
  })
  expect(opportunitySelect).toHaveValue("opportunity-1")
  await user.selectOptions(opportunitySelect, "opportunity-2")
  await user.click(screen.getByRole("button", { name: "ذخیره" }))

  expect(updateActivity).toHaveBeenCalledWith({
    id: "activity-1",
    payload: expect.objectContaining({ opportunityId: "opportunity-2" }),
  })
})
