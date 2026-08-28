import { z } from "zod"
import { uiText } from "@/config/uiText"

export const opportunityFormSchema = z.object({
  companyId: z.string(),
  title: z.string().trim().min(1, uiText.opportunities.form.titleRequired),
  description: z.string(),
  ownerId: z.string(),
  stageId: z.string(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "STRATEGIC"]),
  estimatedValue: z.string(),
  expectedCloseDate: z.date().optional(),
  sourceOptionId: z.string(),
  primaryContactId: z.string(),
  probability: z
    .string()
    .refine(
      (value) =>
        value === "" ||
        (Number.isFinite(Number(value)) &&
          Number(value) >= 0 &&
          Number(value) <= 100),
      uiText.opportunities.form.invalidProbability
    ),
  competitor: z.string(),
})
export type OpportunityFormValues = z.infer<typeof opportunityFormSchema>
