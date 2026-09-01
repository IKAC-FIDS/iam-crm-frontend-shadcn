import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"

import { uiText } from "@/config/uiText"
import { useAuthStore } from "@/store/authStore"
import { user } from "@/test/fixtures"
import type { Opportunity } from "../types/opportunity.types"
import { OpportunityExecutiveSummary } from "./OpportunityOverview"

const opportunity = {
  id: "opportunity-1",
  estimatedValue: "1500000",
  probability: 50,
  activities: [],
} as Opportunity

describe("opportunity financial visibility", () => {
  beforeEach(() => {
    useAuthStore.setState({ status: "authenticated", user: null })
  })

  it("hides the commercial summary without financial:view", () => {
    useAuthStore.setState({
      status: "authenticated",
      user: { ...user, permissions: ["opportunity:view"] },
    })
    render(<OpportunityExecutiveSummary opportunity={opportunity} />)
    expect(
      screen.queryByText(uiText.opportunities.detail.summary.commercial)
    ).toBeNull()
  })

  it("shows the commercial summary with financial:view", () => {
    useAuthStore.setState({
      status: "authenticated",
      user: { ...user, permissions: ["opportunity:view", "financial:view"] },
    })
    render(<OpportunityExecutiveSummary opportunity={opportunity} />)
    expect(
      screen.getByText(uiText.opportunities.detail.summary.commercial)
    ).toBeInTheDocument()
  })
})
