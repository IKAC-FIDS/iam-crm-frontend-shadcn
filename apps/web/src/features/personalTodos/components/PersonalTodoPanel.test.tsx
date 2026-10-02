import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PersonalTodoPanel } from "./PersonalTodoPanel"

const mutateAsync = vi.fn().mockResolvedValue({})
vi.mock("../hooks/usePersonalTodos", () => ({
  usePersonalTodoMutations: () => ({
    create: { mutateAsync, isPending: false },
    update: { mutateAsync },
    complete: { mutateAsync },
    reopen: { mutateAsync },
    remove: { mutateAsync },
    convert: { mutateAsync },
  }),
}))
vi.mock("@/store/authStore", () => ({
  useAuthStore: (
    selector: (state: { user: { permissions: string[] } }) => unknown
  ) => selector({ user: { permissions: ["task:create"] } }),
}))
vi.mock("@/features/tasks/hooks/useTasks", () => ({
  useTaskOpportunityOptions: () => ({
    data: undefined,
    isLoading: false,
    isFetching: false,
  }),
}))
vi.mock("@/features/people/components/SearchableCompanySelect", () => ({
  SearchableCompanySelect: () => (
    <button type="button" aria-label="شرکت مرتبط">
      انتخاب شرکت
    </button>
  ),
}))

const todo = {
  id: "todo-1",
  title: "تماس با مدیر IT",
  status: "TODO" as const,
  recurrenceType: "NONE" as const,
  recurrenceInterval: 1,
  dueAt: "2026-10-01T10:00:00.000Z",
  company: { id: "company-1", legalName: "رهسا" },
}
const data = {
  today: [todo],
  upcoming: [],
  completed: [],
  counts: { today: 1, overdue: 1, upcoming: 0 },
}

describe("PersonalTodoPanel", () => {
  beforeEach(() => mutateAsync.mockClear())

  it("renders private todos and their CRM relation", () => {
    render(<PersonalTodoPanel data={data} />)
    expect(screen.getByText("کارهای شخصی من")).toBeInTheDocument()
    expect(screen.getByText("تماس با مدیر IT")).toBeInTheDocument()
    expect(screen.getByText(/رهسا/)).toBeInTheDocument()
  })

  it("supports fast creation", async () => {
    const user = userEvent.setup()
    render(<PersonalTodoPanel data={data} />)
    await user.type(screen.getByLabelText("عنوان کار شخصی"), "مرور گزارش فروش")
    await user.click(screen.getByRole("button", { name: "افزودن" }))
    expect(mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "مرور گزارش فروش",
        recurrenceType: "NONE",
      })
    )
  })

  it("shows tabs and converts a todo to a formal task", async () => {
    const user = userEvent.setup()
    render(<PersonalTodoPanel data={data} />)
    expect(screen.getByRole("button", { name: "آینده" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /تبدیل به کار/ }))
    expect(mutateAsync).toHaveBeenCalledWith("todo-1")
  })

  it("exposes the optional company-scoped opportunity relation", async () => {
    const user = userEvent.setup()
    render(<PersonalTodoPanel data={data} />)
    await user.click(screen.getByRole("button", { name: "جزئیات" }))
    expect(
      screen.getByRole("button", { name: "فرصت مرتبط با کار شخصی" })
    ).toBeDisabled()
  })
})
