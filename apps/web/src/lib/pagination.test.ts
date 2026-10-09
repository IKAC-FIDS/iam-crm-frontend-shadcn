import { expect, it, vi } from "vitest"
import { z } from "zod"
import { ApiContractError, parsePaginatedResponse } from "./pagination"
import { normalizeAppError } from "./appError"
import { uiText } from "@/config/uiText"

const schema = z.object({ id: z.string() })
it("preserves sibling metadata in raw and standard envelopes including zero records", () => {
  const body = {
    data: [],
    meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
  }
  expect(parsePaginatedResponse(body, schema)).toEqual({
    ...body,
    meta: { ...body.meta, hasNext: false, hasPrevious: false },
  })
  expect(
    parsePaginatedResponse({ ...body, success: true }, schema).meta.total
  ).toBe(0)
})
it("fails closed on malformed envelopes instead of treating them as empty", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
  for (const body of [
    { data: [] },
    { success: false, data: [], meta: {} },
    { data: [null], meta: { page: 1, limit: 20, total: 1, totalPages: 1 } },
  ]) {
    expect(() => parsePaginatedResponse(body, schema)).toThrow(ApiContractError)
  }
  expect(normalizeAppError(new ApiContractError())).toMatchObject({
    message: uiText.app.invalidResponse,
    retryable: false,
  })
  warn.mockRestore()
})
