/**
 * Typography tokens — Lokul.
 *
 * Font family : Inter (mobile), Geist Sans (web)
 * Scale       : matches Tailwind text-* defaults
 */

export const fontFamily = {
  sans:  "Inter",
  mono:  "JetBrains Mono",
} as const;

export const fontSize = {
  xs:   12,
  sm:   14,
  base: 16,
  lg:   18,
  xl:   20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 48,
} as const;

export const lineHeight = {
  tight:   1.25,
  snug:    1.375,
  normal:  1.5,
  relaxed: 1.625,
  loose:   2,
} as const;

export const fontWeight = {
  light:    "300",
  regular:  "400",
  medium:   "500",
  semibold: "600",
  bold:     "700",
} as const;

export const letterSpacing = {
  tight:  -0.5,
  normal: 0,
  wide:   0.5,
  wider:  1,
} as const;

export const typography = {
  fontFamily,
  fontSize,
  lineHeight,
  fontWeight,
  letterSpacing,
} as const;

/** Pre-composed text style presets — ready to spread in RN StyleSheet */
export const textPresets = {
  h1: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize["3xl"],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize["3xl"] * lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize["2xl"] * lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  h3: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.xl * lineHeight.snug,
  },
  bodyLg: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.base,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.base * lineHeight.normal,
  },
  body: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.sm * lineHeight.normal,
  },
  label: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.sm * lineHeight.snug,
  },
  caption: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.xs * lineHeight.normal,
  },
  button: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.sm * lineHeight.tight,
    letterSpacing: letterSpacing.wide,
  },
} as const;

export type Typography = typeof typography;
export type TextPreset = keyof typeof textPresets;
