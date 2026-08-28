import { beforeEach, describe, expect, it, vi } from "vitest"
import { queryClient } from "@/lib/queryClient"
import { api } from "@/lib/api"
import { normalizeAuthUser, useAuthStore } from "@/store/authStore"
import { httpError, response, user } from "@/test/fixtures"
import { applyAuthenticatedSession } from "../utils/authSession"
import { logoutSession, refreshSession, restoreSession, sessionClient, watchBrowserSession, mutateBrowserSession } from "./session.service"
import { sessionEventKey } from "./sessionCoordinator"

beforeEach(() => {
  useAuthStore.getState().clearUser()
  useAuthStore.setState({ status: "loading" })
  localStorage.clear()
})

describe("session lifecycle", () => {
  it("retries an expired bearer mutation after releasing the cross-tab lock", async () => {
    applyAuthenticatedSession({ user, accessToken: "expired" })
    vi.spyOn(sessionClient, "post").mockResolvedValue(response({ accessToken: "fresh", user }))
    const send = vi.spyOn(sessionClient, "request").mockRejectedValueOnce(httpError(401)).mockResolvedValueOnce(response({ revokedCount: 1 }))
    await expect(mutateBrowserSession("post", "/auth/account/logout-other-sessions")).resolves.toEqual({ revokedCount: 1 })
    expect(send).toHaveBeenCalledTimes(2)
    expect(send).toHaveBeenLastCalledWith(expect.objectContaining({ headers: { Authorization: "Bearer fresh" } }))
  })
  it("a newly opened tab honors a logout notification it did not witness", async () => {
    localStorage.setItem(sessionEventKey, JSON.stringify({ id: "prior-logout", kind: "logout" }))
    const post = vi.spyOn(sessionClient, "post")
    await restoreSession()
    expect(post).not.toHaveBeenCalled()
    expect(useAuthStore.getState().status).toBe("anonymous")
  })
  it("does not rotate away the selected current session before revocation", async () => {
    applyAuthenticatedSession({ user, accessToken: "current" })
    const post = vi.spyOn(sessionClient, "post")
    const send = vi.spyOn(sessionClient, "request").mockResolvedValue(response({ revokedCurrentSession: true }))
    await mutateBrowserSession("delete", "/auth/sessions/selected-current")
    expect(post).not.toHaveBeenCalled()
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ url: "/auth/sessions/selected-current" }))
    expect(useAuthStore.getState().status).toBe("anonymous")
  })
  it("remote logout cancels a queued refresh before it can send the cookie", async () => {
    const stop = watchBrowserSession()
    const post = vi.spyOn(sessionClient, "post").mockResolvedValue(response({ accessToken: "late", user }))
    const pending = refreshSession()
    localStorage.setItem(sessionEventKey, JSON.stringify({ id: "remote-logout", kind: "logout" }))
    window.dispatchEvent(new Event("storage"))
    await expect(pending).rejects.toThrow("superseded")
    expect(post).not.toHaveBeenCalled()
    expect(useAuthStore.getState().status).toBe("anonymous")
    stop()
  })
  it("remote tenant/session change clears old queries and restores the new context", async () => {
    applyAuthenticatedSession({ user, accessToken: "old" })
    queryClient.setQueryData(["tenant-old"], { private: true })
    const stop = watchBrowserSession()
    vi.spyOn(sessionClient, "post").mockResolvedValue(response({ accessToken: "new", user: { ...user, organizationId: "tenant-new" } }))
    localStorage.setItem(sessionEventKey, JSON.stringify({ id: "remote-change", kind: "changed" }))
    window.dispatchEvent(new Event("storage"))
    await vi.waitFor(() => expect(useAuthStore.getState().user?.organizationId).toBe("tenant-new"))
    expect(queryClient.getQueryData(["tenant-old"])).toBeUndefined()
    stop()
  })
  it("discards protected responses from a previous login", async () => {
    applyAuthenticatedSession({ user, accessToken: "old" })
    let finish!: (value: ReturnType<typeof response>) => void
    const adapter = vi.fn(config => new Promise<ReturnType<typeof response>>(resolve => {
      finish = value => resolve({ ...value, config })
    }))
    const pending = api.get("/companies", { adapter })
    await vi.waitFor(() => expect(adapter).toHaveBeenCalled())
    useAuthStore.getState().clearUser()
    finish(response({ private: true }))
    await expect(pending).rejects.toBeDefined()
  })
  it("does not accept malformed session payloads", () => {
    expect(() => applyAuthenticatedSession({ user, accessToken: "" })).toThrow()
    expect(useAuthStore.getState().user).toBeNull()
  })
  it("normalizes missing optional data and rejects invalid users", () => {
    expect(normalizeAuthUser({ ...user, permissions: ["read", 4], teamName: undefined, team: "A" })).toMatchObject({ permissions: ["read"], teamName: "A" })
    expect(normalizeAuthUser({ id: "broken" })).toBeNull()
  })
  it("does not persist credentials or user data and removes legacy storage", () => {
    localStorage.setItem("accessToken", "old")
    localStorage.setItem("auth-storage", "old-user")
    applyAuthenticatedSession({ user, accessToken: "memory-only" })
    expect(useAuthStore.getState().accessToken).toBe("memory-only")
    expect(localStorage.length).toBe(0)
  })
  it("restores session after reload using one concurrent refresh", async () => {
    const post = vi.spyOn(sessionClient, "post").mockResolvedValue(response({ accessToken: "fresh", user }))
    await Promise.all([restoreSession(), restoreSession()])
    expect(post).toHaveBeenCalledTimes(1)
    expect(useAuthStore.getState().status).toBe("authenticated")
  })
  it("treats expired cookie as anonymous", async () => {
    vi.spyOn(sessionClient, "post").mockRejectedValue(httpError(401))
    await restoreSession()
    expect(useAuthStore.getState().status).toBe("anonymous")
  })
  it("offers retry on bootstrap network failure without inventing invalid credentials", async () => {
    vi.spyOn(sessionClient, "post").mockRejectedValue(httpError())
    await restoreSession()
    expect(useAuthStore.getState().status).toBe("error")
  })
  it("retains an established session on temporary refresh failure", async () => {
    applyAuthenticatedSession({ user, accessToken: "old" })
    vi.spyOn(sessionClient, "post").mockRejectedValue(httpError(503))
    await expect(refreshSession()).rejects.toBeDefined()
    expect(useAuthStore.getState().user?.id).toBe(user.id)
  })
  it("does not resurrect the session when refresh finishes after local logout", async () => {
    let finish!: (value: ReturnType<typeof response>) => void
    const post = vi.spyOn(sessionClient, "post").mockImplementation(() => new Promise(resolve => { finish = resolve }))
    const pending = refreshSession()
    await vi.waitFor(() => expect(post).toHaveBeenCalled())
    useAuthStore.getState().clearUser()
    finish(response({ accessToken: "late", user }))
    await expect(pending).rejects.toThrow()
    expect(useAuthStore.getState().user).toBeNull()
  })
  it("clears queries and local session even when server logout fails", async () => {
    applyAuthenticatedSession({ user, accessToken: "old" })
    queryClient.setQueryData(["private"], { secret: true })
    vi.spyOn(sessionClient, "post").mockRejectedValue(httpError())
    await expect(logoutSession()).rejects.toBeDefined()
    expect(queryClient.getQueryData(["private"])).toBeUndefined()
    expect(useAuthStore.getState().accessToken).toBeNull()
  })
  it("retries concurrent 401 responses only once with a shared refresh", async () => {
    applyAuthenticatedSession({ user, accessToken: "old" })
    const post = vi.spyOn(sessionClient, "post").mockResolvedValue(response({ accessToken: "fresh", user }))
    const adapter = vi.fn(async config => {
      if (config.headers.get("Authorization") !== "Bearer fresh") throw httpError(401, {}, config)
      return response({ ok: true }, config)
    })
    await Promise.all([api.get("/companies", { adapter }), api.get("/auth/sessions", { adapter })])
    expect(post).toHaveBeenCalledTimes(1)
    expect(adapter).toHaveBeenCalledTimes(4)
  })
  it("does not refresh failed login and does not loop on repeated 401", async () => {
    applyAuthenticatedSession({ user, accessToken: "old" })
    const post = vi.spyOn(sessionClient, "post").mockResolvedValue(response({ accessToken: "fresh", user }))
    const adapter = vi.fn(async config => { throw httpError(401, {}, config) })
    await expect(api.post("/auth/login", {}, { adapter })).rejects.toBeDefined()
    expect(post).not.toHaveBeenCalled()
    await expect(api.get("/companies", { adapter })).rejects.toBeDefined()
    expect(post).toHaveBeenCalledTimes(1)
    expect(useAuthStore.getState().status).toBe("anonymous")
  })
})
