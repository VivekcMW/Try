/**
 * Lokul colour palette — single source of truth for web + mobile.
 *
 * Brand  : Deep Indigo  (trust, technology, community)
 * Accent : Saffron/Amber (cultural warmth; echoes Indian tricolour)
 * Neutral: Warm Slate   (human, organic)
 * Semantic: Emerald / Rose / Amber / Sky
 */

export const brand = {
  50:  "#eef2ff",
  100: "#e0e7ff",
  200: "#c7d2fe",
  300: "#a5b4fc",
  400: "#818cf8",
  500: "#6366f1",
  600: "#4f46e5", // primary CTA, links
  700: "#4338ca", // hover state
  800: "#3730a3",
  900: "#312e81",
} as const;

export const accent = {
  50:  "#fffbeb",
  100: "#fef3c7",
  200: "#fde68a",
  300: "#fcd34d",
  400: "#fbbf24",
  500: "#f59e0b", // highlight badges, tags
  600: "#d97706", // accent text, icons
  700: "#b45309",
} as const;

/** Warm Slate — replaces pure gray for a friendlier feel */
export const gray = {
  50:  "#f8fafc",
  100: "#f1f5f9",
  200: "#e2e8f0",
  300: "#cbd5e1",
  400: "#94a3b8",
  500: "#64748b",
  600: "#475569",
  700: "#334155",
  800: "#1e293b",
  900: "#0f172a",
} as const;

export const semantic = {
  success:   "#065f46", // Emerald-800
  successBg: "#d1fae5", // Emerald-100
  warning:   "#92400e", // Amber-800
  warningBg: "#fef3c7", // Amber-100
  danger:    "#9f1239", // Rose-800
  dangerBg:  "#ffe4e6", // Rose-100
  info:      "#075985", // Sky-800
  infoBg:    "#e0f2fe", // Sky-100
} as const;

export const surface = {
  background:    "#ffffff",
  foreground:    "#1e293b", // warm-slate-800
  heading:       "#0f172a", // warm-slate-900
  textSecondary: "#475569", // warm-slate-600
  textDisabled:  "#94a3b8", // warm-slate-400
  surface:       "#ffffff",
  surfaceMuted:  "#f8fafc", // warm-slate-50
  border:        "#e2e8f0", // warm-slate-200
  borderStrong:  "#cbd5e1", // warm-slate-300
} as const;

export const colors = {
  brand,
  accent,
  gray,
  semantic,
  surface,
  // Flat aliases for convenience (mirrors surface tokens)
  background: surface.background,
  foreground: surface.foreground,
  heading: surface.heading,
  textSecondary: surface.textSecondary,
  textDisabled: surface.textDisabled,
  surfaceMuted: surface.surfaceMuted,
  border: surface.border,
  borderStrong: surface.borderStrong,
  // Semantic flat aliases
  success: semantic.success,
  successBg: semantic.successBg,
  warning: semantic.warning,
  warningBg: semantic.warningBg,
  danger: semantic.danger,
  dangerBg: semantic.dangerBg,
  info: semantic.info,
  infoBg: semantic.infoBg,
} as const;

export type Colors = typeof colors;
