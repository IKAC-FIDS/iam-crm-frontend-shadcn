import {
  Building2,
  CalendarClock,
  ListTodo,
  UsersRound,
} from "lucide-react"

import { uiText } from "@/config/uiText"

import { CompanyMetricCard } from "./CompanyMetricCard"

type Props = {
  summary: {
    openOpportunityCount: number
    activeTaskCount: number
    upcomingMeetingCount: number
    peopleCount: number
  }
}

export function Company360SummaryCards({ summary }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <CompanyMetricCard
        icon={Building2}
        label={uiText.companies.detail.metrics.openOpportunities}
        value={summary.openOpportunityCount.toLocaleString("fa-IR")}
      />
      <CompanyMetricCard
        icon={ListTodo}
        label={uiText.navigation.tasks}
        value={summary.activeTaskCount.toLocaleString("fa-IR")}
      />
      <CompanyMetricCard
        icon={CalendarClock}
        label={uiText.navigation.meetings}
        value={summary.upcomingMeetingCount.toLocaleString("fa-IR")}
      />
      <CompanyMetricCard
        icon={UsersRound}
        label={uiText.companies.detail.metrics.people}
        value={summary.peopleCount.toLocaleString("fa-IR")}
      />
    </div>
  )
}
