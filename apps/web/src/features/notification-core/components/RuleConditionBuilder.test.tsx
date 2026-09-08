import { useState } from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import type { NotificationRuleConditions } from "../types/rule-engine.types"
import { RuleConditionBuilder } from "./RuleConditionBuilder"

const fields = [{ field: "task.priority", label: "اولویت کار", type: "enum" as const, operators: ["EQ", "NEQ", "IN", "NOT_IN"] as const, values: ["LOW", "MEDIUM", "HIGH", "URGENT"], control: "select" as const }]

function Fixture() {
  const [value, setValue] = useState<NotificationRuleConditions | null>(null)
  return <><RuleConditionBuilder fields={fields.map(field => ({ ...field, operators: [...field.operators] }))} value={value} onChange={setValue} /><output>{JSON.stringify(value)}</output></>
}

describe("RuleConditionBuilder", () => {
  it("creates and removes a catalog-backed AND condition", async () => {
    const user = userEvent.setup()
    render(<Fixture />)
    expect(screen.getByText("برای تمام رویدادهای این نوع اجرا شود")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /افزودن شرط/ }))
    expect(screen.getByText(/"field":"task.priority"/)).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText("مقدار"), "HIGH")
    expect(screen.getByText(/"value":"HIGH"/)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "حذف شرط" }))
    expect(screen.getByText("برای تمام رویدادهای این نوع اجرا شود")).toBeInTheDocument()
  })
})
