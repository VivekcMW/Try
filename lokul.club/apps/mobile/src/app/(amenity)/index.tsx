import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  ChevronRight,
  Star,
  MapPin,
  Filter,
  CalendarDays,
  CheckCircle,
  XCircle,
  Dumbbell,
  Waves,
  Home,
  Gamepad2,
  PartyPopper,
  Trees,
  Utensils,
  BookOpen,
} from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack, Badge } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { AMENITIES, AMENITY_CATEGORIES as CATEGORIES, type Amenity } from '@/data/amenity-seed';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

/* ════════════════════════════════════════════════════════════════════════
   AMENITY CATALOG lives in src/data/amenity-seed.ts (shared with [id].tsx).
   MY BOOKINGS are real backend data.
   ═══════════════════════════════════════════════════════════════════════ */

export type MyBooking = {
  id: string;
  amenityId: string;
  amenityName: string;
  amenityIcon: string;
  dateLabel: string;
  dateISO: string;
  timeSlot: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  bookingRef: string;
  totalPricePaise: number;
};

/* ════════════════════════════════════════════════════════════════════════ */

const AVAILABILITY_CONFIG = {
  available: { color: colors.success, label: 'Available', bg: '#D1FAE5' },
  limited: { color: colors.warning, label: 'Limited Slots', bg: '#FEF3C7' },
  unavailable: { color: colors.danger, label: 'Unavailable', bg: '#FEE2E2' },
};

function AmenityCard({ amenity, onPress }: { amenity: Amenity; onPress: () => void }) {
  const availability = AVAILABILITY_CONFIG[amenity.availability];

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.amenityCard}>
        <HStack style={styles.amenityHeader}>
          <View style={styles.amenityIcon}>
            <Text style={styles.amenityEmoji}>{amenity.icon}</Text>
          </View>
          <VStack style={{ flex: 1 }}>
            <HStack style={styles.nameRow}>
              <Text variant="bodyLg" style={{ fontWeight: '600' }}>{amenity.name}</Text>
              <View style={[styles.availabilityBadge, { backgroundColor: availability.bg }]}>
                <Text variant="caption" style={{ color: availability.color }}>{availability.label}</Text>
              </View>
            </HStack>
            <Text variant="caption" tone="secondary" numberOfLines={1}>{amenity.description}</Text>
            <HStack gap={spacing.md} style={styles.metaRow}>
              <HStack gap={spacing.xs}>
                <Star size={12} color={colors.warning} fill={colors.warning} />
                <Text variant="caption" style={{ fontWeight: '500' }}>{amenity.rating}</Text>
              </HStack>
              <HStack gap={spacing.xs}>
                <Users size={12} color={colors.textSecondary} />
                <Text variant="caption" tone="secondary">{amenity.capacity} max</Text>
              </HStack>
              <HStack gap={spacing.xs}>
                <Clock size={12} color={colors.textSecondary} />
                <Text variant="caption" tone="secondary">{amenity.openTime} - {amenity.closeTime}</Text>
              </HStack>
            </HStack>
          </VStack>
          <ChevronRight size={20} color={colors.textSecondary} />
        </HStack>
        
        {amenity.pricePerHour > 0 && (
          <View style={styles.priceTag}>
            <Text variant="caption" style={{ color: colors.brand[600], fontWeight: '600' }}>
              ₹{amenity.pricePerHour}/hr
            </Text>
          </View>
        )}
      </Card>
    </Pressable>
  );
}

function BookingCard({ booking, onPress }: { booking: MyBooking; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.bookingCard}>
        <HStack gap={spacing.md}>
          <View style={styles.bookingIcon}>
            <Text style={styles.bookingEmoji}>{booking.amenityIcon}</Text>
          </View>
          <VStack style={{ flex: 1 }}>
            <Text variant="body" style={{ fontWeight: '600' }}>{booking.amenityName}</Text>
            <Text variant="caption" tone="secondary">{booking.dateLabel} • {booking.timeSlot}</Text>
            <Text variant="caption" style={{ color: colors.brand[600] }}>{booking.bookingRef}</Text>
          </VStack>
          {booking.status === 'upcoming' && (
            <View style={styles.upcomingBadge}>
              <Text variant="caption" style={{ color: colors.success, fontWeight: '600' }}>Upcoming</Text>
            </View>
          )}
        </HStack>
      </Card>
    </Pressable>
  );
}

export default function AmenityIndexScreen() {
  const router = useRouter();
  const userId = useWalletStore((s) => s.userId);
  const [activeTab, setActiveTab] = useState<'book' | 'my'>('book');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [MY_BOOKINGS, setMyBookings] = useState<MyBooking[]>([]);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/amenity/bookings?ownerId=${userId}`);
      const data = await res.json();
      setMyBookings(res.ok ? data.bookings : []);
    } catch {
      setMyBookings([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const filteredAmenities = AMENITIES.filter((a) =>
    selectedCategory === 'all' || a.category.toLowerCase() === selectedCategory
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <HStack style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <VStack style={styles.headerTitle}>
          <Text variant="h3" style={{ fontWeight: '700' }}>Amenity Booking</Text>
          <Text variant="caption" tone="secondary">Book clubhouse, gym, pool & more</Text>
        </VStack>
        <Pressable onPress={() => router.push('/(amenity)/calendar')}>
          <CalendarDays size={20} color={colors.foreground} />
        </Pressable>
      </HStack>

      {/* Tabs */}
      <HStack style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === 'book' && styles.tabActive]}
          onPress={() => setActiveTab('book')}
        >
          <Text
            variant="body"
            style={{
              color: activeTab === 'book' ? colors.brand[600] : colors.textSecondary,
              fontWeight: activeTab === 'book' ? '600' : '400',
            }}
          >
            Book Amenity
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'my' && styles.tabActive]}
          onPress={() => setActiveTab('my')}
        >
          <Text
            variant="body"
            style={{
              color: activeTab === 'my' ? colors.brand[600] : colors.textSecondary,
              fontWeight: activeTab === 'my' ? '600' : '400',
            }}
          >
            My Bookings
          </Text>
          {MY_BOOKINGS.filter(b => b.status === 'upcoming').length > 0 && (
            <View style={styles.tabBadge}>
              <Text variant="caption" style={{ color: colors.background, fontWeight: '700' }}>
                {MY_BOOKINGS.filter(b => b.status === 'upcoming').length}
              </Text>
            </View>
          )}
        </Pressable>
      </HStack>

      {activeTab === 'book' ? (
        <>
          {/* Category Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryRowScroll}
            contentContainerStyle={styles.categoryRow}
          >
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.id && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                <Text
                  variant="caption"
                  style={{
                    color: selectedCategory === cat.id ? colors.background : colors.foreground,
                    fontWeight: selectedCategory === cat.id ? '600' : '400',
                  }}
                >
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Amenity List */}
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <VStack gap={spacing.md} style={styles.section}>
              {filteredAmenities.map((amenity) => (
                <AmenityCard
                  key={amenity.id}
                  amenity={amenity}
                  onPress={() => router.push(`/(amenity)/${amenity.id}`)}
                />
              ))}
            </VStack>
            <View style={styles.bottomPadding} />
          </ScrollView>
        </>
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <VStack gap={spacing.md} style={styles.section}>
            {MY_BOOKINGS.filter(b => b.status === 'upcoming').length > 0 && (
              <>
                <Text variant="bodyLg" style={{ fontWeight: '600' }}>Upcoming Bookings</Text>
                {MY_BOOKINGS.filter(b => b.status === 'upcoming').map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onPress={() => router.push(`/(amenity)/booking/${booking.id}`)}
                  />
                ))}
              </>
            )}

            {MY_BOOKINGS.filter(b => b.status === 'completed').length > 0 && (
              <>
                <Text variant="bodyLg" style={{ marginTop: spacing.md, fontWeight: '600' }}>
                  Past Bookings
                </Text>
                {MY_BOOKINGS.filter(b => b.status === 'completed').map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onPress={() => router.push(`/(amenity)/booking/${booking.id}`)}
                  />
                ))}
              </>
            )}

            {MY_BOOKINGS.length === 0 && (
              <Card style={styles.emptyCard}>
                <Calendar size={48} color={colors.textSecondary} />
                <Text variant="bodyLg" style={[styles.emptyText, { fontWeight: '500' }]}>
                  No bookings yet
                </Text>
                <Text variant="body" tone="secondary" style={styles.emptySubtext}>
                  Book an amenity to get started
                </Text>
                <Button
                  label="Browse Amenities"
                  onPress={() => setActiveTab('book')}
                  style={styles.emptyButton}
                />
              </Card>
            )}
          </VStack>
          <View style={styles.bottomPadding} />
        </ScrollView>
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
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { flex: 1 },
  tabs: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.brand[600],
  },
  tabBadge: {
    backgroundColor: colors.danger,
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryRowScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  categoryRow: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.brand[600],
    borderColor: colors.brand[600],
  },
  categoryEmoji: { fontSize: 16 },
  scroll: { flex: 1 },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  amenityCard: {
    padding: spacing.md,
    position: 'relative',
  },
  amenityHeader: {
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  amenityIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenityEmoji: { fontSize: 28 },
  nameRow: {
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  availabilityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  metaRow: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  priceTag: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.brand[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  bookingCard: { padding: spacing.md },
  bookingIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingEmoji: { fontSize: 24 },
  upcomingBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  emptyCard: {
    padding: spacing[6],
    alignItems: 'center',
  },
  emptyText: { marginTop: spacing.md },
  emptySubtext: { textAlign: 'center', marginTop: spacing.xs },
  emptyButton: { marginTop: spacing.md },
  bottomPadding: { height: 100 },
});
