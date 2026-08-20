import {
  CalendarClock,
  Building2,
  ListTodo,
  UsersRound,
} from "lucide-react"

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
        label="فرصت‌های باز"
        value={summary.openOpportunityCount.toLocaleString("fa-IR")}
      />

      <CompanyMetricCard
        icon={ListTodo}
        label="کارهای فعال"
        value={summary.activeTaskCount.toLocaleString("fa-IR")}
      />

      <CompanyMetricCard
        icon={CalendarClock}
        label="جلسات پیش‌رو"
        value={summary.upcomingMeetingCount.toLocaleString("fa-IR")}
      />

      <CompanyMetricCard
        icon={UsersRound}
        label="اشخاص شرکت"
        value={summary.peopleCount.toLocaleString("fa-IR")}
      />
    </div>
  )
}
