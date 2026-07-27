/**
 * Book a Lab Test
 * Route: /(telemedicine)/labs
 */
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Check, Clock, Syringe } from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { LAB_TEST_CATALOG } from '@/data/telemedicine-catalog';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const TIME_SLOTS = ['7:00 AM', '9:00 AM', '11:00 AM', '4:00 PM', '6:00 PM'];

function nextDays(count: number): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    out.push({
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
      value: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    });
  }
  return out;
}

export default function LabsScreen() {
  const router = useRouter();
  const userId = useWalletStore((s) => s.userId);
  const days = useMemo(() => nextDays(5), []);

  const [testId, setTestId] = useState(LAB_TEST_CATALOG[0].id);
  const [dayIndex, setDayIndex] = useState(0);
  const [time, setTime] = useState(TIME_SLOTS[0]);
  const [booking, setBooking] = useState(false);

  const test = LAB_TEST_CATALOG.find((t) => t.id === testId)!;

  const handleBook = async () => {
    if (!userId) {
      Alert.alert('Not signed in', 'Please complete onboarding first.');
      return;
    }
    setBooking(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/telemedicine/lab-bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          testId: test.id,
          testName: test.name,
          pricePaise: test.price * 100,
          dateLabel: days[dayIndex].label,
          timeLabel: time,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error('failed');
      Alert.alert('Lab test booked', `${data.booking.testName} scheduled for ${data.booking.dateLabel} at ${data.booking.timeLabel}.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Failed to book', 'Please try again.');
    } finally {
      setBooking(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <HStack gap={spacing.md} style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>Book Lab Test</Text>
      </HStack>

      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="label" style={{ fontWeight: '600' }}>SELECT TEST</Text>
        <VStack gap={spacing.sm} style={{ marginTop: spacing.sm }}>
          {LAB_TEST_CATALOG.map((t) => {
            const isActive = t.id === testId;
            return (
              <Pressable key={t.id} onPress={() => setTestId(t.id)}>
                <Card style={[styles.testCard, isActive && styles.testCardActive]}>
                  <HStack gap={spacing.md} style={{ alignItems: 'center' }}>
                    <View style={styles.testIcon}>
                      <Syringe size={18} color={colors.brand[600]} />
                    </View>
                    <VStack style={{ flex: 1 }}>
                      <Text variant="body" style={{ fontWeight: '600' }}>{t.name}</Text>
                      <Text variant="caption" tone="secondary">
                        {t.sampleType} sample{t.fastingRequired ? ' · Fasting required' : ''}
                      </Text>
                    </VStack>
                    <Text variant="body" style={{ fontWeight: '700', color: colors.brand[600] }}>₹{t.price}</Text>
                    {isActive && <Check size={18} color={colors.brand[600]} />}
                  </HStack>
                </Card>
              </Pressable>
            );
          })}
        </VStack>

        <Text variant="label" style={{ fontWeight: '600', marginTop: spacing.lg }}>SELECT DATE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingVertical: spacing.sm }}>
          {days.map((d, idx) => {
            const isActive = idx === dayIndex;
            return (
              <Pressable key={d.value + idx} onPress={() => setDayIndex(idx)} style={[styles.dayChip, isActive && styles.dayChipActive]}>
                <Calendar size={12} color={isActive ? colors.surface.background : colors.textSecondary} />
                <Text variant="caption" style={{ fontWeight: '600', color: isActive ? colors.surface.background : colors.foreground }}>
                  {d.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text variant="label" style={{ fontWeight: '600', marginTop: spacing.md }}>SELECT TIME</Text>
        <View style={styles.chipsWrap}>
          {TIME_SLOTS.map((t) => {
            const isActive = t === time;
            return (
              <Pressable key={t} onPress={() => setTime(t)} style={[styles.timeChip, isActive && styles.dayChipActive]}>
                <Clock size={12} color={isActive ? colors.surface.background : colors.textSecondary} />
                <Text variant="caption" style={{ fontWeight: '600', color: isActive ? colors.surface.background : colors.foreground }}>
                  {t}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <HStack style={{ justifyContent: 'space-between', marginBottom: spacing.md }}>
          <Text variant="body" tone="secondary">Total</Text>
          <Text variant="body" style={{ fontWeight: '700' }}>₹{test.price}</Text>
        </HStack>
        <Button label={booking ? 'Booking…' : 'Book Test'} fullWidth size="lg" loading={booking} onPress={handleBook} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.background },
  header: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: { padding: spacing.lg, paddingBottom: spacing[10] },
  testCard: { padding: spacing.md },
  testCardActive: { borderColor: colors.brand[600], borderWidth: 1 },
  testIcon: {
    width: 40, height: 40, borderRadius: radius.md,
    backgroundColor: colors.brand[50], alignItems: 'center', justifyContent: 'center',
  },
  dayChip: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.full, backgroundColor: colors.surfaceMuted,
    borderWidth: 1, borderColor: colors.border,
  },
  dayChipActive: { backgroundColor: colors.brand[600], borderColor: colors.brand[600] },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  timeChip: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.full, backgroundColor: colors.surfaceMuted,
    borderWidth: 1, borderColor: colors.border,
  },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
});
