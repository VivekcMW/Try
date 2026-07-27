/**
 * Border radius — matches Lokul web (globals.css --radius-* vars).
 * Values are in dp (same as px on 1x screens).
 */
export const radius = {
  none: 0,
  xs:   6,   // --radius-xs  0.375rem
  sm:   8,   // --radius-sm  0.5rem
  md:   12,  // --radius-md  0.75rem
  lg:   16,  // --radius-lg  1rem
  xl:   20,  // --radius-xl  1.25rem
  "2xl": 24,
  full: 9999,
} as const;

export type RadiusKey = keyof typeof radius;

/**
 * Shadow tokens — dual-format for React Native.
 *
 * React Native shadows are split:
 *   • iOS   : shadowColor / shadowOffset / shadowOpacity / shadowRadius
 *   • Android: elevation
 *
 * Usage:  style={{ ...shadows.sm.ios }}   on iOS
 *         style={{ elevation: shadows.sm.android }} on Android
 */
export const shadows = {
  xs: {
    ios: {
      shadowColor:   "#0f172a",
      shadowOffset:  { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius:  2,
    },
    android: 1,
  },
  sm: {
    ios: {
      shadowColor:   "#0f172a",
      shadowOffset:  { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius:  8,
    },
    android: 2,
  },
  md: {
    ios: {
      shadowColor:   "#0f172a",
      shadowOffset:  { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius:  24,
    },
    android: 4,
  },
  lg: {
    ios: {
      shadowColor:   "#0f172a",
      shadowOffset:  { width: 0, height: 16 },
      shadowOpacity: 0.12,
      shadowRadius:  40,
    },
    android: 8,
  },
} as const;

export type ShadowKey = keyof typeof shadows;
