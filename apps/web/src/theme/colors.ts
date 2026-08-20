export const appColors = {
  brand: {
    primary: "#0053B2",
    hover: "#004A9F",
    active: "#003F88",
    alt: "#55677F",
    soft: "#D6E3FF",
    onPrimary: "#FFFFFF",
    onPrimaryContainer: "#001B3D",
  },
  semantic: {
    success: "#048A3B",
    successLight: "#E6F9EE",
    warning: "#F59E0B",
    warningLight: "#FFF4E0",
    error: "#BA1A1A",
    errorLight: "#FFDAD6",
    info: "#1371D3",
    infoLight: "#D0E5FB",
  },
  neutral: {
    heading: "#0F172A",
    textSecondary: "#64748B",
    background: "#EFF5FA",
    surface: "#FCFCFF",
    surfaceSoft: "#F7FAFD",
    divider: "#E4EAF3",
    outline: "#C2CAD6",
  },
  accent: "#E91E63",
  black: "#000000",
  white: "#FFFFFF",
  chart: ["#0053B2", "#55677F", "#1371D3", "#64748B"] as const,
} as const

export type AppColors = typeof appColors
