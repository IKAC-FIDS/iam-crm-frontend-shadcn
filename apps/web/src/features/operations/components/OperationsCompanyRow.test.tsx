import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import type { OperationsCompanyRow as OperationsCompanyRowType } from "../types/operations.types"
import { OperationsCompanyRow } from "./OperationsCompanyRow"

function createRow(
  overrides: Partial<OperationsCompanyRowType> = {}
): OperationsCompanyRowType {
  return {
    company: {
      id: "company-1",
      legalName: "شرکت نمونه",
      brandName: "نمونه",
      logoObjectKey: null,
      priority: "HIGH",
      owner: null,
    },
    activeOpportunities: {
      count: 2,
      items: [
        {
          id: "opportunity-1",
          title: "فروش سازمانی",
          stage: { id: "stage-1", label: "مذاکره" },
        },
      ],
    },
    tasks: {
      open: 1,
      overdue: 1,
      dueToday: 0,
      next: {
        id: "task-1",
        title: "تماس تلفنی",
        dueAt: "2026-10-01T10:30:00.000Z",
        priority: "HIGH",
      },
    },
    conversation: { unreadCount: 3 },
    lastActivity: {
      id: "activity-1",
      type: "PHONE_CALL",
      occurredAt: "2026-09-30T09:00:00.000Z",
    },
    nextMeeting: null,
    nextAction: {
      type: "TASK",
      id: "task-1",
      title: "تماس تلفنی",
      at: "2026-10-01T10:30:00.000Z",
    },
    attention: { state: "OVERDUE", reason: "کار عقب‌افتاده" },
    ...overrides,
  }
}

describe("OperationsCompanyRow", () => {
  it("renders the operational company summary without row-level requests", () => {
    render(
      <OperationsCompanyRow
        row={createRow()}
        permissions={[]}
        onAction={vi.fn()}
      />
    )

    expect(screen.getByText("شرکت نمونه")).toBeInTheDocument()
    expect(screen.getByText("زیاد")).toBeInTheDocument()
    expect(screen.getByText("۲ فرصت")).toBeInTheDocument()
    expect(screen.getByText("تماس تلفنی")).toBeInTheDocument()
    expect(screen.getByText("عقب‌افتاده")).toBeInTheDocument()
    expect(screen.getByText("PHONE CALL")).toBeInTheDocument()
  })

  it("shows unread count and opens the company conversation", async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(
      <OperationsCompanyRow
        row={createRow()}
        permissions={[]}
        onAction={onAction}
      />
    )

    expect(screen.getByText("۳")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "گفتگوی شرکت نمونه" }))
    expect(onAction).toHaveBeenCalledWith(
      "conversation",
      expect.objectContaining({
        company: expect.objectContaining({ id: "company-1" }),
      })
    )
  })

  it("opens the shared task workflow with company context", async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(
      <OperationsCompanyRow
        row={createRow()}
        permissions={["task:create"]}
        onAction={onAction}
      />
    )

    await user.click(
      screen.getByRole("button", { name: "ایجاد کار برای شرکت نمونه" })
    )
    expect(onAction).toHaveBeenCalledWith(
      "task",
      expect.objectContaining({
        company: expect.objectContaining({ id: "company-1" }),
      })
    )
  })

  it("renders a prominent follow-up action for active accounts without a next action", async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    const row = createRow({
      tasks: { open: 0, overdue: 0, dueToday: 0, next: null },
      nextAction: null,
      attention: { state: "NO_NEXT_ACTION" },
    })
    render(
      <OperationsCompanyRow
        row={row}
        permissions={["task:create"]}
        onAction={onAction}
      />
    )

    expect(screen.getByText("بدون پیگیری")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "ایجاد پیگیری" }))
    expect(onAction).toHaveBeenCalledWith("task", row)
  })

  it("keeps all permitted primary actions available in the responsive row", () => {
    render(
      <OperationsCompanyRow
        row={createRow()}
        permissions={["task:create", "activity:create", "opportunity:create"]}
        onAction={vi.fn()}
      />
    )

    expect(
      screen.getByRole("button", { name: "ایجاد کار برای شرکت نمونه" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "ثبت فعالیت برای شرکت نمونه" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "گفتگوی شرکت نمونه" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "ایجاد فرصت برای شرکت نمونه" })
    ).toBeInTheDocument()
  })

  it("hides mutation actions when permissions are unavailable", () => {
    render(
      <OperationsCompanyRow
        row={createRow()}
        permissions={[]}
        onAction={vi.fn()}
      />
    )

    expect(
      screen.queryByRole("button", { name: "ایجاد کار برای شرکت نمونه" })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "ثبت فعالیت برای شرکت نمونه" })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "ایجاد فرصت برای شرکت نمونه" })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "گفتگوی شرکت نمونه" })
    ).toBeInTheDocument()
  })
})
