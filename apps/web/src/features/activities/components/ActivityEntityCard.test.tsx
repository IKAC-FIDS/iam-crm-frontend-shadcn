import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import type { Activity } from "../types/activity.types"
import { ActivityEntityCard } from "./ActivityEntityCard"

const activity: Activity = {
  id: "activity-1",
  type: "CALL",
  status: "RECORDED",
  companyId: "company-1",
  company: { id: "company-1", legalName: "شرکت نمونه" },
  person: { id: "person-1", fullName: "مریم احمدی" },
  owner: { id: "owner-1", fullName: "فرزانه هاشمی", team: "فروش سازمانی" },
  createdBy: { id: "user-1", fullName: "علی رضایی", team: "فروش" },
}

function renderCard(item: Activity = activity) {
  const onView = vi.fn()
  const onEdit = vi.fn()
  const onViewCompany = vi.fn()
  render(
    <ActivityEntityCard
      activity={item}
      title="تماس پیگیری"
      subtitle="نتیجه تماس ثبت شد"
      typeLabel="تماس تلفنی"
      dateLabel="۱۴۰۵/۰۷/۰۲"
      canUpdate
      onView={onView}
      onEdit={onEdit}
      onViewCompany={onViewCompany}
    />,
  )
  return { onView, onEdit, onViewCompany }
}

describe("ActivityEntityCard", () => {
  it("renders activity data and every permitted action directly", async () => {
    const user = userEvent.setup()
    const callbacks = renderCard()

    expect(screen.getByText("تماس پیگیری")).toBeInTheDocument()
    expect(screen.getByText("تماس تلفنی")).toBeInTheDocument()
    expect(screen.getByText("ثبت‌شده")).toBeInTheDocument()
    expect(screen.getByText("فرزانه هاشمی")).toBeInTheDocument()
    expect(screen.getByText("مریم احمدی")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "ویرایش فعالیت" }))
    await user.click(screen.getByRole("button", { name: "مشاهده شرکت" }))
    expect(callbacks.onEdit).toHaveBeenCalledOnce()
    expect(callbacks.onViewCompany).toHaveBeenCalledOnce()
  })

  it("does not expose edit for a system stage-change activity", () => {
    renderCard({ ...activity, type: "STAGE_CHANGE" })
    expect(screen.queryByRole("button", { name: "ویرایش فعالیت" })).not.toBeInTheDocument()
  })
})
