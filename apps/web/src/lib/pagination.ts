import { z } from "zod"
import { uiText } from "@/config/uiText"

export class ApiContractError extends Error {
  constructor() {
    super(uiText.app.invalidResponse)
    this.name = "ApiContractError"
  }
}
export const paginationMetaSchema = z
  .object({
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
    hasNext: z.boolean().optional(),
    hasPrevious: z.boolean().optional(),
  })
  .transform((meta) => ({
    ...meta,
    hasNext: meta.hasNext ?? meta.page < meta.totalPages,
    hasPrevious: meta.hasPrevious ?? meta.page > 1,
  }))
export type PaginationMeta = z.output<typeof paginationMetaSchema>
export interface PaginatedResult<T> {
  data: T[]
  meta: PaginationMeta
}

/** Confirmed list envelope: meta is a sibling of data, not inside unwrapApiResponse(data). */
export function parsePaginatedResponse<T>(
  value: unknown,
  rowSchema: z.ZodType<T>
): PaginatedResult<T> {
  const result = z
    .object({
      success: z.literal(true).optional(),
      data: z.array(rowSchema),
      meta: paginationMetaSchema,
    })
    .safeParse(value)
  if (!result.success) {
    if (import.meta.env.DEV)
      console.warn(
        "Invalid paginated API contract",
        result.error.issues.map(({ path, code }) => ({ path, code }))
      )
    throw new ApiContractError()
  }
  return result.data
}
