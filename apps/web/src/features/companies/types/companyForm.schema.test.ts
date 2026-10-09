import { describe, expect, it } from "vitest"

import { companyFormSchema } from "./companyForm.schema"

describe("companyFormSchema", () => {
  it("accepts a head-office address", () => {
    const result = companyFormSchema.safeParse({
      legalName: "شرکت نمونه",
      headOfficeAddress: "تهران، خیابان نمونه، پلاک ۱۲",
    })

    expect(result.success).toBe(true)
  })

  it("rejects an address longer than the backend limit", () => {
    const result = companyFormSchema.safeParse({
      legalName: "شرکت نمونه",
      headOfficeAddress: "آ".repeat(1001),
    })

    expect(result.success).toBe(false)
  })
})
