import { z } from "zod"

import { uiText } from "@/config/uiText"

import {
  COMPANY_ACTIVITY_STATUSES,
  COMPANY_OWNERSHIPS,
  COMPANY_PRIORITIES,
} from "./company.types"

const validation = uiText.companies.form.validation

const optionalText = z.string().trim().optional()
const optionalPhone = z
  .string()
  .trim()
  .refine(
    (value) => !value || /^\+?\d{5,20}$/.test(value.replace(/\s|-/g, "")),
    validation.invalidPhone,
  )
  .optional()

export const companyFormSchema = z.object({
  legalName: z.string().trim().min(2, validation.legalNameRequired),
  brandName: optionalText,
  industry: optionalText,
  ownership: z.enum(COMPANY_OWNERSHIPS).optional(),
  priority: z.enum(COMPANY_PRIORITIES).optional(),
  website: optionalText,
  headOfficeCity: optionalText,
  centralPhone: optionalPhone,
  sourceId: optionalText,
  registrationNumber: z.string().trim().max(50).optional(),
  nationalId: z.string().trim().max(50).optional(),
  economicCode: z.string().trim().max(50).optional(),
  establishmentDate: optionalText,
  activityStatus: z.enum(COMPANY_ACTIVITY_STATUSES).optional(),
  registeredCapital: z
    .string()
    .trim()
    .refine(
      (value) => !value || /^\d+(\.\d{1,2})?$/.test(value),
      validation.invalidCapital,
    )
    .optional(),
  employeeCount: z
    .string()
    .trim()
    .refine(
      (value) => !value || /^\d+$/.test(value),
      validation.invalidEmployeeCount,
    )
    .optional(),
})

export type CompanyFormValues = z.infer<typeof companyFormSchema>
