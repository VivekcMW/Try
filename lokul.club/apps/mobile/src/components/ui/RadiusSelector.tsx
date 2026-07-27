import { Pressable, StyleSheet, View } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { Text } from './Text';
import {
  RADIUS_LABEL,
  RADIUS_ORDER,
  useRadiusStore,
  type RadiusKey,
} from '@/store/radiusStore';

interface Props {
  readonly compact?: boolean;
}

export function RadiusSelector({ compact = false }: Readonly<Props>) {
  const active = useRadiusStore((s) => s.active);
  const setRadius = useRadiusStore((s) => s.setRadius);

  if (compact) {
    // Cycles through 200 → 500 → 2km → 5km → back
    const idx = RADIUS_ORDER.indexOf(active);
    const next = RADIUS_ORDER[(idx + 1) % RADIUS_ORDER.length];
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Radius ${RADIUS_LABEL[active]}. Tap to change.`}
        onPress={() => setRadius(next)}
        style={styles.pill}
      >
        <MapPin size={13} color={colors.brand[700]} />
        <Text variant="caption" style={styles.pillText}>
          {RADIUS_LABEL[active]}
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.row}>
      {RADIUS_ORDER.map((r) => {
        const isActive = r === active;
        return (
          <Pressable
            key={r}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => setRadius(r as RadiusKey)}
            style={[styles.chip, isActive && styles.chipActive]}
          >
            <Text
              variant="caption"
              style={{
                color: isActive ? '#fff' : colors.surface.foreground,
                fontWeight: '600',
              }}
            >
              {RADIUS_LABEL[r]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: colors.brand[50],
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.brand[100],
  },
  pillText: {
    color: colors.brand[700],
    fontWeight: '700',
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    gap: spacing[2],
    padding: spacing[1],
    backgroundColor: colors.gray[100],
    borderRadius: radius.full,
  },
  chip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: radius.full,
  },
  chipActive: {
    backgroundColor: colors.brand[600],
  },
});

export default RadiusSelector;
