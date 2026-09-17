import { render, screen } from "@testing-library/react"
import { Activity } from "lucide-react"
import { describe, expect, it } from "vitest"

import { ContentList, ContentListItem, ContentSection } from "./ContentSection"

describe("ContentSection", () => {
  it("renders a reusable titled surface with description, action and list content", () => {
    render(
      <ContentSection
        title="فعالیت‌ها"
        description="آخرین موارد"
        icon={Activity}
        action={<button type="button">همه</button>}
      >
        <ContentList>
          <ContentListItem>تماس تلفنی</ContentListItem>
        </ContentList>
      </ContentSection>
    )

    expect(
      screen.getByRole("heading", { name: "فعالیت‌ها" })
    ).toBeInTheDocument()
    expect(screen.getByText("آخرین موارد")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "همه" })).toBeInTheDocument()
    expect(screen.getByText("تماس تلفنی")).toBeInTheDocument()
  })
})
