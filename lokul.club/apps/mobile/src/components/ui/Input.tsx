import { useState, type ReactNode } from 'react';
import {
  TextInput,
  type TextInputProps,
  View,
  StyleSheet,
  Pressable,
  type ViewStyle,
} from 'react-native';
import { colors, radius, spacing, textPresets } from '@lokul/ui-tokens';
import { Text } from './Text';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  helper,
  leftIcon,
  rightSlot,
  containerStyle,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.semantic.danger
    : focused
    ? colors.brand[600]
    : colors.surface.border;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <Text variant="label" tone="secondary" style={styles.label}>
          {label}
        </Text>
      ) : null}

      <Pressable
        accessible={false}
        style={[
          styles.field,
          {
            borderColor,
            backgroundColor: colors.surface.background,
            borderWidth: focused || error ? 1.5 : 1,
          },
        ]}
      >
        {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
        <TextInput
          {...rest}
          placeholderTextColor={colors.surface.textDisabled}
          style={[
            styles.input,
            { color: colors.surface.foreground },
            StyleSheet.flatten(textPresets.body),
          ]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
        />
        {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : null}
      </Pressable>

      {error ? (
        <Text variant="caption" tone="danger" style={styles.helper}>
          {error}
        </Text>
      ) : helper ? (
        <Text variant="caption" tone="secondary" style={styles.helper}>
          {helper}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing[1.5] },
  label: { marginBottom: 2 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    minHeight: 44,
  },
  leftIcon: { marginRight: spacing[2] },
  rightSlot: { marginLeft: spacing[2] },
  input: { flex: 1, paddingVertical: spacing[2] },
  helper: { marginTop: 2 },
});

export default Input;
