export const appTypography = {
  pageTitle:
    "font-app text-2xl font-bold tracking-tight text-[var(--app-heading)] sm:text-3xl",

  sectionTitle:
    "font-app text-base font-bold text-[var(--app-heading)] sm:text-lg",

  cardTitle:
    "font-app text-sm font-semibold text-[var(--app-heading)] sm:text-base",

  body: "font-app text-sm leading-7 text-[var(--app-text-secondary)]",

  bodyStrong: "font-app text-sm font-semibold text-[var(--app-heading)]",

  caption: "font-app text-xs leading-5 text-[var(--app-text-secondary)]",

  label: "font-app text-sm font-medium text-[var(--app-heading)]",

  navigationGroup: "font-app text-sm font-bold text-[var(--app-primary-alt)]",

  navigationItem: "font-app text-[13px] font-medium",
} as const

export type AppTypography = typeof appTypography
