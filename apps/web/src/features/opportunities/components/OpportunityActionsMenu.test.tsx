import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { uiText } from "@/config/uiText"
import type { Opportunity } from "../types/opportunity.types"
import { OpportunityActionsMenu } from "./OpportunityActionsMenu"

const opportunity = { id: "opportunity-1", archivedAt: null } as Opportunity

describe("OpportunityActionsMenu", () => {
  it("shows permitted list actions as labeled buttons", async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    const onChangeOwner = vi.fn()
    const onChangeStage = vi.fn()
    const onArchiveToggle = vi.fn()

    render(
      <OpportunityActionsMenu
        opportunity={opportunity}
        permissions={{ update: true, changeOwner: true, changeStage: true, archive: true, restore: false }}
        presentation="buttons"
        onView={vi.fn()}
        onEdit={onEdit}
        onChangeOwner={onChangeOwner}
        onChangeStage={onChangeStage}
        onArchiveToggle={onArchiveToggle}
      />,
    )

    expect(screen.getByRole("button", { name: uiText.opportunities.actions.edit })).toBeVisible()
    expect(screen.getByRole("button", { name: uiText.opportunities.actions.changeOwner })).toBeVisible()
    expect(screen.getByRole("button", { name: uiText.opportunities.actions.changeStage })).toBeVisible()
    expect(screen.getByRole("button", { name: uiText.opportunities.actions.archive })).toBeVisible()

    await user.click(screen.getByRole("button", { name: uiText.opportunities.actions.edit }))
    expect(onEdit).toHaveBeenCalledOnce()
  })

  it("shows restore only for an archived opportunity", () => {
    render(
      <OpportunityActionsMenu
        opportunity={{ ...opportunity, archivedAt: "2026-09-18T00:00:00.000Z" }}
        permissions={{ update: true, changeOwner: true, changeStage: true, archive: true, restore: true }}
        presentation="buttons"
        onView={vi.fn()}
        onEdit={vi.fn()}
        onChangeOwner={vi.fn()}
        onChangeStage={vi.fn()}
        onArchiveToggle={vi.fn()}
      />,
    )

    expect(screen.getByRole("button", { name: uiText.opportunities.actions.restore })).toBeVisible()
    expect(screen.queryByRole("button", { name: uiText.opportunities.actions.edit })).not.toBeInTheDocument()
  })
})
