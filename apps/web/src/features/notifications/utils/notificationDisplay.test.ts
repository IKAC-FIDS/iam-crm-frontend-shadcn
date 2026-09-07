import { describe, it, expect } from "vitest"
import { notificationInboxState, safeNotificationActionUrl } from "./notificationDisplay"

describe("notification navigation and inbox state", () => {
  it.each(["/tasks/task-1", "/meetings/meeting-1", "/attention?tab=notifications"])("allows internal route %s", value => {
    expect(safeNotificationActionUrl(value)).toBe(value)
  })
  it.each(["https://evil.example", "http://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)", "data:text/html,test", "/%2fexample.com", "/%5cexample.com", "/%0aexample", "%", ""])("rejects unsafe URL %s", value => {
    expect(safeNotificationActionUrl(value)).toBeNull()
  })
  it("derives states with archive taking precedence over read", () => {
    expect(notificationInboxState({})).toBe("خوانده‌نشده")
    expect(notificationInboxState({ readAt: "date" })).toBe("خوانده‌شده")
    expect(notificationInboxState({ readAt: "date", archivedAt: "date" })).toBe("بایگانی‌شده")
    expect(notificationInboxState({ archivedAt: "date" })).toBe("بایگانی‌شده")
  })
})
