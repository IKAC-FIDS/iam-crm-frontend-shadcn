import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { EntityConversationPanel } from "./EntityConversationPanel"

const mocks = vi.hoisted(() => ({ send: vi.fn(), read: vi.fn(), edit: vi.fn(), remove: vi.fn(), status: vi.fn(), refetch: vi.fn(), data: undefined as unknown }))

vi.mock("@/store/authStore", () => ({ useAuthStore: (selector: (state: unknown) => unknown) => selector({ user: { id: "user-1", role: "REP" } }) }))
vi.mock("../hooks/useConversation", () => ({
  useConversation: () => ({ data: mocks.data, isLoading: false, isError: false, refetch: mocks.refetch }),
  useConversationMutations: () => ({
    send: { mutateAsync: mocks.send, isPending: false }, read: { mutate: mocks.read, isPending: false },
    edit: { mutateAsync: mocks.edit, isPending: false }, remove: { mutateAsync: mocks.remove, isPending: false },
    status: { mutate: mocks.status, isPending: false },
  }),
}))

describe("EntityConversationPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.data = { thread: null, messages: [], unreadCount: 0, meta: { total: 0, page: 1, limit: 100, totalPages: 0, hasNext: false, hasPrevious: false } }
  })

  it("renders the operational empty state", () => {
    render(<EntityConversationPanel entityType="COMPANY" entityId="company-1" />)
    expect(screen.getByText("هنوز گفتگویی ثبت نشده است")).toBeInTheDocument()
  })

  it("renders a Persian question badge and parent-safe plain text", () => {
    mocks.data = { ...mocks.data as object, messages: [{ id: "m1", threadId: "t1", authorId: "user-2", author: { id: "user-2", fullName: "مدیر" }, type: "QUESTION", body: "چرا کار باز است؟", createdAt: "2026-09-17T08:00:00.000Z" }] }
    render(<EntityConversationPanel entityType="TASK" entityId="task-1" />)
    expect(screen.getByText("نیازمند پاسخ")).toBeInTheDocument()
    expect(screen.getByText("چرا کار باز است؟")).toBeInTheDocument()
  })

  it("blocks an empty message and sends a question", async () => {
    mocks.send.mockResolvedValue({})
    const user = userEvent.setup()
    render(<EntityConversationPanel entityType="ACTIVITY" entityId="activity-1" />)
    const send = screen.getByRole("button", { name: "ارسال" })
    expect(send).toBeDisabled()
    await user.click(screen.getByRole("button", { name: "پرسش" }))
    await user.type(screen.getByLabelText("متن پیام"), "نیاز به پیگیری دارد")
    await user.click(send)
    expect(mocks.send).toHaveBeenCalledWith({ body: "نیاز به پیگیری دارد", type: "QUESTION", parentMessageId: undefined })
  })
})
