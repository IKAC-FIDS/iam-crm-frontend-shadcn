import { expect, it } from "vitest"

import { groupName, permissionLabel } from "./taskPermissionLabels"

it("uses the server-provided financial permission label and group", () => {
  const permission = {
    id: "financial-view",
    action: "financial:view",
    name: "مشاهده اطلاعات مالی",
    description: "مشاهده اطلاعات مالی",
    group: "اطلاعات مالی",
    isActive: true,
    isSystem: true,
  }

  expect(groupName(permission)).toBe("اطلاعات مالی")
  expect(permissionLabel(permission)).toBe("مشاهده اطلاعات مالی")
})

it("groups and labels collaboration permissions in Persian", () => {
  const permission = {
    id: "collaboration-topic-create",
    action: "collaboration:topic:create",
    name: null,
    description: null,
    group: null,
    isActive: true,
    isSystem: true,
  }
  expect(groupName(permission)).toBe("مرکز همکاری")
  expect(permissionLabel(permission)).toBe("ایجاد موضوع")
})
