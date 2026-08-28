import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { expect, it, vi } from "vitest"
import { CreateUserModal } from "./CreateUserModal"
import { api } from "@/lib/api"
import { httpError } from "@/test/fixtures"
import { uiText } from "@/config/uiText"

vi.mock("@/lib/api", () => ({ api: { post: vi.fn(), patch: vi.fn() } }))
it("validates with Zod before submit and displays server email errors through RHF", async () => {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  const onCreated = vi.fn()
  vi.mocked(api.post).mockRejectedValue(
    httpError(422, {
      error: {
        message: "اطلاعات تکراری",
        fieldErrors: { email: ["ایمیل قبلاً ثبت شده"] },
      },
    })
  )
  render(
    <QueryClientProvider client={client}>
      <CreateUserModal
        open
        onClose={vi.fn()}
        teams={[]}
        roles={[]}
        canChangeRole={false}
        canUseTeams={false}
        onCreated={onCreated}
      />
    </QueryClientProvider>
  )
  await userEvent.click(screen.getByRole("button", { name: "ثبت کاربر" }))
  expect(api.post).not.toHaveBeenCalled()
  expect(
    await screen.findByText(uiText.common.forms.required)
  ).toBeInTheDocument()
  await userEvent.type(screen.getByLabelText(/نام کامل/), "کاربر آزمایشی")
  await userEvent.type(screen.getByLabelText(/ایمیل/), "test@example.test")
  await userEvent.type(screen.getByLabelText(/رمز عبور اولیه/), "test-secret")
  await userEvent.click(screen.getByRole("button", { name: "ثبت کاربر" }))
  expect(await screen.findByText("ایمیل قبلاً ثبت شده")).toBeInTheDocument()
  await waitFor(() =>
    expect(screen.getByLabelText(/ایمیل/)).toHaveAttribute(
      "aria-invalid",
      "true"
    )
  )
  expect(onCreated).not.toHaveBeenCalled()
  expect(api.post).toHaveBeenCalledWith("/users", {
    fullName: "کاربر آزمایشی",
    email: "test@example.test",
    password: "test-secret",
    role: "REP",
    teamId: undefined,
  })
})
