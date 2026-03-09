export const DESIGN = {
  colors: {
    appBg: "#F3F5F9",
    surface: "#FFFFFF",
    surfaceSoft: "#F8FAFC",
    textPrimary: "#0F172A",
    textSecondary: "#475569",
    textMuted: "#64748B",
    border: "#E2E8F0",
    primary: "#4F46E5",
    primarySoft: "#EEF2FF",
    success: "#16A34A",
    danger: "#DC2626",
  },
  radius: {
    sm: 10,
    md: 14,
    lg: 18,
    pill: 999,
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 22,
  },
  typography: {
    title: 24,
    section: 17,
    body: 13,
    meta: 12,
  },
  shadow: {
    card: {
      shadowColor: "#0F172A",
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
  },
} as const;
