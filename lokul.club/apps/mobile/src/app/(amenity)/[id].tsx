import { useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Star,
  Users,
  Clock,
  IndianRupee,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle,
  AlertCircle,
} from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { AMENITIES } from '@/data/amenity-seed';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const TIME_SLOTS = [
  { id: '1', time: '6:00 AM - 8:00 AM', status: 'available' },
  { id: '2', time: '8:00 AM - 10:00 AM', status: 'booked' },
  { id: '3', time: '10:00 AM - 12:00 PM', status: 'available' },
  { id: '4', time: '12:00 PM - 2:00 PM', status: 'available' },
  { id: '5', time: '2:00 PM - 4:00 PM', status: 'booked' },
  { id: '6', time: '4:00 PM - 6:00 PM', status: 'available' },
  { id: '7', time: '6:00 PM - 8:00 PM', status: 'available' },
  { id: '8', time: '8:00 PM - 10:00 PM', status: 'available' },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AmenityDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const pinCode = useOnboardingStore((s) => s.pin);
  const userId = useWalletStore((s) => s.userId);
  const balancePaise = useWalletStore((s) => s.balancePaise);
  const AMENITY_DATA = AMENITIES.find((a) => a.id === id) ?? AMENITIES[0];
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [booking, setBooking] = useState(false);

  // Generate week dates
  const getWeekDates = () => {
    const dates = [];
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - start.getDay());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const toggleSlot = (slotId: string) => {
    setSelectedSlots(prev =>
      prev.includes(slotId)
        ? prev.filter(s => s !== slotId)
        : [...prev, slotId]
    );
  };

  const totalPrice = selectedSlots.length * AMENITY_DATA.pricePerHour * 2; // 2 hours per slot

  const handleBook = () => {
    if (selectedSlots.length === 0) {
      Alert.alert('Select Slots', 'Please select at least one time slot');
      return;
    }
    if (!userId || !pinCode) {
      Alert.alert('Not signed in', 'Please complete onboarding first.');
      return;
    }
    if (totalPrice * 100 > balancePaise) {
      Alert.alert('Insufficient balance', 'Please top up your Lokul Wallet and try again.');
      return;
    }

    Alert.alert(
      'Confirm Booking',
      `Book ${AMENITY_DATA.name} for ${selectedSlots.length} slot(s)?\n\nTotal: ₹${totalPrice}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Book Now',
          onPress: async () => {
            setBooking(true);
            try {
              const isToday = selectedDate.toDateString() === today.toDateString();
              const slotLabels = TIME_SLOTS.filter((s) => selectedSlots.includes(s.id)).map((s) => s.time);
              const totalPricePaise = totalPrice * 100;
              const res = await fetch(`${BASE}/api/mobile/amenity/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ownerId: userId,
                  amenityId: AMENITY_DATA.id,
                  amenityName: AMENITY_DATA.name,
                  amenityIcon: AMENITY_DATA.icon,
                  dateLabel: isToday ? 'Today' : selectedDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
                  dateISO: selectedDate.toISOString(),
                  timeSlot: slotLabels.join(', '),
                  totalPricePaise,
                  pinCode,
                }),
              });
              if (!res.ok) throw new Error('failed');
              if (totalPricePaise > 0) {
                useWalletStore.getState().spend(totalPricePaise, `Amenity booking: ${AMENITY_DATA.name}`);
              }
              Alert.alert('Booking Confirmed!', 'Your booking has been confirmed. Check My Bookings for details.', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch {
              Alert.alert('Booking failed', 'Please try again.');
            } finally {
              setBooking(false);
            }
          }
        },
      ]
    );
  };

  const prevWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <HStack style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <Text variant="h3" style={[styles.headerTitle, { fontWeight: '700' }]}>{AMENITY_DATA.name}</Text>
        <View style={{ width: 24 }} />
      </HStack>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Text style={styles.heroEmoji}>{AMENITY_DATA.icon}</Text>
          </View>
          <Text variant="body" tone="secondary" style={styles.heroDescription}>
            {AMENITY_DATA.description}
          </Text>
          
          <HStack gap={spacing.lg} style={styles.statsRow}>
            <VStack style={styles.stat}>
              <HStack gap={spacing.xs}>
                <Star size={16} color={colors.warning} fill={colors.warning} />
                <Text variant="bodyLg" style={{ fontWeight: '700' }}>{AMENITY_DATA.rating}</Text>
              </HStack>
              <Text variant="caption" tone="secondary">{AMENITY_DATA.reviews} reviews</Text>
            </VStack>
            <VStack style={styles.stat}>
              <HStack gap={spacing.xs}>
                <Users size={16} color={colors.brand[600]} />
                <Text variant="bodyLg" style={{ fontWeight: '700' }}>{AMENITY_DATA.capacity}</Text>
              </HStack>
              <Text variant="caption" tone="secondary">Max capacity</Text>
            </VStack>
            <VStack style={styles.stat}>
              <HStack gap={spacing.xs}>
                <IndianRupee size={16} color={colors.success} />
                <Text variant="bodyLg" style={{ fontWeight: '700' }}>{AMENITY_DATA.pricePerHour}</Text>
              </HStack>
              <Text variant="caption" tone="secondary">per hour</Text>
            </VStack>
          </HStack>
        </View>

        {/* Amenities */}
        <VStack gap={spacing.sm} style={styles.section}>
          <Text variant="bodyLg" style={{ fontWeight: '600' }}>Amenities Included</Text>
          <HStack style={styles.amenitiesList}>
            {AMENITY_DATA.amenities.map((amenity) => (
              <View key={amenity} style={styles.amenityChip}>
                <CheckCircle size={14} color={colors.success} />
                <Text variant="caption">{amenity}</Text>
              </View>
            ))}
          </HStack>
        </VStack>

        {/* Date Selection */}
        <VStack gap={spacing.sm} style={styles.section}>
          <HStack style={styles.dateHeader}>
            <Text variant="bodyLg" style={{ fontWeight: '600' }}>Select Date</Text>
            <HStack gap={spacing.md}>
              <Pressable onPress={prevWeek}>
                <ChevronLeft size={20} color={colors.foreground} />
              </Pressable>
              <Pressable onPress={nextWeek}>
                <ChevronRight size={20} color={colors.foreground} />
              </Pressable>
            </HStack>
          </HStack>

          <HStack style={styles.weekRow}>
            {weekDates.map((date) => {
              const isSelected = date.toDateString() === selectedDate.toDateString();
              const isPast = date < today;
              const isToday = date.toDateString() === today.toDateString();
              
              return (
                <Pressable
                  key={date.toISOString()}
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                    isPast && styles.dayCellPast,
                  ]}
                  onPress={() => !isPast && setSelectedDate(date)}
                  disabled={isPast}
                >
                  <Text
                    variant="caption"
                    style={{ color: isSelected ? colors.background : isPast ? colors.textSecondary : colors.foreground }}
                  >
                    {DAYS[date.getDay()]}
                  </Text>
                  <Text
                    variant="body"
                    style={{
                      color: isSelected ? colors.background : isPast ? colors.textSecondary : colors.foreground,
                      fontWeight: isSelected ? '700' : '500',
                    }}
                  >
                    {date.getDate()}
                  </Text>
                  {isToday && <View style={[styles.todayDot, isSelected && styles.todayDotSelected]} />}
                </Pressable>
              );
            })}
          </HStack>
        </VStack>

        {/* Time Slots */}
        <VStack gap={spacing.sm} style={styles.section}>
          <Text variant="bodyLg" style={{ fontWeight: '600' }}>Select Time Slot</Text>
          <View style={styles.slotsGrid}>
            {TIME_SLOTS.map((slot) => {
              const isBooked = slot.status === 'booked';
              const isSelected = selectedSlots.includes(slot.id);
              
              return (
                <Pressable
                  key={slot.id}
                  style={[
                    styles.slotCell,
                    isBooked && styles.slotCellBooked,
                    isSelected && styles.slotCellSelected,
                  ]}
                  onPress={() => !isBooked && toggleSlot(slot.id)}
                  disabled={isBooked}
                >
                  <Text
                    variant="caption"
                    style={{
                      color: isBooked
                        ? colors.textSecondary
                        : isSelected
                        ? colors.background
                        : colors.foreground,
                      fontWeight: isSelected ? '600' : '400',
                    }}
                  >
                    {slot.time}
                  </Text>
                  {isBooked && (
                    <Text variant="caption" style={{ color: colors.danger }}>Booked</Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </VStack>

        {/* Rules */}
        <VStack gap={spacing.sm} style={styles.section}>
          <Text variant="bodyLg" style={{ fontWeight: '600' }}>Rules & Guidelines</Text>
          <Card style={styles.rulesCard}>
            {AMENITY_DATA.rules.map((rule, i) => (
              <HStack key={i} gap={spacing.sm} style={styles.ruleItem}>
                <AlertCircle size={16} color={colors.warning} />
                <Text variant="caption" tone="secondary" style={{ flex: 1 }}>{rule}</Text>
              </HStack>
            ))}
          </Card>
        </VStack>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Footer */}
      {selectedSlots.length > 0 && (
        <View style={styles.footer}>
          <HStack style={styles.footerContent}>
            <VStack>
              <Text variant="caption" tone="secondary">
                {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} selected
              </Text>
              <Text variant="h3" style={{ color: colors.brand[600], fontWeight: '700' }}>
                ₹{totalPrice}
              </Text>
            </VStack>
            <Button label={booking ? 'Booking…' : 'Book Now'} onPress={handleBook} disabled={booking} loading={booking} />
          </HStack>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { flex: 1, textAlign: 'center' },
  scroll: { flex: 1 },
  heroSection: {
    padding: spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroEmoji: { fontSize: 40 },
  heroDescription: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  statsRow: {
    justifyContent: 'center',
    width: '100%',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  amenitiesList: {
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  dateHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weekRow: {
    justifyContent: 'space-between',
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    marginHorizontal: 2,
    backgroundColor: colors.surfaceMuted,
  },
  dayCellSelected: {
    backgroundColor: colors.brand[600],
  },
  dayCellPast: {
    opacity: 0.5,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.brand[600],
    marginTop: 4,
  },
  todayDotSelected: {
    backgroundColor: colors.background,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  slotCell: {
    width: '48%',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  slotCellBooked: {
    backgroundColor: '#FEE2E2',
    borderColor: colors.danger,
  },
  slotCellSelected: {
    backgroundColor: colors.brand[600],
    borderColor: colors.brand[600],
  },
  rulesCard: {
    padding: spacing.md,
    backgroundColor: '#FEF9E7',
  },
  ruleItem: {
    paddingVertical: spacing.xs,
  },
  bottomPadding: { height: 120 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerContent: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
