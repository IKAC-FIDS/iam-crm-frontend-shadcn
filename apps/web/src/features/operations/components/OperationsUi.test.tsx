import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"

import { OperationsAttentionCards } from "./OperationsAttentionCards"
import { OperationsQuickActions } from "./OperationsQuickActions"
import { OperationsTodaySection } from "./OperationsTodaySection"

describe("Operations UI", () => {
  it("renders the workspace attention summary and makes cards actionable", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <OperationsAttentionCards
        attention={{
          dueTodayTasks: 4,
          overdueTasks: 2,
          unreadConversationMessages: 6,
          meetingsToday: 1,
          activeOpportunities: 9,
        }}
        onSelect={onSelect}
      />
    )

    expect(screen.getByText("کارهای امروز")).toBeInTheDocument()
    expect(screen.getByText("۶")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /کارهای عقب‌افتاده/ }))
    expect(onSelect).toHaveBeenCalledWith("overdue")
  })

  it("opens the product price drawer action when product access exists", async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(
      <OperationsQuickActions
        permissions={["product:view"]}
        onAction={onAction}
      />
    )

    await user.click(screen.getByRole("button", { name: "قیمت محصولات" }))
    expect(onAction).toHaveBeenCalledWith("products")
  })

  it("only renders quick actions allowed by permissions", () => {
    render(
      <OperationsQuickActions
        permissions={["task:create"]}
        onAction={vi.fn()}
      />
    )

    expect(screen.getByRole("button", { name: "کار جدید" })).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "فرصت جدید" })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "قیمت محصولات" })
    ).not.toBeInTheDocument()
  })

  it("renders creator, related users and CRM context for my conversations", () => {
    render(
      <MemoryRouter>
        <OperationsTodaySection
          workspace={{
            attention: {
              dueTodayTasks: 0,
              overdueTasks: 0,
              unreadConversationMessages: 1,
              meetingsToday: 0,
              activeOpportunities: 0,
            },
            today: { tasks: [], meetings: [] },
            recentConversations: [
              {
                threadId: "thread-1",
                entityType: "TASK",
                entityId: "task-1",
                status: "OPEN",
                updatedAt: "2026-10-03T08:00:00.000Z",
                unreadCount: 1,
                createdBy: { id: "user-1", fullName: "فرزاد نوروزی فرد" },
                relatedUsers: [{ id: "user-2", fullName: "مهتاب امیری" }],
                context: {
                  company: { id: "company-1", name: "پرتو داچک" },
                  opportunity: { id: "opportunity-1", title: "فروش توکن" },
                  task: { id: "task-1", title: "بررسی پیشنهاد" },
                },
                latestMessage: {
                  id: "message-1",
                  body: "لطفاً بررسی کنید",
                  type: "COMMENT",
                  createdAt: "2026-10-03T08:00:00.000Z",
                  author: { id: "user-1", fullName: "فرزاد نوروزی فرد" },
                },
              },
            ],
            personalTodos: {
              today: [],
              upcoming: [],
              completed: [],
              counts: { today: 0, overdue: 0, upcoming: 0 },
            },
          }}
        />
      </MemoryRouter>
    )

    expect(screen.getByText("ایجادکننده: فرزاد نوروزی فرد")).toBeInTheDocument()
    expect(
      screen.getByText("افراد مرتبط / تگ‌شده: مهتاب امیری")
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        "شرکت: پرتو داچک · فرصت: فروش توکن · کار: بررسی پیشنهاد"
      )
    ).toBeInTheDocument()
  })
})
