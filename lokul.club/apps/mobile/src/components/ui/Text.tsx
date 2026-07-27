import { Text as RNText, type TextProps as RNTextProps, StyleSheet } from 'react-native';
import { textPresets, colors } from '@lokul/ui-tokens';
import { useAccessibilityStore } from '@/store/accessibilityStore';
import { FONT_SCALE_FACTOR, HC_COLORS } from '@/hooks/useAccessibility';

type Variant = keyof typeof textPresets; // h1 | h2 | h3 | bodyLg | body | label | caption | button
type Tone = 'default' | 'secondary' | 'disabled' | 'inverse' | 'brand' | 'danger' | 'success' | 'warning';

export interface TextProps extends RNTextProps {
  variant?: Variant;
  tone?: Tone;
}

const toneColor: Record<Tone, string> = {
  default: colors.surface.foreground,
  secondary: colors.surface.textSecondary,
  disabled: colors.surface.textDisabled,
  inverse: '#ffffff',
  brand: colors.brand[600],
  danger: colors.semantic.danger,
  success: colors.semantic.success,
  warning: colors.semantic.warning,
};

const hcToneColor: Record<Tone, string> = {
  default: HC_COLORS.surface.foreground,
  secondary: HC_COLORS.surface.textSecondary,
  disabled: HC_COLORS.surface.textDisabled,
  inverse: '#ffffff',
  brand: HC_COLORS.brand[600],
  danger: HC_COLORS.semantic.danger,
  success: HC_COLORS.semantic.success,
  warning: HC_COLORS.semantic.warning,
};

export function Text({ variant = 'body', tone = 'default', style, ...rest }: TextProps) {
  const fontScale    = useAccessibilityStore((s) => s.fontScale);
  const boldText     = useAccessibilityStore((s) => s.boldText);
  const seniorMode   = useAccessibilityStore((s) => s.seniorMode);
  const highContrast = useAccessibilityStore((s) => s.highContrast);

  const effectiveScale = seniorMode && fontScale === 'normal' ? 'large' : fontScale;
  const factor = FONT_SCALE_FACTOR[effectiveScale];
  const base   = textPresets[variant];
  const tones  = highContrast ? hcToneColor : toneColor;

  const scaledStyle = factor !== 1.0 && (base as { fontSize?: number }).fontSize
    ? { fontSize: Math.round(((base as { fontSize: number }).fontSize) * factor) }
    : undefined;

  const boldStyle = boldText ? { fontWeight: '700' as const } : undefined;

  return (
    <RNText
      {...rest}
      style={StyleSheet.flatten([base, { color: tones[tone] }, scaledStyle, boldStyle, style])}
    />
  );
}

export default Text;
