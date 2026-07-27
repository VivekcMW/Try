// Amenity booking detail.
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, Clock, Hash } from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { useWalletStore } from '@/store/walletStore';
import { type MyBooking } from '../index';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export default function AmenityBookingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [booking, setBooking] = useState<MyBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/amenity/bookings/${id}`);
      const data = await res.json();
      setBooking(res.ok ? data.booking : null);
    } catch {
      setBooking(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <HStack align="center" gap={3} style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <ArrowLeft size={22} color={colors.surface.foreground} />
          </Pressable>
          <Text variant="h3" style={{ fontWeight: '700' }}>Booking not found</Text>
        </HStack>
        <View style={styles.notFound}>
          <Text variant="body" tone="secondary">This booking no longer exists.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleCancel = () => {
    Alert.alert('Cancel booking?', `This will cancel your booking for ${booking.amenityName}.`, [
      { text: 'Keep booking', style: 'cancel' },
      {
        text: 'Cancel booking',
        style: 'destructive',
        onPress: async () => {
          setCancelling(true);
          try {
            const res = await fetch(`${BASE}/api/mobile/amenity/bookings/${booking.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'cancelled' }),
            });
            if (!res.ok) throw new Error('failed');
            if (booking.totalPricePaise > 0) {
              useWalletStore.getState().earn(booking.totalPricePaise, `Refund: ${booking.amenityName} booking cancelled`);
            }
            router.back();
          } catch {
            Alert.alert('Error', 'Could not cancel this booking — please try again.');
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack align="center" gap={3} style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <ArrowLeft size={22} color={colors.surface.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>Booking Details</Text>
      </HStack>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.heroIcon}>
          <Text style={{ fontSize: 40 }}>{booking.amenityIcon}</Text>
        </View>
        <Text variant="h2" style={{ textAlign: 'center', fontWeight: '800' }}>{booking.amenityName}</Text>
        <Text variant="caption" style={{ textAlign: 'center', color: colors.brand[600], marginBottom: spacing[4] }}>
          {booking.bookingRef}
        </Text>

        <Card padding={4} elevation="xs" bordered style={{ gap: spacing[3] }}>
          <Row icon={<Calendar size={16} color={colors.brand[600]} />} label="Date" value={booking.dateLabel} />
          <Row icon={<Clock size={16} color={colors.brand[600]} />} label="Time slot" value={booking.timeSlot} />
          <Row icon={<Hash size={16} color={colors.brand[600]} />} label="Status" value={booking.status} />
        </Card>

        <Card padding={4} elevation="none" bordered style={{ marginTop: spacing[4] }}>
          <HStack style={{ justifyContent: 'space-between' }}>
            <Text variant="body" tone="secondary">Total paid</Text>
            <Text variant="h3" style={{ fontWeight: '800', color: colors.brand[600] }}>
              ₹{Math.round(booking.totalPricePaise / 100)}
            </Text>
          </HStack>
        </Card>

        {booking.status === 'upcoming' && (
          <View style={{ marginTop: spacing[6] }}>
            <Button
              label={cancelling ? 'Cancelling…' : 'Cancel Booking'}
              variant="destructive"
              onPress={handleCancel}
              disabled={cancelling}
              loading={cancelling}
              fullWidth
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ icon, label, value }: { readonly icon: React.ReactNode; readonly label: string; readonly value: string }) {
  return (
    <HStack align="center" gap={2} style={{ justifyContent: 'space-between' }}>
      <HStack align="center" gap={2}>
        {icon}
        <Text variant="body" tone="secondary">{label}</Text>
      </HStack>
      <Text variant="body" style={{ fontWeight: '700', textTransform: 'capitalize' }}>{value}</Text>
    </HStack>
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
  scroll: { padding: spacing[5], paddingBottom: spacing[10] },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: colors.surface.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing[3],
  },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
