import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { ReactNode } from "react"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, expect, it, vi } from "vitest"

import { useAuthStore } from "@/store/authStore"
import { user } from "@/test/fixtures"

const { useCollaborationTopics } = vi.hoisted(() => ({
  useCollaborationTopics: vi.fn(),
}))

vi.mock("../hooks/useCollaboration", () => ({
  usePresenceHeartbeat: vi.fn(),
  useCollaborationTopics,
  useCollaborationChannel: vi.fn(() => ({ data: {} })),
  useCollaborationMembers: vi.fn(() => ({
    data: { data: [] },
    isLoading: false,
  })),
  useCollaborationMutations: vi.fn(() => ({
    createTopic: { mutateAsync: vi.fn(), isPending: false },
    updateTopic: { mutateAsync: vi.fn(), isPending: false },
    archiveTopic: { mutateAsync: vi.fn() },
    createChannel: { mutateAsync: vi.fn(), isPending: false },
    updateChannel: { mutateAsync: vi.fn(), isPending: false },
    archiveChannel: { mutateAsync: vi.fn() },
    addMember: { mutate: vi.fn() },
    removeMember: { mutate: vi.fn() },
  })),
}))
vi.mock("../components/CollaborationNavigation", () => ({
  CollaborationNavigation: () => <nav>کانال‌ها</nav>,
}))
vi.mock("../components/CollaborationEntityDialog", () => ({
  CollaborationEntityDialog: () => null,
}))
vi.mock("@/features/conversations/components/EntityConversationPanel", () => ({
  EntityConversationPanel: ({ entityId }: { entityId: string }) => (
    <div data-testid="conversation">{entityId}</div>
  ),
}))
vi.mock("@/features/artifacts/components/ArtifactPanel", () => ({
  ArtifactPanel: ({ entityType, entityId }: { entityType: string; entityId: string }) => (
    <div data-testid="artifacts">{`${entityType}:${entityId}`}</div>
  ),
}))

import { CollaborationPage } from "./CollaborationPage"

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={["/collaboration"]}>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  useAuthStore.setState({
    user: { ...user, permissions: ["collaboration:view", "artifact:view"] },
    status: "authenticated",
  })
  useCollaborationTopics.mockReturnValue({
    data: {
      data: [
        {
          id: "topic-1",
          name: "موضوع نمونه",
          category: "TENDER",
          channels: [
            {
              id: "channel-1",
              topicId: "topic-1",
              name: "کانال نمونه",
              visibility: "PUBLIC",
            },
          ],
        },
      ],
    },
    isLoading: false,
    isError: false,
  })
})

it("switches the active channel between conversation and channel-scoped artifacts", async () => {
  render(<CollaborationPage />, { wrapper })

  expect(screen.getByTestId("conversation")).toHaveTextContent("channel-1")
  await userEvent.click(screen.getByRole("tab", { name: "فایل‌ها و لینک‌ها" }))
  expect(screen.getByTestId("artifacts")).toHaveTextContent(
    "COLLABORATION_CHANNEL:channel-1"
  )
  expect(screen.queryByTestId("conversation")).not.toBeInTheDocument()

  await userEvent.click(screen.getByRole("tab", { name: "گفتگو" }))
  expect(screen.getByTestId("conversation")).toBeInTheDocument()
})
