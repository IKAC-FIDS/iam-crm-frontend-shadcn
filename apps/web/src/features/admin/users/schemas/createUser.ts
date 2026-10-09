import { z } from "zod"
import { uiText } from "@/config/uiText"

export const createUserSchema = z.object({
  fullName: z.string().trim().min(1, uiText.common.forms.required),
  email: z.string().trim().email(uiText.common.forms.invalidEmail),
  password: z.string().min(6, uiText.common.forms.shortPassword),
  roleChoice: z.string().min(1, uiText.common.forms.required),
  teamId: z.string(),
})
export type CreateUserValues = z.infer<typeof createUserSchema>
