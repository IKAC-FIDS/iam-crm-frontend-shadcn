import { describe, expect, it } from "vitest"

import { canViewFinancials } from "./permissions"

describe("canViewFinancials", () => {
  it("uses only the effective permission list", () => {
    expect(canViewFinancials(["financial:view"])).toBe(true)
    expect(canViewFinancials(["report:view", "opportunity:view"])).toBe(false)
    expect(canViewFinancials(undefined)).toBe(false)
  })
})
