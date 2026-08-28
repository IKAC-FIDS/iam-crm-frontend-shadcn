import { describe, expect, it } from "vitest"
import { normalizeAppError } from "./appError"
import { getApiErrorMessage, unwrapApiResponse } from "./apiResponse"
import { httpError } from "@/test/fixtures"
import { uiText } from "@/config/uiText"

describe("error normalization", () => {
  it.each([[401, "unauthorized"], [403, "forbidden"], [404, "not-found"], [409, "conflict"], [422, "validation"], [503, "server"], [undefined, "network"]])("maps %s", (status, kind) => {
    const error = normalizeAppError(httpError(status as number | undefined))
    expect(error.kind).toBe(kind)
    expect(error.message).not.toContain("raw transport")
  })
  it("keeps business conflicts and field errors", () => {
    expect(getApiErrorMessage(httpError(409, { error: { message: "کد تکراری است" } }), "fallback")).toBe("کد تکراری است")
    expect(normalizeAppError(httpError(422, { error: { fieldErrors: { name: ["required"] } } })).fieldErrors).toEqual({ name: ["required"] })
  })
  it("hides server internals and unknown exception messages", () => {
    expect(getApiErrorMessage(httpError(500, { message: "SQL password secret" }), "fallback")).toBe(uiText.app.server)
    expect(getApiErrorMessage(new Error("secret"), "fallback")).toBe("fallback")
  })
  it("preserves existing response envelopes", () => {
    expect(unwrapApiResponse({ success: true, data: [1] })).toEqual([1])
    expect(unwrapApiResponse({ data: [1] })).toEqual([1])
    expect(unwrapApiResponse([1])).toEqual([1])
  })
})
