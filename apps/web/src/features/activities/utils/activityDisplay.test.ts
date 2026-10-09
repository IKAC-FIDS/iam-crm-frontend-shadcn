import { describe, expect, it } from "vitest"

import { getActivityTypeLabel } from "./activityDisplay"

describe("getActivityTypeLabel", () => {
  it("returns Persian labels for established activity types", () => {
    expect(getActivityTypeLabel("CALL")).toBe("تماس تلفنی")
    expect(getActivityTypeLabel("LINKEDIN_MESSAGE")).toBe("پیام لینکدین")
  })

  it("keeps custom library codes readable", () => {
    expect(getActivityTypeLabel("CUSTOM_FOLLOW_UP")).toBe("CUSTOM FOLLOW UP")
    expect(getActivityTypeLabel(undefined)).toBe("—")
  })
})
