import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CollaborationNavigation } from "./CollaborationNavigation"

const topics = [
  {
    id: "topic-1",
    name: "مناقصه نمونه",
    description: null,
    category: "TENDER" as const,
    unreadCount: 2,
    channels: [
      {
        id: "channel-1",
        topicId: "topic-1",
        name: "عمومی",
        description: null,
        visibility: "PUBLIC" as const,
        unreadCount: 1,
        memberCount: 2,
      },
    ],
  },
]

describe("CollaborationNavigation", () => {
  it("renders tender/internal tabs and collapsible topic channels", () => {
    render(
      <CollaborationNavigation
        topics={topics}
        category="TENDER"
        selectedChannelId="channel-1"
        canCreateChannel
        canUpdateTopic
        canDeleteTopic
        canUpdateChannel
        canDeleteChannel
        onCategoryChange={vi.fn()}
        onSelectChannel={vi.fn()}
        onEditTopic={vi.fn()}
        onArchiveTopic={vi.fn()}
        onCreateChannel={vi.fn()}
        onEditChannel={vi.fn()}
        onArchiveChannel={vi.fn()}
      />
    )
    expect(screen.getByRole("tab", { name: "مناقصات" })).toHaveAttribute(
      "aria-selected",
      "true"
    )
    expect(screen.getByRole("tab", { name: "داخلی" })).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /مناقصه نمونه/ })
    ).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("button", { name: /عمومی/ })).toBeInTheDocument()
  })

  it("hides create controls without the related permission", () => {
    render(
      <CollaborationNavigation
        topics={topics}
        category="TENDER"
        selectedChannelId="channel-1"
        canCreateChannel={false}
        canUpdateTopic={false}
        canDeleteTopic={false}
        canUpdateChannel={false}
        canDeleteChannel={false}
        onCategoryChange={vi.fn()}
        onSelectChannel={vi.fn()}
        onEditTopic={vi.fn()}
        onArchiveTopic={vi.fn()}
        onCreateChannel={vi.fn()}
        onEditChannel={vi.fn()}
        onArchiveChannel={vi.fn()}
      />
    )
    expect(
      screen.queryByRole("button", { name: "ایجاد موضوع" })
    ).not.toBeInTheDocument()
    expect(screen.queryByLabelText("ویرایش موضوع")).not.toBeInTheDocument()
  })
})
