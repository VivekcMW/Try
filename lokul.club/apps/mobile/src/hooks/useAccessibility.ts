/**
 * useAccessibility — reads from accessibilityStore and returns computed values
 * that UI components consume for font scaling, tap-target sizing,
 * and high-contrast color overrides.
 */
import { useAccessibilityStore, type FontScaleLevel } from '@/store/accessibilityStore';

// Multipliers applied on top of the base textPresets font sizes
export const FONT_SCALE_FACTOR: Record<FontScaleLevel, number> = {
  normal: 1.0,
  large:  1.2,
  xlarge: 1.4,
};

/**
 * High-contrast color overrides — WCAG AA+ compliant.
 * Use these instead of the default @lokul/ui-tokens colors when
 * highContrast mode is active.
 */
export const HC_COLORS = {
  surface: {
    background:    '#FFFFFF',
    heading:       '#000000',
    foreground:    '#000000',
    textSecondary: '#1A1A1A',
    textDisabled:  '#555555',
    border:        '#000000',
    surfaceMuted:  '#F0F0F0',
  },
  brand: {
    50:  '#E8EEFF',
    200: '#99B3E8',
    300: '#6690D8',
    500: '#0052C8',
    600: '#0047AB',   // Higher contrast than default #1D65AF
    700: '#003285',
  },
  semantic: {
    danger:  '#CC0000',
    success: '#006600',
    warning: '#885500',
  },
  gray: {
    100: '#E8E8E8',
    200: '#CCCCCC',
    300: '#AAAAAA',
    400: '#555555',
    500: '#333333',
    600: '#1A1A1A',
    700: '#0D0D0D',
  },
} as const;

export interface AccessibilityValues {
  seniorMode:        boolean;
  fontScale:         FontScaleLevel;
  /** Multiplier to apply to any fontSize */
  scaleFactor:       number;
  /** Minimum height/width for all interactive elements */
  tapTargetMin:      number;
  highContrast:      boolean;
  boldText:          boolean;
  reduceMotion:      boolean;
  screenReaderHints: boolean;
  /** True when any text-enlargement is active */
  isLargeText:       boolean;
  /** True when xlarge scale is active */
  isXLargeText:      boolean;
  /** HC_COLORS when highContrast is on, null otherwise */
  hcColors:          typeof HC_COLORS | null;
}

export function useAccessibility(): AccessibilityValues {
  const seniorMode        = useAccessibilityStore((s) => s.seniorMode);
  const fontScale         = useAccessibilityStore((s) => s.fontScale);
  const highContrast      = useAccessibilityStore((s) => s.highContrast);
  const boldText          = useAccessibilityStore((s) => s.boldText);
  const reduceMotion      = useAccessibilityStore((s) => s.reduceMotion);
  const screenReaderHints = useAccessibilityStore((s) => s.screenReaderHints);

  // Senior mode bumps scale to at least 'large' if user hasn't already picked bigger
  const effectiveScale: FontScaleLevel =
    seniorMode && fontScale === 'normal' ? 'large' : fontScale;

  return {
    seniorMode,
    fontScale:         effectiveScale,
    scaleFactor:       FONT_SCALE_FACTOR[effectiveScale],
    tapTargetMin:      seniorMode ? 56 : 44,
    highContrast,
    boldText,
    reduceMotion,
    screenReaderHints,
    isLargeText:       effectiveScale !== 'normal',
    isXLargeText:      effectiveScale === 'xlarge',
    hcColors:          highContrast ? HC_COLORS : null,
  };
}
