import type { OpportunityStage } from "@/features/opportunities/types/opportunity.types"

const stageCodePattern = /\b[A-Z][A-Z0-9_]*\b/g

export function localizeStageChangeText(value: string | null | undefined, stages: OpportunityStage[] = []) {
  if (!value) return value
  const labels = new Map(stages.map((stage) => [stage.code, stage.label]))
  return value.replace(stageCodePattern, (code) => labels.get(code) ?? code).replace(/\s*-+>\s*/g, " ← ")
}
