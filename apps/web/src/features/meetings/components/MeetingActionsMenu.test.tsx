import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { uiText } from "@/config/uiText"
import type { Meeting } from "../types/meeting.types"
import { MeetingActionsMenu } from "./MeetingActionsMenu"

const meeting = { id: "meeting-1", status: "SCHEDULED" } as Meeting

describe("MeetingActionsMenu", () => {
  it("renders permitted actions as labeled buttons for card lists", async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    const onComplete = vi.fn()
    const onCancel = vi.fn()

    render(
      <MeetingActionsMenu
        meeting={meeting}
        canUpdate
        canComplete
        canCancel
        presentation="buttons"
        onView={vi.fn()}
        onEdit={onEdit}
        onComplete={onComplete}
        onCancel={onCancel}
      />,
    )

    expect(screen.getByRole("button", { name: uiText.meetings.actions.edit })).toBeVisible()
    expect(screen.getByRole("button", { name: uiText.meetings.actions.complete })).toBeVisible()
    expect(screen.getByRole("button", { name: uiText.meetings.actions.cancel })).toBeVisible()

    await user.click(screen.getByRole("button", { name: uiText.meetings.actions.complete }))
    expect(onComplete).toHaveBeenCalledOnce()
  })

  it("does not render mutation actions for completed meetings", () => {
    render(
      <MeetingActionsMenu
        meeting={{ ...meeting, status: "COMPLETED" }}
        canUpdate
        canComplete
        canCancel
        presentation="buttons"
        onView={vi.fn()}
        onEdit={vi.fn()}
        onComplete={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })
})
