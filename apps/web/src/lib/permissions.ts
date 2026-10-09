export const FINANCIAL_VIEW_PERMISSION = "financial:view" as const

export function canViewFinancials(permissions?: readonly string[] | null) {
  return Boolean(permissions?.includes(FINANCIAL_VIEW_PERMISSION))
}
