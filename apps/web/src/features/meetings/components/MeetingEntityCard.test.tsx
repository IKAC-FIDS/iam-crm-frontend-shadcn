import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import type { Meeting } from "../types/meeting.types"
import { MeetingEntityCard } from "./MeetingEntityCard"

vi.mock("@/components/shared/IdentityAvatar", () => ({
  IdentityAvatar: ({ name, mediaPath }: { name: string; mediaPath?: string | null }) => (
    <span data-testid="identity-avatar" data-media-path={mediaPath}>{name}</span>
  ),
}))

const meeting: Meeting = {
  id: "meeting-1",
  companyId: "company-1",
  title: "جلسه بررسی قرارداد",
  meetingTypeId: "type-1",
  type: { id: "type-1", code: "SALES", label: "جلسه فروش", sortOrder: 1, isActive: true },
  mode: "IN_PERSON",
  location: "دفتر مرکزی",
  startAt: "2026-09-24T08:00:00.000Z",
  endAt: "2026-09-24T09:00:00.000Z",
  status: "SCHEDULED",
  company: { id: "company-1", legalName: "شرکت نمونه", logoObjectKey: "logos/company-1.png" },
  organizer: { id: "user-1", fullName: "کاربر نمونه", avatarObjectKey: "avatars/user-1.png" },
  assignees: [],
}

describe("MeetingEntityCard", () => {
  it("renders meeting data, media paths and every permitted action", () => {
    const handlers = {
      onView: vi.fn(),
      onEdit: vi.fn(),
      onComplete: vi.fn(),
      onCancel: vi.fn(),
    }

    render(
      <MeetingEntityCard
        meeting={meeting}
        canUpdate
        canComplete
        canCancel
        {...handlers}
      />,
    )

    expect(screen.getByText("جلسه بررسی قرارداد")).toBeVisible()
    expect(screen.getByText("برنامه‌ریزی‌شده")).toBeVisible()
    expect(screen.getByText("جلسه فروش")).toBeVisible()
    expect(screen.getByText("دفتر مرکزی")).toBeVisible()
    expect(screen.getAllByTestId("identity-avatar")[0]).toHaveAttribute("data-media-path", "/companies/company-1/logo")
    expect(screen.getAllByTestId("identity-avatar")[1]).toHaveAttribute("data-media-path", "/users/user-1/avatar")

    expect(screen.getByRole("button", { name: "مشاهده جلسه جلسه بررسی قرارداد" })).toBeVisible()
    expect(screen.getByRole("button", { name: "ویرایش جلسه" })).toBeVisible()
    expect(screen.getByRole("button", { name: "ثبت به‌عنوان برگزارشده" })).toBeVisible()
    expect(screen.getByRole("button", { name: "لغو جلسه" })).toBeVisible()

    fireEvent.click(screen.getByRole("button", { name: "ویرایش جلسه" }))
    expect(handlers.onEdit).toHaveBeenCalledOnce()
    expect(handlers.onView).not.toHaveBeenCalled()
  })

  it("hides mutation actions for a completed meeting", () => {
    render(
      <MeetingEntityCard
        meeting={{ ...meeting, status: "COMPLETED" }}
        canUpdate
        canComplete
        canCancel
        onView={vi.fn()}
        onEdit={vi.fn()}
        onComplete={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByText("برگزارشده")).toBeVisible()
    expect(screen.queryByRole("button", { name: "ویرایش جلسه" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "ثبت به‌عنوان برگزارشده" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "لغو جلسه" })).not.toBeInTheDocument()
  })
})
