import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { ReactNode } from "react"
import { beforeEach, expect, it, vi } from "vitest"
import { ArtifactPanel } from "@/features/artifacts/components/ArtifactPanel"
import { api } from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { response, user } from "./fixtures"

vi.mock("@/lib/api", () => ({ api: { get: vi.fn(), post: vi.fn(), delete: vi.fn() } }))
const artifact = { id: "a1", type: "EXTERNAL_URL", provider: "GITHUB", name: "Architecture Repository", externalUrl: "https://github.com/acme/crm", description: "مرجع فنی", createdAt: "2026-08-30T10:00:00Z", updatedAt: "2026-08-30T10:00:00Z", uploadedBy: { id: "u1", fullName: "علی" }, links: [{ id: "l1", entityType: "TASK", entityId: "00000000-0000-4000-8000-000000000001", relationType: "REFERENCE", createdAt: "2026-08-30T10:00:00Z" }], _count: { links: 1 } }
function wrapper({ children }: { children: ReactNode }) { return <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}>{children}</QueryClientProvider> }
beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.setState({ user: { ...user, permissions: ["artifact:view", "artifact:create", "artifact:delete", "artifact:link"] }, status: "authenticated" })
  vi.mocked(api.get).mockResolvedValue(response({ success: true, data: { data: [artifact], meta: { total: 1, page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrevious: false } } }))
  vi.mocked(api.post).mockResolvedValue(response({ data: artifact }))
  vi.mocked(api.delete).mockResolvedValue(response({ deleted: true }))
})

it("renders provider metadata and permission-gated artifact actions", async () => {
  render(<ArtifactPanel entityType="TASK" entityId="00000000-0000-4000-8000-000000000001" />, { wrapper })
  expect(await screen.findByText("Architecture Repository")).toBeInTheDocument()
  expect(screen.getByText("GitHub")).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "حذف ارتباط" })).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "حذف آرتیفکت" })).toBeInTheDocument()
})

it("registers an external reference without requesting its remote content", async () => {
  render(<ArtifactPanel entityType="TASK" entityId="00000000-0000-4000-8000-000000000001" />, { wrapper })
  await screen.findByText("Architecture Repository")
  await userEvent.click(screen.getByRole("button", { name: /افزودن لینک/ }))
  await userEvent.type(screen.getByLabelText("نام"), "Repo")
  await userEvent.type(screen.getByLabelText("URL"), "https://github.com/acme/repo")
  await userEvent.click(screen.getByRole("button", { name: "ثبت" }))
  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/artifacts/external", expect.objectContaining({ provider: "GITHUB", name: "Repo" })))
  expect(api.get).not.toHaveBeenCalledWith("https://github.com/acme/repo")
})

it("uploads through multipart form data", async () => {
  render(<ArtifactPanel entityType="TASK" entityId="00000000-0000-4000-8000-000000000001" />, { wrapper })
  await screen.findByText("Architecture Repository")
  await userEvent.click(screen.getByRole("button", { name: /بارگذاری فایل/ }))
  await userEvent.upload(screen.getByLabelText(/فایل را رها یا انتخاب کنید/), new File(["hello"], "evidence.txt", { type: "text/plain" }))
  await userEvent.click(screen.getByRole("button", { name: "ثبت" }))
  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/artifacts/upload", expect.any(FormData), expect.objectContaining({ onUploadProgress: expect.any(Function) })))
})

it("unlinks without deleting the artifact", async () => {
  render(<ArtifactPanel entityType="TASK" entityId="00000000-0000-4000-8000-000000000001" />, { wrapper })
  await userEvent.click(await screen.findByRole("button", { name: "حذف ارتباط" }))
  await waitFor(() => expect(api.delete).toHaveBeenCalledWith("/artifacts/a1/links/l1"))
  expect(api.delete).not.toHaveBeenCalledWith("/artifacts/a1")
})
