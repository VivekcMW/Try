import { useMemo, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { colors, radius, spacing, textPresets } from '@lokul/ui-tokens';
import { Text } from './Text';
import { useAccessibilityStore } from '@/store/accessibilityStore';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

const heightFor: Record<Size, number> = { sm: 36, md: 44, lg: 52 };
const paddingXFor: Record<Size, number> = { sm: spacing[3], md: spacing[4], lg: spacing[5] };

function variantStyles(variant: Variant, pressed: boolean, disabled: boolean) {
  const base: { container: ViewStyle; text: TextStyle } = {
    container: { backgroundColor: 'transparent', borderWidth: 0, borderColor: 'transparent' },
    text: { color: colors.surface.foreground },
  };
  switch (variant) {
    case 'primary':
      base.container.backgroundColor = pressed ? colors.brand[700] : colors.brand[600];
      base.text.color = '#ffffff';
      break;
    case 'secondary':
      base.container.backgroundColor = pressed ? colors.gray[100] : colors.surface.background;
      base.container.borderWidth = 1;
      base.container.borderColor = colors.surface.border;
      base.text.color = colors.surface.foreground;
      break;
    case 'ghost':
      base.container.backgroundColor = pressed ? colors.gray[100] : 'transparent';
      base.text.color = colors.brand[600];
      break;
    case 'destructive':
      base.container.backgroundColor = pressed ? '#7f1d1d' : colors.semantic.danger;
      base.text.color = '#ffffff';
      break;
  }
  if (disabled) {
    base.container.opacity = 0.5;
  }
  return base;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled  = !!disabled || loading;
  const seniorMode  = useAccessibilityStore((s) => s.seniorMode);
  // In senior mode, bump minimum height to 56 px regardless of size
  const minHeight   = seniorMode ? Math.max(heightFor[size], 56) : heightFor[size];

  const containerBase: ViewStyle = useMemo(
    () => ({
      height: minHeight,
      paddingHorizontal: paddingXFor[size],
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: spacing[2],
      alignSelf: fullWidth ? 'stretch' : 'flex-start',
    }),
    [size, fullWidth, minHeight]
  );

  return (
    <Pressable {...rest} disabled={isDisabled} accessibilityRole="button" style={style}>
      {({ pressed }) => {
        const v = variantStyles(variant, pressed, isDisabled);
        return (
          <View style={StyleSheet.flatten([containerBase, v.container])}>
            {loading ? (
              <ActivityIndicator size="small" color={v.text.color as string} />
            ) : (
              <>
                {leftIcon}
                <Text style={StyleSheet.flatten([textPresets.button, v.text])}>{label}</Text>
                {rightIcon}
              </>
            )}
          </View>
        );
      }}
    </Pressable>
  );
}

export default Button;
