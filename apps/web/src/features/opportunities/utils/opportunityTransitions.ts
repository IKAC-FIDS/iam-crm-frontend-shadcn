import type {
  OpportunityStage,
  OpportunityTransition,
} from "../types/opportunity.types"

function selectTransitionRule(
  transitions: OpportunityTransition[],
  fromStageId: string,
  toStageId: string,
  role?: string
) {
  const candidates = transitions.filter(
    (rule) =>
      rule.toStageId === toStageId &&
      (rule.fromStageId === fromStageId || rule.fromStageId == null)
  )

  return (
    candidates.find(
      (rule) => rule.role === role && rule.fromStageId === fromStageId
    ) ??
    candidates.find((rule) => rule.role === role && rule.fromStageId == null) ??
    candidates.find(
      (rule) => rule.role == null && rule.fromStageId === fromStageId
    ) ??
    candidates.find((rule) => rule.role == null && rule.fromStageId == null)
  )
}

export function getAllowedOpportunityStages(
  fromStageId: string,
  stages: OpportunityStage[],
  transitions: OpportunityTransition[],
  role?: string
) {
  return stages.filter((stage) => {
    if (stage.id === fromStageId) return false

    const rule = selectTransitionRule(
      transitions,
      fromStageId,
      stage.id,
      role
    )
    return Boolean(rule && (rule.isAllowed ?? rule.allowed ?? false))
  })
}
