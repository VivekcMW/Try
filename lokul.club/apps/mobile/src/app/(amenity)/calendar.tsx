// Amenity bookings calendar — groups bookings by date.
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, CalendarDays } from 'lucide-react-native';
import { Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { useWalletStore } from '@/store/walletStore';
import { type MyBooking } from './index';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export default function AmenityCalendarScreen() {
  const router = useRouter();
  const userId = useWalletStore((s) => s.userId);
  const [bookings, setBookings] = useState<MyBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/amenity/bookings?ownerId=${userId}`);
      const data = await res.json();
      setBookings(res.ok ? data.bookings : []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      </SafeAreaView>
    );
  }

  // Group by date label, most-relevant (upcoming) first, sorted by ISO date.
  const sorted = [...bookings].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  const groups = new Map<string, typeof sorted>();
  for (const b of sorted) {
    const key = b.dateLabel;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(b);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack align="center" gap={3} style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <ArrowLeft size={22} color={colors.surface.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700', flex: 1 }}>Booking Calendar</Text>
      </HStack>

      <ScrollView contentContainerStyle={styles.scroll}>
        {groups.size === 0 && (
          <Card padding={6} elevation="none" bordered>
            <VStack align="center" gap={2}>
              <CalendarDays size={40} color={colors.surface.textSecondary} />
              <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
                No bookings yet
              </Text>
            </VStack>
          </Card>
        )}

        {[...groups.entries()].map(([date, items]) => (
          <VStack key={date} gap={2} style={{ marginBottom: spacing[5] }}>
            <Text variant="label" tone="secondary" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {date}
            </Text>
            <VStack gap={2}>
              {items.map((booking) => (
                <Pressable key={booking.id} onPress={() => router.push(`/(amenity)/booking/${booking.id}`)}>
                  <Card padding={4} elevation="xs" bordered>
                    <HStack align="center" gap={3}>
                      <View style={styles.icon}>
                        <Text style={{ fontSize: 22 }}>{booking.amenityIcon}</Text>
                      </View>
                      <VStack style={{ flex: 1 }} gap={0}>
                        <Text variant="body" style={{ fontWeight: '700' }}>{booking.amenityName}</Text>
                        <Text variant="caption" tone="secondary">{booking.timeSlot}</Text>
                        <Text variant="caption" style={{ color: colors.brand[600] }}>{booking.bookingRef}</Text>
                      </VStack>
                      <StatusPill status={booking.status} />
                    </HStack>
                  </Card>
                </Pressable>
              ))}
            </VStack>
          </VStack>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatusPill({ status }: { readonly status: 'upcoming' | 'completed' | 'cancelled' }) {
  const map = {
    upcoming: { bg: colors.semantic.successBg, fg: colors.semantic.success, label: 'Upcoming' },
    completed: { bg: colors.gray[100], fg: colors.gray[600], label: 'Completed' },
    cancelled: { bg: colors.semantic.dangerBg, fg: colors.semantic.danger, label: 'Cancelled' },
  } as const;
  const s = map[status];
  return (
    <View style={{ backgroundColor: s.bg, paddingHorizontal: spacing[2], paddingVertical: 3, borderRadius: radius.full }}>
      <Text variant="caption" style={{ color: s.fg, fontWeight: '700' }}>{s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.background },
  header: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.border,
  },
  scroll: { padding: spacing[4], paddingBottom: spacing[10] },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.surface.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
});