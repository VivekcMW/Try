import type { ReactNode } from 'react';
import { Platform, Pressable, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { colors, radius, shadows, spacing, type SpacingKey } from '@lokul/ui-tokens';

type Elevation = 'none' | 'xs' | 'sm' | 'md' | 'lg';

export interface CardProps extends Omit<ViewProps, 'children' | 'style'> {
  children: ReactNode;
  padding?: SpacingKey;
  elevation?: Elevation;
  bordered?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

function elevationStyle(level: Elevation): ViewStyle {
  if (level === 'none') return {};
  const s = shadows[level];
  if (Platform.OS === 'android') return { elevation: s.android };
  return {
    shadowColor: s.ios.shadowColor,
    shadowOffset: s.ios.shadowOffset,
    shadowOpacity: s.ios.shadowOpacity,
    shadowRadius: s.ios.shadowRadius,
  };
}

export function Card({
  children,
  padding = 4,
  elevation = 'sm',
  bordered = false,
  onPress,
  style,
  ...rest
}: CardProps) {
  const composed: ViewStyle = {
    backgroundColor: colors.surface.background,
    borderRadius: radius.lg,
    padding: spacing[padding],
    borderWidth: bordered ? 1 : 0,
    borderColor: colors.surface.border,
    ...elevationStyle(elevation),
  };

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [composed, pressed && { opacity: 0.9 }, style]}>
        {children}
      </Pressable>
    );
  }

  return (
    <View {...rest} style={[composed, style]}>
      {children}
    </View>
  );
}

export default Card;
