import { expect, it } from "vitest"
import { companyQueryKeys } from "@/features/companies/hooks/useCompanies"
import { opportunityQueryKeys } from "@/features/opportunities/hooks/useOpportunities"
import { adminUserKeys } from "@/features/admin/users/hooks/useAdminUsers"

it("separates list caches by organization/user while preserving invalidation roots", () => {
  const params = { page: 1, limit: 20 }
  expect(companyQueryKeys.list(params, "tenant-a:user")).not.toEqual(
    companyQueryKeys.list(params, "tenant-b:user")
  )
  expect(companyQueryKeys.list(params, "tenant-a:user").slice(0, 2)).toEqual(
    companyQueryKeys.lists()
  )
  const opportunities = {
    ...params,
    ownershipScope: "all" as const,
    archiveState: "active" as const,
  }
  expect(opportunityQueryKeys.list(opportunities, "scope").slice(0, 3)).toEqual(
    opportunityQueryKeys.lists()
  )
  expect(adminUserKeys.list(params, "scope")[0]).toBe("admin-users")
  expect(adminUserKeys.count(true, "tenant-a")).not.toEqual(
    adminUserKeys.count(true, "tenant-b")
  )
})
