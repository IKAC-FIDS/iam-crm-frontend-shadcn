export const appTokens = {
  fonts: {
    family: '"BYekan", Tahoma, Arial, sans-serif',
  },

  colors: {
    primary: "#0053B2",
    primaryHover: "#004A9F",
    primaryInteractive: "#003F88",
    primaryAlt: "#55677F",
    primarySoftBg: "#D6E3FF",
    primaryContainer: "#D6E3FF",
    onPrimary: "#FFFFFF",
    onPrimaryContainer: "#001B3D",

    success: "#048A3B",
    successLight: "#E6F9EE",
    warning: "#F59E0B",
    warningLight: "#FFF4E0",
    error: "#BA1A1A",
    errorLight: "#FFDAD6",
    info: "#1371D3",
    infoLight: "#D0E5FB",

    heading: "#0F172A",
    onSurface: "#0F172A",
    textSecondary: "#64748B",
    textMuted: "#64748B",
    iconMuted: "#64748B",

    background: "#EFF5FA",
    surface: "#FCFCFF",
    contentBackground: "#FCFCFF",
    divider: "#E4EAF3",
    outline: "#C2CAD6",
    outlineStrong: "#C2CAD6",
    disabledIcon: "#C2CAD6",
    disabledSurface: "#E4EAF3",

    accent: "#E91E63",
    black: "#000000",
    white: "#FFFFFF",

    chart: [
      "#0053B2",
      "#55677F",
      "#1371D3",
      "#64748B",
    ] as const,
  },

  layout: {
    drawerWidth: 260,
    contentMaxWidth: 1680,
    mobilePagePadding: 16,
    tabletPagePadding: 24,
    desktopPagePadding: 32,
  },

  sizing: {
    inputHeight: 40,
    buttonHeight: 40,
    iconButtonSize: 40,
    tableRowHeight: 48,
  },

  radius: {
    sm: 6,
    md: 8,
    lg: 12,
  },

  shadow: {
    card: "0 1px 3px rgba(15, 23, 42, 0.08)",
    popover: "0 8px 24px rgba(15, 23, 42, 0.12)",
    loginCard: "0 10px 40px rgba(15, 23, 42, 0.14)",
  },
} as const

export type AppTokens = typeof appTokens
