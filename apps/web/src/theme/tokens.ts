import { appColors } from "./colors"
import { appRadius } from "./radius"
import { appShadows } from "./shadows"
import { appSpacing } from "./spacing"

export const appTokens = {
  fonts: {
    family: '"BYekan", Tahoma, Arial, sans-serif',
  },

  colors: appColors,

  layout: {
    drawerWidth: 260,
    contentMaxWidth: 1680,
  },

  spacing: appSpacing,

  sizing: {
    inputHeight: 40,
    buttonHeight: 40,
    iconButtonSize: 40,
    tableRowHeight: 48,
  },

  radius: appRadius,
  shadow: appShadows,
} as const

export type AppTokens = typeof appTokens
