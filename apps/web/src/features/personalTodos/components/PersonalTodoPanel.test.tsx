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
vi.mock("@/features/operations/hooks/useOperationsWorkspace", () => ({
  useOperationsWorkspace: () => ({ data: undefined, isLoading: false }),
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
    await user.click(screen.getByRole("button", { name: "افزودن سریع" }))
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
    await user.click(
      screen.getByRole("button", { name: "ایجاد کار شخصی با جزئیات" })
    )
    expect(
      screen.getByRole("button", { name: "فرصت مرتبط با کار شخصی" })
    ).toBeDisabled()
    expect(screen.getByText("زمان انجام")).toBeInTheDocument()
    expect(screen.getByText("زمان یادآوری")).toBeInTheDocument()
  })

  it("presents custom recurrence as a readable day interval", async () => {
    const user = userEvent.setup()
    render(<PersonalTodoPanel data={data} />)
    await user.click(
      screen.getByRole("button", { name: "ایجاد کار شخصی با جزئیات" })
    )
    await user.click(screen.getByRole("button", { name: "تکرار کار شخصی" }))
    await user.click(screen.getByText("سفارشی"))
    expect(screen.getByLabelText("تعداد روزهای فاصله تکرار")).toHaveValue(2)
    expect(screen.getByText("روز یک‌بار")).toBeInTheDocument()
  })

  it("opens todo editing in a modal instead of expanding the panel", async () => {
    const user = userEvent.setup()
    render(<PersonalTodoPanel data={data} />)
    await user.click(screen.getByRole("button", { name: "ویرایش" }))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByText("ویرایش کار شخصی")).toBeInTheDocument()
    expect(screen.getByLabelText("عنوان کار شخصی در فرم")).toHaveValue(
      "تماس با مدیر IT"
    )
  })

  it("renders another user's todos as read-only", () => {
    render(<PersonalTodoPanel data={data} readOnly subjectName="مهتاب امیری" />)
    expect(screen.getByText("کارهای شخصی مهتاب امیری")).toBeInTheDocument()
    expect(screen.queryByLabelText("عنوان کار شخصی")).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "ویرایش" })
    ).not.toBeInTheDocument()
  })

  it("never keeps a completed todo in an open tab when payloads overlap", async () => {
    const user = userEvent.setup()
    const completedTodo = {
      ...todo,
      status: "DONE" as const,
    }
    render(
      <PersonalTodoPanel
        data={{
          ...data,
          today: [completedTodo],
          completed: [completedTodo],
        }}
      />
    )

    expect(screen.queryByText(completedTodo.title)).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "تکمیل‌شده" }))
    expect(screen.getByText(completedTodo.title)).toBeInTheDocument()
  })

  it("labels an open recurring occurrence so it is not confused with the completed one", () => {
    render(
      <PersonalTodoPanel
        data={{
          ...data,
          today: [{ ...todo, recurrenceType: "DAILY" as const }],
        }}
      />
    )

    expect(screen.getByText("تکرار: هر روز")).toBeInTheDocument()
  })
})
