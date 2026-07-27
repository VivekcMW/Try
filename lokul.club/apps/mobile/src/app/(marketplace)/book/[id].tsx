import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Check, Clock, MapPin, MessageSquare, Wallet } from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore, rupees } from '@/store/walletStore';
import { colors, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
];
const DAYS = ['Today', 'Tomorrow', 'Day after'];

type Merchant = { id: string; ownerId: string; name: string; priceLabel?: string; category?: string; pricePaise?: number; };
type Listing  = { id: string; userId: string; title: string; pricePaise: number; priceUnit: string; user?: { name: string } };

export default function BookingScreen() {
  const { id, listingId, pricePaise: pricePaiseParam }  = useLocalSearchParams<{ id: string; listingId?: string; pricePaise?: string }>();
  const router   = useRouter();
  const userId   = useWalletStore((s) => s.userId);
  const balancePaise = useWalletStore((s) => s.balancePaise);
  const pinCode  = useOnboardingStore((s) => s.pin);
  const [merchant,   setMerchant]   = useState<Merchant | null>(null);
  const [listing,    setListing]    = useState<Listing | null>(null);
  const [day,        setDay]        = useState(0);
  const [slot,       setSlot]       = useState<string | null>(null);
  const [address,    setAddress]    = useState('');
  const [notes,      setNotes]      = useState('');
  const [booked,     setBooked]     = useState(false);
  const [booking,    setBooking]    = useState(false);
  const [orderId,    setOrderId]    = useState<string | null>(null);

  // Determine effective price
  const effectivePricePaise: number = listing?.pricePaise
    ?? merchant?.pricePaise
    ?? (pricePaiseParam ? parseInt(pricePaiseParam, 10) : 0);

  const insufficientBalance = effectivePricePaise > 0 && balancePaise < effectivePricePaise;

  const loadProvider = useCallback(async () => {
    if (!id) return;
    try {
      if (listingId) {
        // Peer service listing — fetch listing details
        const res  = await fetch(`${BASE}/api/mobile/service-listings?sellerId=${id}`);
        const data = await res.json();
        const found = (data.items ?? []).find((l: Listing) => l.id === listingId) ?? data.items?.[0];
        if (found) { setListing(found); return; }
      }
      // Merchant booking
      const res  = await fetch(`${BASE}/api/mobile/merchants/${id}`);
      const data = await res.json();
      setMerchant(data);
    } catch {
      setMerchant({ id: id ?? '', ownerId: id ?? '', name: 'Provider' });
    }
  }, [id, listingId]);

  useEffect(() => { loadProvider(); }, [loadProvider]);

  const sellerName = listing?.user?.name ?? merchant?.name ?? '…';
  const sellerOwnerId = listing?.userId ?? merchant?.ownerId ?? id ?? '';

  const handleBook = async () => {
    if (!slot || !userId) return;
    if (!address.trim()) {
      Alert.alert('Address required', 'Please enter your flat/address so the provider can find you.');
      return;
    }
    if (insufficientBalance) {
      Alert.alert(
        'Insufficient balance',
        `You need ${rupees(effectivePricePaise)} in your wallet to place this order. Please add money first.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add money', onPress: () => router.push('/(wallet)/add-money' as never) },
        ],
      );
      return;
    }

    setBooking(true);
    try {
      const d = new Date();
      d.setDate(d.getDate() + day);
      const [time, period] = slot.split(' ');
      const [h, m] = time.split(':').map(Number);
      let hours = h;
      if (period === 'PM' && h !== 12) hours = h + 12;
      else if (period === 'AM' && h === 12) hours = 0;
      d.setHours(hours, m, 0, 0);

      const res = await fetch(`${BASE}/api/mobile/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId:         userId,
          sellerId:        sellerOwnerId,
          listingId:       listing?.id ?? undefined,
          serviceCategory: (merchant?.category ?? listing?.id) ? undefined : undefined,
          title:           listing?.title ?? `Booking with ${sellerName}`,
          pricePaise:      effectivePricePaise || 0,
          addressNote:     address.trim(),
          buyerNote:       notes.trim() || `${DAYS[day]} at ${slot}`,
          scheduledAt:     d.toISOString(),
          pinCode:         pinCode ?? '',
        }),
      });
      if (res.ok) {
        const order = await res.json();
        setOrderId(order.id ?? null);
        setBooked(true);
      } else {
        const errData = await res.json();
        if (res.status === 422) {
          Alert.alert(
            'Insufficient balance',
            'You don\'t have enough money in your wallet. Please add funds.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Add money', onPress: () => router.push('/(wallet)/add-money' as never) },
            ],
          );
        } else {
          Alert.alert('Error', errData.error ?? 'Booking failed');
        }
      }
    } catch {
      Alert.alert('Error', 'Network error');
    } finally {
      setBooking(false);
    }
  };

  if (booked) {
    return (
      <SafeAreaView style={[styles.safe, { alignItems: 'center', justifyContent: 'center' }]} edges={['top', 'bottom']}>
        <View style={styles.successCircle}>
          <Check size={40} color="#fff" />
        </View>
        <Text variant="h3" style={{ color: colors.surface.heading, marginTop: spacing[5], textAlign: 'center' }}>
          Booking Confirmed!
        </Text>
        <Text variant="body" tone="secondary" style={{ textAlign: 'center', marginTop: spacing[2], paddingHorizontal: spacing[8] }}>
          {sellerName} has been notified and will confirm shortly.
          {effectivePricePaise > 0 ? ` ${rupees(effectivePricePaise)} has been held in escrow.` : ''}
        </Text>
        <VStack gap={3} style={{ width: '100%', paddingHorizontal: spacing[8], marginTop: spacing[4] }}>
          {!!orderId && (
            <Button label="View Order Details" onPress={() => router.push(`/(marketplace)/order/${orderId}` as never)} />
          )}
          <Button label="Back to Home" variant="secondary" onPress={() => router.push('/(tabs)/' as never)} />
        </VStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack gap={3} align="center" style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>
          Book — {sellerName}
        </Text>
      </HStack>

      <ScrollView contentContainerStyle={{ padding: spacing[5], gap: spacing[4], paddingBottom: spacing[16] }}>
        {/* Wallet balance indicator */}
        <Card padding={3} elevation="none" bordered style={{ borderColor: insufficientBalance ? '#FCA5A5' : colors.brand[200], backgroundColor: insufficientBalance ? '#FEF2F2' : colors.brand[50] }}>
          <HStack gap={2} align="center">
            <Wallet size={16} color={insufficientBalance ? '#DC2626' : colors.brand[600]} />
            <Text variant="caption" style={{ flex: 1, color: insufficientBalance ? '#DC2626' : colors.brand[700], fontWeight: '700' }}>
              Wallet: {rupees(balancePaise)}
              {effectivePricePaise > 0 ? ` · Required: ${rupees(effectivePricePaise)}` : ''}
            </Text>
            {insufficientBalance && (
              <Pressable onPress={() => router.push('/(wallet)/add-money' as never)}>
                <Text variant="caption" style={{ color: '#DC2626', fontWeight: '700', textDecorationLine: 'underline' }}>Add money</Text>
              </Pressable>
            )}
          </HStack>
        </Card>

        {/* Day picker */}
        <VStack gap={2}>
          <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>Select Day</Text>
          <HStack gap={2}>
            {DAYS.map((d, i) => (
              <Pressable
                key={d}
                onPress={() => setDay(i)}
                style={[styles.dayChip, day === i && styles.dayChipActive]}
                accessibilityRole="button"
              >
                <Text variant="caption" style={{ fontWeight: '700', color: day === i ? '#fff' : colors.surface.foreground }}>
                  {d}
                </Text>
              </Pressable>
            ))}
          </HStack>
        </VStack>

        {/* Time slot picker */}
        <VStack gap={2}>
          <HStack gap={2} align="center">
            <Clock size={16} color={colors.brand[600]} />
            <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>Select Time</Text>
          </HStack>
          <View style={styles.slotGrid}>
            {TIME_SLOTS.map((t) => (
              <Pressable
                key={t}
                onPress={() => setSlot(t)}
                style={[styles.slotChip, slot === t && styles.slotChipActive]}
                accessibilityRole="button"
              >
                <Text
                  variant="caption"
                  style={{ fontWeight: '600', color: slot === t ? colors.brand[700] : colors.surface.foreground }}
                >
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>
        </VStack>

        {/* Summary */}
        {!!slot && (
          <Card padding={4} elevation="sm">
            <VStack gap={2}>
              <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>Booking Summary</Text>
              <HStack gap={2} align="center">
                <Text variant="caption" tone="secondary" style={{ width: 80 }}>Provider</Text>
                <Text variant="body" style={{ fontWeight: '600', color: colors.surface.heading }}>{sellerName}</Text>
              </HStack>
              <HStack gap={2} align="center">
                <Text variant="caption" tone="secondary" style={{ width: 80 }}>When</Text>
                <Text variant="body" style={{ fontWeight: '600', color: colors.surface.heading }}>
                  {DAYS[day]} at {slot}
                </Text>
              </HStack>
              {effectivePricePaise > 0 && (
                <HStack gap={2} align="center">
                  <Text variant="caption" tone="secondary" style={{ width: 80 }}>Amount</Text>
                  <Text variant="body" style={{ fontWeight: '700', color: colors.brand[600] }}>
                    {rupees(effectivePricePaise)}
                    <Text variant="caption" tone="secondary"> (held in escrow)</Text>
                  </Text>
                </HStack>
              )}
            </VStack>
          </Card>
        )}

        {/* Address */}
        <VStack gap={2}>
          <HStack gap={2} align="center">
            <MapPin size={16} color={colors.brand[600]} />
            <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>Your Address *</Text>
          </HStack>
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Flat / House no., Building, Landmark"
            placeholderTextColor={colors.surface.textSecondary}
            style={styles.textInput}
            multiline
            numberOfLines={2}
          />
        </VStack>

        {/* Notes */}
        <VStack gap={2}>
          <HStack gap={2} align="center">
            <MessageSquare size={16} color={colors.brand[600]} />
            <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>Special Instructions</Text>
          </HStack>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Any special requirements or instructions for the provider…"
            placeholderTextColor={colors.surface.textSecondary}
            style={styles.textInput}
            multiline
            numberOfLines={3}
          />
        </VStack>

        <Button
          label={booking ? 'Booking…' : effectivePricePaise > 0 ? `Confirm & Pay ${rupees(effectivePricePaise)}` : 'Confirm Booking'}
          disabled={!slot || booking || insufficientBalance}
          onPress={handleBook}
          fullWidth
        />
        {insufficientBalance && (
          <Text variant="caption" style={{ textAlign: 'center', color: '#DC2626' }}>
            Add ₹{((effectivePricePaise - balancePaise) / 100).toFixed(0)} more to your wallet to proceed.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.background },
  topBar: {
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    borderBottomWidth: 0.5, borderBottomColor: colors.surface.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center',
  },
  dayChip: {
    flex: 1, paddingVertical: spacing[2.5], borderRadius: 8,
    backgroundColor: colors.gray[100], alignItems: 'center',
    borderWidth: 1.5, borderColor: 'transparent',
  },
  dayChipActive: { backgroundColor: colors.brand[600], borderColor: colors.brand[600] },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  slotChip: {
    paddingHorizontal: spacing[4], paddingVertical: spacing[2],
    borderRadius: 8, backgroundColor: colors.gray[50],
    borderWidth: 1.5, borderColor: colors.surface.border,
  },
  slotChipActive: {
    backgroundColor: colors.brand[50], borderColor: colors.brand[400],
  },
  textInput: {
    borderWidth: 1, borderColor: colors.surface.border, borderRadius: 10,
    padding: spacing[3], fontFamily: undefined, fontSize: 14,
    color: colors.surface.foreground, backgroundColor: colors.surface.background,
    textAlignVertical: 'top', minHeight: 60,
  },
  successCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#22C55E', alignItems: 'center', justifyContent: 'center',
  },
});

