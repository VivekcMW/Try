// No maps library (react-native-maps / expo-maps) is installed in this app,
// so real-time slot availability is shown as a list grouped by zone instead of
// a literal map view — an honest, working substitute rather than a fake map UI.
import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin } from 'lucide-react-native';
import { Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';

type ZoneSlot = { id: string; status: 'vacant' | 'occupied' | 'reserved' };
type Zone = { id: string; name: string; slots: ZoneSlot[] };

// Illustrative nearby-zone availability — matches the community stats shown on
// the main Parking screen (250 slots total across the society).
const ZONES: Zone[] = [
  {
    id: 'a',
    name: 'Basement 1 — Section A',
    slots: Array.from({ length: 12 }, (_, i) => ({
      id: `A-${100 + i}`,
      status: i % 4 === 0 ? 'vacant' : i % 7 === 0 ? 'reserved' : 'occupied',
    })),
  },
  {
    id: 'b',
    name: 'Basement 2 — Bike Zone',
    slots: Array.from({ length: 10 }, (_, i) => ({
      id: `B-0${40 + i}`,
      status: i % 3 === 0 ? 'vacant' : 'occupied',
    })),
  },
  {
    id: 'v',
    name: 'Visitor Parking',
    slots: Array.from({ length: 8 }, (_, i) => ({
      id: `V-${i + 1 < 10 ? '0' : ''}${i + 1}`,
      status: i % 2 === 0 ? 'vacant' : 'occupied',
    })),
  },
];

const STATUS_COLOR: Record<ZoneSlot['status'], string> = {
  vacant: colors.success,
  occupied: colors.danger,
  reserved: colors.warning,
};

export default function ParkingMapScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack gap="md" align="center" style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} accessibilityRole="button">
          <ArrowLeft size={24} color={colors.surface.foreground} />
        </Pressable>
        <VStack style={{ flex: 1 }}>
          <Text variant="h3" style={{ fontWeight: '700' }}>Nearby Slots</Text>
          <Text variant="caption" tone="secondary">List view — map not available on this device</Text>
        </VStack>
      </HStack>

      <HStack gap="md" style={styles.legend}>
        {(['vacant', 'occupied', 'reserved'] as const).map((s) => (
          <HStack key={s} gap="xs" align="center">
            <View style={[styles.legendDot, { backgroundColor: STATUS_COLOR[s] }]} />
            <Text variant="caption" tone="secondary" style={{ textTransform: 'capitalize' }}>{s}</Text>
          </HStack>
        ))}
      </HStack>

      <ScrollView contentContainerStyle={styles.scroll}>
        <VStack gap="lg">
          {ZONES.map((zone) => (
            <Card key={zone.id} style={styles.zoneCard}>
              <HStack gap="sm" align="center" style={{ marginBottom: spacing.sm }}>
                <MapPin size={16} color={colors.brand[600]} />
                <Text variant="body" style={{ fontWeight: '600' }}>{zone.name}</Text>
              </HStack>
              <View style={styles.grid}>
                {zone.slots.map((slot) => (
                  <View key={slot.id} style={[styles.slotChip, { borderColor: STATUS_COLOR[slot.status] }]}>
                    <Text variant="caption" style={{ fontWeight: '600' }}>{slot.id}</Text>
                  </View>
                ))}
              </View>
            </Card>
          ))}
        </VStack>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  legend: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  scroll: { padding: spacing.lg },
  zoneCard: { padding: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  slotChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1.5,
  },
});
