const activityTypeLabels: Record<string, string> = {
  CALL: "تماس تلفنی",
  EMAIL: "ایمیل",
  LINKEDIN_MESSAGE: "پیام لینکدین",
  LINKEDIN_ENGAGEMENT: "تعامل لینکدین",
  MEETING: "جلسه",
  NOTE: "یادداشت",
  STAGE_CHANGE: "تغییر مرحله فرصت",
}

export function getActivityTypeLabel(type?: string | null) {
  if (!type) return ""
  return activityTypeLabels[type] ?? type.replaceAll("_", " ")
}
