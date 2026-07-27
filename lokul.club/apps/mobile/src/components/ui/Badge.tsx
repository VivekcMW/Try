import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { Text } from './Text';

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';
type Size = 'sm' | 'md';
type Variant = 'soft' | 'solid';

export interface BadgeProps {
  label: string;
  tone?: Tone;
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const toneStyles: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: colors.gray[100], fg: colors.gray[700] },
  brand: { bg: colors.brand[50], fg: colors.brand[700] },
  success: { bg: colors.semantic.successBg, fg: colors.semantic.success },
  warning: { bg: colors.semantic.warningBg, fg: colors.semantic.warning },
  danger: { bg: colors.semantic.dangerBg, fg: colors.semantic.danger },
  info: { bg: colors.semantic.infoBg, fg: colors.semantic.info },
};

const solidToneBg: Record<Tone, string> = {
  neutral: colors.gray[600],
  brand: colors.brand[600],
  success: colors.semantic.success,
  warning: colors.semantic.warning,
  danger: colors.semantic.danger,
  info: colors.semantic.info,
};

export function Badge({ label, tone = 'neutral', variant = 'soft', size = 'sm', leftIcon, style, onPress }: BadgeProps) {
  const { bg, fg } = variant === 'solid' ? { bg: solidToneBg[tone], fg: '#ffffff' } : toneStyles[tone];
  const pad =
    size === 'sm'
      ? { paddingHorizontal: spacing[2], paddingVertical: 2 }
      : { paddingHorizontal: spacing[2.5], paddingVertical: spacing[1] };

  const content = (
    <View
      style={[
        styles.container,
        pad,
        { backgroundColor: bg },
        style,
      ]}
    >
      {leftIcon}
      <Text
        variant="caption"
        style={{
          color: fg,
          fontWeight: '600',
          fontSize: size === 'sm' ? 11 : 12,
        }}
      >
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }
  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
});

export default Badge;
