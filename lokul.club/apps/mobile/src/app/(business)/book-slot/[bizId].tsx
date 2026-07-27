// PRD §06 — Customer appointment booking flow (wired to real API)
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CalendarCheck } from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

function buildDateStrip(): string[] {
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(Date.now() + i * 86_400_000);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function formatDay(dateStr: string): { day: string; date: string } {
  const d = new Date(dateStr + 'T00:00:00');
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return { day: dayNames[d.getDay()], date: String(d.getDate()) };
}

type ApiSlot = { id: string; startTime: string; endTime: string; capacity: number; booked: number };
type BookStep = 'date' | 'time' | 'confirm' | 'success';

export default function BookSlotPage() {
  const router  = useRouter();
  const { bizId } = useLocalSearchParams<{ bizId: string }>();
  const userId  = useWalletStore((s) => s.userId);
  const _pinCode = useOnboardingStore((s) => s.pin); // reserved

  const DATE_STRIP = buildDateStrip();
  const [step,            setStep]          = useState<BookStep>('date');
  const [selectedDate,    setSelectedDate]  = useState(DATE_STRIP[0]);
  const [slots,           setSlots]         = useState<ApiSlot[]>([]);
  const [slotsLoading,    setSlotsLoading]  = useState(false);
  const [selectedSlot,    setSelectedSlot]  = useState<ApiSlot | null>(null);
  const serviceLabel                        = 'General appointment';
  const [submitting,      setSubmitting]    = useState(false);

  const loadSlots = useCallback(async (date: string) => {
    if (!bizId) return;
    setSlotsLoading(true);
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res  = await fetch(`${BASE}/api/mobile/merchants/${bizId}/slots?date=${date}`, { signal: ctrl.signal });
      const data = await res.json();
      const list = Array.isArray(data?.slots) ? data.slots : [];
      setSlots(list.filter((s: ApiSlot) => s.booked < s.capacity));
    } catch { setSlots([]); } finally { clearTimeout(to); setSlotsLoading(false); }
  }, [bizId]);

  useEffect(() => { if (step === 'time') loadSlots(selectedDate); }, [step, selectedDate, loadSlots]);

  async function confirm() {
    if (!userId) return;
    setSubmitting(true);
    try {
      const scheduledAt = new Date(`${selectedDate}T${selectedSlot?.startTime ?? '09:00'}:00`).toISOString();
      const res = await fetch(`${BASE}/api/mobile/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId, merchantId: bizId,
          slotId: selectedSlot?.id ?? null,
          serviceLabel, scheduledAt,
        }),
      });
      if (!res.ok) throw new Error('booking failed');
      setStep('success');
    } catch {
      Alert.alert('Error', 'Could not book — please try again.');
    } finally { setSubmitting(false); }
  }

  if (step === 'success') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.successBox}>
          <CalendarCheck size={56} color={colors.semantic.success} />
          <Text variant="h2" style={{ fontWeight: '800', textAlign: 'center' }}>Booking Confirmed!</Text>
          <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
            {serviceLabel} on {selectedDate}{selectedSlot ? ` at ${selectedSlot.startTime}` : ''}.
          </Text>
          <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>The provider will call to confirm.</Text>
          <View style={{ width: '100%', marginTop: spacing[4] }}>
            <Button label="Done" onPress={() => router.back()} fullWidth />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            if (step === 'date') router.back();
            else if (step === 'time') setStep('date');
            else setStep('time');
          }}
          hitSlop={10}
          style={styles.iconBtn}
        >
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>Book appointment</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {step === 'date' && (
          <VStack gap={4}>
            <Text variant="h3" style={{ fontWeight: '700' }}>Pick a date</Text>
            <View style={styles.dateStrip}>
              {DATE_STRIP.map((d) => {
                const { day, date } = formatDay(d);
                const active = selectedDate === d;
                return (
                  <Pressable key={d} onPress={() => setSelectedDate(d)} style={[styles.dateChip, active && styles.dateChipActive]}>
                    <Text variant="caption" style={{ color: active ? '#fff' : colors.surface.textSecondary, fontWeight: '600' }}>{day}</Text>
                    <Text variant="body" style={{ color: active ? '#fff' : colors.surface.foreground, fontWeight: '800' }}>{date}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Button label="See available slots" onPress={() => setStep('time')} fullWidth />
          </VStack>
        )}

        {step === 'time' && (
          <VStack gap={4}>
            <Text variant="h3" style={{ fontWeight: '700' }}>Available slots — {selectedDate}</Text>
            {slotsLoading && <ActivityIndicator />}
            {!slotsLoading && slots.length === 0 && (
              <Card padding={4} elevation="none" bordered>
                <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
                  No slots available for this date. Try another date.
                </Text>
              </Card>
            )}
            {!slotsLoading && slots.length > 0 && (
              <View style={styles.timeGrid}>
                {slots.map((s) => {
                  const active = selectedSlot?.id === s.id;
                  return (
                    <Pressable key={s.id} onPress={() => setSelectedSlot(s)} style={[styles.timeChip, active && styles.timeChipActive]}>
                      <Text variant="caption" style={{ fontWeight: '700', color: active ? '#fff' : colors.surface.foreground }}>
                        {s.startTime}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
            <Button label="Continue" onPress={() => setStep('confirm')} disabled={!selectedSlot} fullWidth />
          </VStack>
        )}

        {step === 'confirm' && (
          <VStack gap={4}>
            <Text variant="h3" style={{ fontWeight: '700' }}>Confirm booking</Text>
            <Card padding={4} elevation="xs" bordered>
              <VStack gap={2.5}>
                <Row label="Business" value={bizId ?? '—'} />
                <Row label="Service"  value={serviceLabel} />
                <Row label="Date"     value={selectedDate} />
                <Row label="Time"     value={selectedSlot?.startTime ?? '—'} />
              </VStack>
            </Card>
            <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
              The shop will confirm your booking within 30 minutes.
            </Text>
          </VStack>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, bold }: { readonly label: string; readonly value: string; readonly bold?: boolean }) {
  return (
    <HStack gap={2} align="center" style={{ justifyContent: 'space-between' }}>
      <Text variant="caption" tone="secondary">{label}</Text>
      <Text variant="caption" style={{ fontWeight: bold ? '800' : '600', color: bold ? colors.brand[700] : colors.surface.foreground }}>
        {value}
      </Text>
    </HStack>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.surface.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surface.border,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing[5], paddingBottom: spacing[10] },
  successBox: {
    flex: 1,
    padding: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
  },
  dateStrip: { flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' },
  dateChip: {
    flexBasis: '13%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: spacing[2],
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.background,
    gap: 2,
  },
  dateChipActive: { backgroundColor: colors.brand[600], borderColor: colors.brand[600] },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  timeChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.background,
  },
  timeChipActive: { backgroundColor: colors.brand[600], borderColor: colors.brand[600] },
});
