export const appShadows = {
  card: "0 1px 3px rgba(15, 23, 42, 0.08)",
  cardHover: "0 14px 35px rgba(15, 23, 42, 0.07)",
  popover: "0 8px 24px rgba(15, 23, 42, 0.12)",
  elevated: "0 18px 50px rgba(15, 23, 42, 0.08)",
  brand: "0 20px 50px rgba(0, 83, 178, 0.24)",
  hero: "0 24px 70px rgba(0, 63, 136, 0.22)",
} as const

export type AppShadows = typeof appShadows
