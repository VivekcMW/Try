/**
 * Spacing — 4-point grid.
 * Values are raw numbers (dp/px); multiply by 4 for actual pixel size.
 *
 * Usage in RN:  style={{ padding: spacing[4] }}   → 16dp
 * Usage in web: --spacing-4 → 1rem (via Tailwind mapping)
 */
export const spacing = {
  0:  0,
  0.5: 2,
  1:  4,
  1.5: 6,
  2:  8,
  2.5: 10,
  3:  12,
  3.5: 14,
  4:  16,
  5:  20,
  6:  24,
  7:  28,
  8:  32,
  9:  36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
  // Named aliases for convenience
  xs: 4,   // same as spacing[1]
  sm: 8,   // same as spacing[2]
  md: 12,  // same as spacing[3]
  lg: 16,  // same as spacing[4]
  xl: 24,  // same as spacing[6]
} as const;

export type SpacingKey = keyof typeof spacing;
export type Spacing = typeof spacing;
