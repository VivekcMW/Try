import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { colors, spacing } from '@lokul/ui-tokens';

export interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  edges?: readonly Edge[];
  background?: string;
  contentStyle?: ViewStyle;
  keyboardAvoiding?: boolean;
}

export function Screen({
  children,
  scroll = false,
  padded = true,
  edges = ['top', 'left', 'right'],
  background = colors.surface.background,
  contentStyle,
  keyboardAvoiding = true,
}: ScreenProps) {
  const inner = (
    <View
      style={[
        styles.inner,
        padded && { paddingHorizontal: spacing[4], paddingVertical: spacing[4] },
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {inner}
    </ScrollView>
  ) : (
    inner
  );

  const content = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {body}
    </KeyboardAvoidingView>
  ) : (
    body
  );

  return (
    <SafeAreaView edges={edges} style={[styles.flex, { backgroundColor: background }]}>
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  inner: { flex: 1 },
  scrollContent: { flexGrow: 1 },
});

export default Screen;
