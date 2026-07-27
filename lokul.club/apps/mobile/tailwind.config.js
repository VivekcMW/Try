// Tailwind config for NativeWind v4 — sources colors/spacing/typography
// from the shared @lokul/ui-tokens package so web + mobile stay in sync.
const { colors, spacing, typography, radius } = require('@lokul/ui-tokens');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: colors.brand,
        accent: colors.accent,
        gray: colors.gray,
        success: colors.semantic.success,
        'success-bg': colors.semantic.successBg,
        warning: colors.semantic.warning,
        'warning-bg': colors.semantic.warningBg,
        danger: colors.semantic.danger,
        'danger-bg': colors.semantic.dangerBg,
        info: colors.semantic.info,
        'info-bg': colors.semantic.infoBg,
        background: colors.surface.background,
        foreground: colors.surface.foreground,
        heading: colors.surface.heading,
        'text-secondary': colors.surface.textSecondary,
        'text-disabled': colors.surface.textDisabled,
        'surface-muted': colors.surface.surfaceMuted,
        border: colors.surface.border,
        'border-strong': colors.surface.borderStrong,
      },
      spacing: Object.fromEntries(
        Object.entries(spacing).map(([k, v]) => [k, `${v}px`])
      ),
      fontFamily: {
        sans: [typography.fontFamily.sans],
        mono: [typography.fontFamily.mono],
      },
      fontSize: Object.fromEntries(
        Object.entries(typography.fontSize).map(([k, v]) => [k, `${v}px`])
      ),
      fontWeight: typography.fontWeight,
      borderRadius: Object.fromEntries(
        Object.entries(radius).map(([k, v]) => [k, v === 9999 ? '9999px' : `${v}px`])
      ),
    },
  },
  plugins: [],
};
