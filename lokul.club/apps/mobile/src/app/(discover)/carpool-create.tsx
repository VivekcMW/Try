// PRD §09 — Create carpool trip
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { CARPOOL_META, type CarpoolKind } from '@/store/carpoolStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE  = process.env.EXPO_PUBLIC_API_BASE ?? '';
const KINDS: CarpoolKind[] = ['office', 'school', 'airport', 'event', 'other'];

export default function CreateCarpool() {
  const router  = useRouter();
  const userId  = useWalletStore((s) => s.userId);
  const pinCode = useOnboardingStore((s) => s.pin);
  const [kind,      setKind]      = useState<CarpoolKind>('office');
  const [origin,    setOrigin]    = useState('Society main gate');
  const [destination, setDestination] = useState('');
  const [seats,     setSeats]     = useState('3');
  const [cost,      setCost]      = useState('120');
  const [recurring, setRecurring] = useState<'one-off' | 'weekday' | 'daily'>('weekday');
  const [submitting, setSubmitting] = useState(false);

  const valid = destination.trim().length > 2 && Number(seats) > 0 && Number(cost) >= 0;

  const submit = async () => {
    if (!valid || !userId || !pinCode) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/carpool`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: userId, pinCode,
          fromLabel: origin.trim(),
          toLabel: destination.trim(),
          departureAt: new Date(Date.now() + 14 * 3600000).toISOString(),
          seatsTotal: Number(seats),
          pricePaise: Number(cost) * 100,
          notes: kind,
        }),
      });
      if (!res.ok) throw new Error('publish failed');
      router.back();
    } catch {
      Alert.alert('Error', 'Could not publish ride — please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>Offer a ride</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <VStack gap={4}>
          <VStack gap={2}>
            <Text variant="caption" style={{ fontWeight: '700' }}>Trip type</Text>
            <HStack gap={2} align="center" style={{ flexWrap: 'wrap' }}>
              {KINDS.map((k) => {
                const m = CARPOOL_META[k];
                const a = kind === k;
                return (
                  <Pressable key={k} onPress={() => setKind(k)} style={[styles.pill, a && { backgroundColor: m.tint + '22', borderColor: m.tint }]}>
                    <Text style={{ fontSize: 16 }}>{m.emoji}</Text>
                    <Text variant="caption" style={{ fontWeight: '700', color: a ? m.tint : colors.surface.foreground }}>{m.label}</Text>
                  </Pressable>
                );
              })}
            </HStack>
          </VStack>

          <VStack gap={1.5}>
            <Text variant="caption" style={{ fontWeight: '700' }}>Pickup</Text>
            <TextInput value={origin} onChangeText={setOrigin} style={styles.input} placeholderTextColor={colors.surface.textSecondary} />
          </VStack>

          <VStack gap={1.5}>
            <Text variant="caption" style={{ fontWeight: '700' }}>Destination</Text>
            <TextInput value={destination} onChangeText={setDestination} placeholder="e.g. Manyata Tech Park" style={styles.input} placeholderTextColor={colors.surface.textSecondary} />
          </VStack>

          <HStack gap={3} align="center">
            <VStack gap={1.5} style={{ flex: 1 }}>
              <Text variant="caption" style={{ fontWeight: '700' }}>Seats</Text>
              <TextInput value={seats} onChangeText={setSeats} keyboardType="numeric" style={styles.input} />
            </VStack>
            <VStack gap={1.5} style={{ flex: 1 }}>
              <Text variant="caption" style={{ fontWeight: '700' }}>Cost / seat (₹)</Text>
              <TextInput value={cost} onChangeText={setCost} keyboardType="numeric" style={styles.input} />
            </VStack>
          </HStack>

          <VStack gap={2}>
            <Text variant="caption" style={{ fontWeight: '700' }}>Schedule</Text>
            <HStack gap={2} align="center">
              {(['one-off', 'weekday', 'daily'] as const).map((r) => {
                const a = recurring === r;
                return (
                  <Pressable key={r} onPress={() => setRecurring(r)} style={[styles.pill, a && { backgroundColor: colors.brand[50], borderColor: colors.brand[400] }]}>
                    <Text variant="caption" style={{ fontWeight: '700', color: a ? colors.brand[700] : colors.surface.foreground }}>
                      {r === 'one-off' ? 'One-off' : r === 'weekday' ? 'Mon–Fri' : 'Daily'}
                    </Text>
                  </Pressable>
                );
              })}
            </HStack>
          </VStack>

          <Card padding={3} elevation="none" bordered style={{ backgroundColor: colors.brand[50], borderColor: colors.brand[200] }}>
            <Text variant="caption" tone="secondary">
              Carpools share rides with trusted neighbours only. Lokul keeps payment in escrow until the trip completes.
            </Text>
          </Card>
        </VStack>
      </ScrollView>

      <View style={styles.footer}>
        <View style={{ flex: 1 }}>
          <Button label={submitting ? 'Publishing…' : 'Publish ride'} onPress={submit} disabled={!valid || submitting} fullWidth />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    backgroundColor: colors.surface.background,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.surface.border,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing[5], paddingBottom: spacing[10] },
  input: {
    borderWidth: 1, borderColor: colors.surface.border, borderRadius: radius.md,
    paddingHorizontal: spacing[3], paddingVertical: spacing[2.5],
    fontSize: 15, color: colors.surface.foreground, backgroundColor: colors.surface.background,
  },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[1.5],
    paddingHorizontal: spacing[3], paddingVertical: spacing[1.5],
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.surface.border, backgroundColor: colors.surface.background,
  },
  footer: {
    padding: spacing[4], paddingBottom: spacing[6], flexDirection: 'row',
    backgroundColor: colors.surface.background,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.surface.border,
  },
});
