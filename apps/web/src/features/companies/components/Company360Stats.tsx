import {
  Building2,
  CalendarClock,
  CircleDollarSign,
  ListTodo,
} from "lucide-react"

import { uiText } from "@/config/uiText"

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
        label={uiText.companies.detail.metrics.pipelineValue}
        value={props.pipelineValue.toLocaleString("fa-IR")}
      />
      <CompanyMetricCard
        icon={Building2}
        label={uiText.companies.detail.metrics.openOpportunities}
        value={props.opportunities.toLocaleString("fa-IR")}
      />
      <CompanyMetricCard
        icon={ListTodo}
        label={uiText.navigation.tasks}
        value={props.tasks.toLocaleString("fa-IR")}
      />
      <CompanyMetricCard
        icon={CalendarClock}
        label={uiText.navigation.meetings}
        value={props.meetings.toLocaleString("fa-IR")}
      />
    </div>
  )
}
