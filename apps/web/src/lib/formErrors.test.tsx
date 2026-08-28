import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useForm } from "react-hook-form"
import { expect, it, vi } from "vitest"
import { normalizeAppError } from "./appError"
import { applyServerFieldErrors } from "./formErrors"
import { httpError } from "@/test/fixtures"

it("maps structured arrays and nested details without guessing fields from text", () => {
  expect(
    normalizeAppError(
      httpError(422, {
        error: { details: [{ field: "email", message: "تکراری" }] },
      })
    ).fieldErrors
  ).toEqual({ email: ["تکراری"] })
  expect(
    normalizeAppError(
      httpError(400, {
        error: {
          details: ["email must be an email"],
          message: "email must be an email",
        },
      })
    ).fieldErrors
  ).toEqual({})
})
it("only applies allowed field names, aliases and a general error", () => {
  const setError = vi.fn()
  applyServerFieldErrors<{ email: string; roleChoice: string }>(
    httpError(422, {
      error: {
        message: "اصلاح کنید",
        details: {
          fieldErrors: {
            roleId: ["نقش نامعتبر"],
            unknown: ["no"],
            email: ["تکراری"],
          },
        },
      },
    }),
    setError,
    ["email", "roleChoice"],
    { roleId: "roleChoice" }
  )
  expect(setError).toHaveBeenCalledWith(
    "roleChoice",
    expect.objectContaining({ message: "نقش نامعتبر" }),
    { shouldFocus: true }
  )
  expect(setError.mock.calls.some(([name]) => name === "unknown")).toBe(false)
  expect(setError).toHaveBeenCalledWith(
    "root.server",
    expect.objectContaining({ message: "اصلاح کنید" })
  )
})
it("connects API errors to RHF state, focus and general error presentation", async () => {
  function Form() {
    const {
      register,
      setError,
      handleSubmit,
      formState: { errors },
    } = useForm<{ email: string }>({ defaultValues: { email: "" } })
    return (
      <form
        onSubmit={handleSubmit(() =>
          applyServerFieldErrors(
            httpError(422, {
              error: {
                message: "اطلاعات تکراری",
                fieldErrors: { email: ["ایمیل استفاده شده"] },
              },
            }),
            setError,
            ["email"]
          )
        )}
      >
        <label htmlFor="email">ایمیل</label>
        <input
          id="email"
          {...register("email")}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email ? <p>{errors.email.message}</p> : null}
        {errors.root?.server ? (
          <p role="alert">{errors.root.server.message}</p>
        ) : null}
        <button>ثبت</button>
      </form>
    )
  }
  render(<Form />)
  await userEvent.click(screen.getByRole("button", { name: "ثبت" }))
  expect(screen.getByText("ایمیل استفاده شده")).toBeInTheDocument()
  expect(screen.getByLabelText("ایمیل")).toHaveFocus()
  expect(screen.getByRole("alert")).toHaveTextContent("اطلاعات تکراری")
})
