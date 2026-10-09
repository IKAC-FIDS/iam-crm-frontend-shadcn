export const appSpacing = {
  page: {
    mobile: 16,
    tablet: 24,
    desktop: 32,
    wide: 40,
  },
  sectionGap: 20,
  cardPadding: 20,
} as const

export type AppSpacing = typeof appSpacing
