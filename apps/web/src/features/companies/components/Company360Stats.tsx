import { Building2, CalendarClock, CircleDollarSign, ListTodo } from "lucide-react"
import { CompanyMetricCard } from "./CompanyMetricCard"

type Props = {
  pipelineValue: number
  opportunities: number
  tasks: number
  meetings: number
}

export function Company360Stats(props: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <CompanyMetricCard
        icon={CircleDollarSign}
        label="ارزش فرصت‌های فعال"
        value={props.pipelineValue.toLocaleString("fa-IR")}
      />

      <CompanyMetricCard
        icon={Building2}
        label="فرصت‌های باز"
        value={props.opportunities.toLocaleString("fa-IR")}
      />

      <CompanyMetricCard
        icon={ListTodo}
        label="کارهای باز"
        value={props.tasks.toLocaleString("fa-IR")}
      />

      <CompanyMetricCard
        icon={CalendarClock}
        label="جلسات پیش‌رو"
        value={props.meetings.toLocaleString("fa-IR")}
      />
    </div>
  )
}
