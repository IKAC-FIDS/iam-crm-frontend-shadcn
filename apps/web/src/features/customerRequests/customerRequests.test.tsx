import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { DynamicRequestForm } from "./DynamicRequestForm"
import { validateDynamicAnswers } from "./customerRequests.presentation"
import type { FormSchema } from "./customerRequests.types"

const schema: FormSchema = {
  fields: [
    { key: "subject", type: "TEXT", label: "موضوع", required: true },
    {
      key: "kind",
      type: "SELECT",
      label: "نوع",
      options: [
        { value: "A", label: "گزینه الف" },
        { value: "B", label: "گزینه ب" },
      ],
    },
    {
      key: "details",
      type: "TEXTAREA",
      label: "شرح",
      visibleWhen: { field: "kind", equals: "B" },
      requiredWhen: { field: "kind", equals: "B" },
    },
    { key: "accept", type: "BOOLEAN", label: "تأیید" },
  ],
}
describe("dynamic customer request form", () => {
  it("renders Persian RTL-friendly labels and supported controls", () => {
    render(
      <DynamicRequestForm schema={schema} value={{}} onChange={() => {}} />
    )
    expect(screen.getByLabelText(/موضوع/)).toBeInTheDocument()
    expect(screen.getByLabelText(/نوع/)).toBeInTheDocument()
    expect(screen.queryByLabelText(/شرح/)).not.toBeInTheDocument()
  })
  it("updates answers and reveals conditional fields", async () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <DynamicRequestForm schema={schema} value={{}} onChange={onChange} />
    )
    await userEvent.selectOptions(screen.getByLabelText(/نوع/), "B")
    expect(onChange).toHaveBeenCalledWith({ kind: "B" })
    rerender(
      <DynamicRequestForm
        schema={schema}
        value={{ kind: "B" }}
        onChange={onChange}
      />
    )
    expect(screen.getByLabelText(/شرح/)).toBeInTheDocument()
  })
  it("validates required and conditional fields before submission", () => {
    expect(validateDynamicAnswers(schema, {})).toMatchObject({
      subject: expect.any(String),
    })
    expect(
      validateDynamicAnswers(schema, { subject: "x", kind: "B" })
    ).toMatchObject({ details: expect.any(String) })
    expect(validateDynamicAnswers(schema, { subject: "x", kind: "A" })).toEqual(
      {}
    )
  })
  it("renders restored draft values", () => {
    render(
      <DynamicRequestForm
        schema={schema}
        value={{ subject: "درخواست ذخیره‌شده", kind: "A", accept: true }}
        onChange={() => {}}
      />
    )
    expect(screen.getByDisplayValue("درخواست ذخیره‌شده")).toBeInTheDocument()
    expect(screen.getByRole("checkbox")).toBeChecked()
  })
})
