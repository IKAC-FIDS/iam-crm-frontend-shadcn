import { describe, expect, it } from "vitest"

import {
  groupName,
  permissionLabel,
} from "@/features/admin/permissions/taskPermissionLabels"
import { canReassignTask } from "@/features/tasks/taskPermissions"

const permission = (action: string) => ({
  id: action,
  action,
  name: action,
  description: null,
  group: "General",
  isActive: true,
  isSystem: true,
})

describe("task permission matrix labels", () => {
  it("groups task permissions under work management", () => {
    expect(groupName(permission("task:assign"))).toBe("کارها / مدیریت کار")
  })

  it("distinguishes assign from reassign", () => {
    expect(permissionLabel(permission("task:assign"))).toBe("ارجاع کار به سایر کاربران یا تیم‌ها")
    expect(permissionLabel(permission("task:reassign"))).toBe("تغییر مسئول کار موجود")
  })
})

describe("task reassign action policy", () => {
  it("is visible with task:reassign or the compatibility task:assign permission", () => {
    expect(canReassignTask(["task:reassign"])).toBe(true)
    expect(canReassignTask(["task:assign"])).toBe(true)
  })

  it("is hidden without either reassign permission", () => {
    expect(canReassignTask(["task:update"])).toBe(false)
  })
})
