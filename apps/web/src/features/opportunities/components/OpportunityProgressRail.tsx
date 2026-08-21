import { Check, Flag, MapPin } from "lucide-react"

import { uiText } from "@/config/uiText"
import type { Opportunity, OpportunityStage } from "../types/opportunity.types"

export function OpportunityProgressRail({
  opportunity,
  stages,
}: {
  opportunity: Opportunity
  stages: OpportunityStage[]
}) {
  const text = uiText.opportunities.detail.progress
  const visited = new Set(
    (Array.isArray(opportunity.stageHistories)
      ? opportunity.stageHistories
      : []
    ).map((history) => history.toStageId)
  )
  return (
    <section className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-4 shadow-[var(--app-shadow-card)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-[var(--app-heading)]">
          {text.title}
        </h2>
        <span className="text-[10px] text-[var(--app-text-secondary)]">
          {opportunity.stage?.label}
        </span>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max items-start" dir="rtl">
          {stages.map((stage, index) => {
            const current = stage.id === opportunity.stageId
            const wasVisited = visited.has(stage.id) && !current
            const color = stage.color || "var(--app-primary)"
            return (
              <div
                key={stage.id}
                className="relative w-40 shrink-0 px-2 text-center"
              >
                <div className="absolute start-0 end-0 top-4 h-px bg-[var(--app-divider)]" />
                <div
                  className={[
                    "relative mx-auto grid size-8 place-items-center rounded-full border-2 bg-[var(--app-surface)] transition",
                    current ? "scale-110 shadow-md" : "",
                  ].join(" ")}
                  style={{
                    borderColor:
                      current || wasVisited ? color : "var(--app-divider)",
                    color:
                      current || wasVisited ? color : "var(--app-icon-muted)",
                  }}
                >
                  {current ? (
                    <MapPin className="size-4" />
                  ) : wasVisited ? (
                    <Check className="size-4" />
                  ) : stage.isTerminal ? (
                    <Flag className="size-3.5" />
                  ) : (
                    <span className="size-1.5 rounded-full bg-current" />
                  )}
                </div>
                <p
                  className={
                    current
                      ? "mt-2 text-[11px] font-bold text-[var(--app-heading)]"
                      : "mt-2 text-[10px] text-[var(--app-text-secondary)]"
                  }
                >
                  {stage.label}
                </p>
                <p className="mt-1 text-[8px] text-[var(--app-text-secondary)]">
                  {current
                    ? text.current
                    : wasVisited
                      ? text.visited
                      : stage.isTerminal
                        ? text.terminal
                        : (index + 1).toLocaleString("fa-IR")}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
