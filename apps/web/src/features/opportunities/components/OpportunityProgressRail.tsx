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
    <section className="w-full max-w-full min-w-0 rounded-2xl border border-[var(--app-divider)] bg-[var(--app-surface)] px-4 py-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xs font-bold text-[var(--app-heading)]">
          {text.title}
        </h2>
        <span className="text-[10px] text-[var(--app-text-secondary)]">
          {opportunity.stage?.label}
        </span>
      </div>
      <div className="w-full max-w-full min-w-0 overflow-x-auto pb-1">
        <div className="flex w-max min-w-full items-start" dir="rtl">
          {stages.map((stage, index) => {
            const current = stage.id === opportunity.stageId
            const wasVisited = visited.has(stage.id) && !current
            const color = stage.color || "var(--app-primary)"
            return (
              <div
                key={stage.id}
                className="relative w-28 shrink-0 px-1.5 text-center sm:w-32"
              >
                <div className="absolute start-0 end-0 top-3.5 h-px bg-[var(--app-divider)]" />
                <div
                  className={[
                    "relative mx-auto grid size-7 place-items-center rounded-full border-2 bg-[var(--app-surface)] transition",
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
                    <MapPin className="size-3.5" />
                  ) : wasVisited ? (
                    <Check className="size-3.5" />
                  ) : stage.isTerminal ? (
                    <Flag className="size-3" />
                  ) : (
                    <span className="size-1.5 rounded-full bg-current" />
                  )}
                </div>
                <p
                  className={
                    current
                      ? "mt-1.5 truncate text-[10px] font-bold text-[var(--app-heading)]"
                      : "mt-1.5 truncate text-[9px] text-[var(--app-text-secondary)]"
                  }
                >
                  {stage.label}
                </p>
                <p className="mt-0.5 text-[8px] text-[var(--app-text-secondary)]">
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
