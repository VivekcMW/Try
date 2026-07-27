import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { Text } from './Text';

export interface StepHeaderProps {
  step: number;
  total: number;
  onBack?: () => void;
  showBack?: boolean;
}

export function StepHeader({ step, total, onBack, showBack = true }: StepHeaderProps) {
  const router = useRouter();
  const handleBack = () => (onBack ? onBack() : router.back());
  const pct = Math.min(1, Math.max(0, step / total));

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {showBack ? (
          <Pressable onPress={handleBack} hitSlop={16} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.surface.foreground} />
          </Pressable>
        ) : (
          <View style={styles.backBtn} />
        )}
        <Text variant="caption" tone="secondary">
          Step {step} of {total}
        </Text>
        <View style={styles.backBtn} />
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    paddingBottom: spacing[3],
    gap: spacing[2],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  track: {
    height: 4,
    backgroundColor: colors.gray[100],
    borderRadius: 2,
    overflow: 'hidden',
    marginHorizontal: spacing[1],
  },
  fill: {
    height: 4,
    backgroundColor: colors.brand[600],
    borderRadius: 2,
  },
});

export default StepHeader;
