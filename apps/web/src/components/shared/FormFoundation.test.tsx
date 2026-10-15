import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { axe, toHaveNoViolations } from "jest-axe"
import { expect, it } from "vitest"

import { FormField } from "@workspace/ui/components/form-field"
import { Input } from "@workspace/ui/components/input"
import { NativeSelect } from "@workspace/ui/components/native-select"
import { Textarea } from "@workspace/ui/components/textarea"

expect.extend(toHaveNoViolations)

it("associates labels, descriptions and errors with the control", async () => {
  const { container } = render(
    <FormField
      id="contact-value"
      label="راه ارتباطی"
      required
      description="شماره یا نشانی معتبر را وارد کنید."
      error="این مقدار معتبر نیست."
    >
      {(fieldProps) => <Input {...fieldProps} />}
    </FormField>
  )

  const input = screen.getByLabelText("راه ارتباطی")
  expect(input).toHaveAttribute("id", "contact-value")
  expect(input).toHaveAttribute("aria-invalid", "true")
  expect(input).toHaveAttribute("aria-required", "true")
  expect(input).toHaveAttribute(
    "aria-describedby",
    "contact-value-description contact-value-error"
  )
  expect(screen.getByRole("alert")).toHaveTextContent("این مقدار معتبر نیست.")
  expect(await axe(container)).toHaveNoViolations()
})

it("keeps native select semantics and exposes the compact variant explicitly", async () => {
  const user = userEvent.setup()
  render(
    <FormField id="contact-type" label="نوع تماس" optional>
      {(fieldProps) => (
        <NativeSelect {...fieldProps} size="compact" defaultValue="phone">
          <option value="phone">تلفن</option>
          <option value="email">ایمیل</option>
        </NativeSelect>
      )}
    </FormField>
  )

  const select = screen.getByLabelText("نوع تماس")
  expect(select).toHaveAttribute("data-size", "compact")
  await user.selectOptions(select, "email")
  expect(select).toHaveValue("email")
})

it("forwards disabled field state to a canonical textarea", () => {
  render(
    <FormField id="notes" label="یادداشت" disabled optional>
      {(fieldProps) => <Textarea {...fieldProps} />}
    </FormField>
  )

  expect(screen.getByLabelText("یادداشت")).toBeDisabled()
})
