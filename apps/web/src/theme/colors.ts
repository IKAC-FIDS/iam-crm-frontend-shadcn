/** Typed reference only. Runtime theme values are owned by the CSS token files. */
export const appColors = {
  light: {
    interactive: { primary: "#2563EB", hover: "#1D4ED8", active: "#1E40AF", soft: "#EFF6FF" },
    neutral: { heading: "#1C1917", textSecondary: "#57534E", background: "#FAFAF9", surface: "#FFFFFF", surfaceSoft: "#F5F5F4", divider: "#E7E5E4", outline: "#D6D3D1" },
    semantic: { success: "#15803D", warning: "#B45309", error: "#DC2626", info: "#2563EB" },
  },
dark: {
  interactive: {
    primary: "#60A5FA",
    hover: "#93C5FD",
    active: "#3B82F6",
    soft: "#243B5A",
  },
  neutral: {
    heading: "#F8FAFC",
    textSecondary: "#CBD5E1",
    background: "#17243A",
    surface: "#21314A",
    surfaceSoft: "#2C405C",
    divider: "#405675",
    outline: "#64748B",
  },
  semantic: {
    success: "#4ADE80",
    warning: "#FBBF24",
    error: "#F87171",
    info: "#60A5FA",
  },
},
} as const

export type AppColors = typeof appColors
