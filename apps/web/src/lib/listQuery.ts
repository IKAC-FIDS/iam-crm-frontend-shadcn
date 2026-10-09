import { useSearchParams } from "react-router-dom"

export const PAGE_SIZES = [10, 20, 50, 100] as const
export interface PageParams {
  page: number
  limit: number
}
export interface SearchParams {
  search?: string
}
export type SortOrder = "asc" | "desc"
// Only endpoints supporting ordering should extend their query with this type.
export interface SortParams {
  sortBy?: string
  sortOrder?: SortOrder
}

export function parsePageParam(value: string | null): number {
  if (!value || !/^\d+$/.test(value)) return 1
  const page = Number(value)
  return Number.isSafeInteger(page) && page > 0 ? page : 1
}
export function parsePageSize(
  value: string | null
): (typeof PAGE_SIZES)[number] {
  return PAGE_SIZES.find((size) => size === Number(value)) ?? 20
}
export function enumParam<const T extends string>(
  value: string | null,
  options: readonly T[],
  fallback: T
): T {
  return options.includes(value as T) ? (value as T) : fallback
}
export function patchListParams(
  current: URLSearchParams,
  values: Record<string, string | number | undefined>,
  resetPage = true
) {
  const next = new URLSearchParams(current)
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === "") next.delete(key)
    else next.set(key, String(value))
  }
  if (resetPage) next.set("page", "1")
  return next
}

/** URL owns committed state. Unknown parameters (including view/companyId) survive patches. */
export function useListQueryState() {
  const [params, setParams] = useSearchParams()
  const page = parsePageParam(params.get("page"))
  // limit is the existing Meetings/Tasks convention; pageSize is accepted as an alias.
  const pageSize = parsePageSize(params.get("limit") ?? params.get("pageSize"))
  function patch(
    values: Record<string, string | number | undefined>,
    options: { resetPage?: boolean; replace?: boolean } = {}
  ) {
    setParams(
      (current) => patchListParams(current, values, options.resetPage ?? true),
      { replace: options.replace ?? false }
    )
  }
  return {
    params,
    page,
    pageSize,
    patch,
    setPage: (value: number) =>
      patch({ page: parsePageParam(String(value)) }, { resetPage: false }),
    setPageSize: (value: number) =>
      patch({ limit: parsePageSize(String(value)), pageSize: undefined }),
  }
}
