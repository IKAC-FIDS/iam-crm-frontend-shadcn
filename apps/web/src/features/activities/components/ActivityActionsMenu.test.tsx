import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { ComponentProps } from "react"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"

import { uiText } from "@/config/uiText"
import type { Activity } from "../types/activity.types"
import { ActivityActionsMenu } from "./ActivityActionsMenu"

const activity = {
  id: "activity-1",
  type: "CALL",
  companyId: "company-1",
} as Activity

function renderActions(props?: Partial<ComponentProps<typeof ActivityActionsMenu>>) {
  const onView = vi.fn()
  const onEdit = vi.fn()

  render(
    <MemoryRouter>
      <ActivityActionsMenu
        activity={activity}
        canUpdate
        presentation="buttons"
        onView={onView}
        onEdit={onEdit}
        {...props}
      />
    </MemoryRouter>,
  )

  return { onView, onEdit }
}

describe("ActivityActionsMenu", () => {
  it("renders card actions as visible labeled buttons", async () => {
    const user = userEvent.setup()
    const { onView, onEdit } = renderActions()

    expect(screen.getByRole("button", { name: uiText.common.view })).toBeVisible()
    expect(screen.getByRole("button", { name: "ویرایش فعالیت" })).toBeVisible()
    expect(screen.getByRole("button", { name: "مشاهده شرکت" })).toBeVisible()

    await user.click(screen.getByRole("button", { name: uiText.common.view }))
    await user.click(screen.getByRole("button", { name: "ویرایش فعالیت" }))

    expect(onView).toHaveBeenCalledOnce()
    expect(onEdit).toHaveBeenCalledOnce()
  })

  it("does not offer editing for system stage-change events", () => {
    renderActions({ activity: { ...activity, type: "STAGE_CHANGE" } })

    expect(screen.queryByRole("button", { name: "ویرایش فعالیت" })).not.toBeInTheDocument()
  })
})
