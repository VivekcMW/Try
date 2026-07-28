import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Search,
  Plus,
  Filter,
  ChevronRight,
  Clock,
  MapPin,
  Package,
  Wrench,
  Laptop,
  Tent,
  Gamepad2,
  Baby,
  Dumbbell,
  BookOpen,
  Camera,
  Utensils,
  CheckCircle,
  XCircle,
  ArrowRightLeft,
  HandCoins,
  Star,
} from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type ApiBorrowItem = {
  id: string;
  ownerId: string;
  name: string;
  category: string;
  description: string;
  condition: 'excellent' | 'good' | 'fair';
  rentalType: 'free' | 'deposit' | 'rent';
  depositAmountPaise: number | null;
  rentPerDayPaise: number | null;
  maxDays: number;
  available: boolean;
  rating: number;
  borrowCount: number;
  owner: { id: string; name: string };
  requests: { requester: { id: string; name: string } }[];
};

type ApiBorrowRequest = {
  id: string;
  status: 'pending' | 'approved' | 'declined';
  duration: string;
  item: { id: string; name: string };
  requester: { id: string; name: string };
};

type ItemCategory = {
  id: string;
  name: string;
  icon: typeof Package;
  color: string;
};

const CATEGORIES: ItemCategory[] = [
  { id: 'tools', name: 'Tools', icon: Wrench, color: '#F59E0B' },
  { id: 'electronics', name: 'Electronics', icon: Laptop, color: '#3B82F6' },
  { id: 'outdoor', name: 'Outdoor', icon: Tent, color: '#10B981' },
  { id: 'games', name: 'Games', icon: Gamepad2, color: '#8B5CF6' },
  { id: 'baby', name: 'Baby & Kids', icon: Baby, color: '#EC4899' },
  { id: 'sports', name: 'Sports', icon: Dumbbell, color: '#EF4444' },
  { id: 'books', name: 'Books', icon: BookOpen, color: '#6366F1' },
  { id: 'camera', name: 'Camera', icon: Camera, color: '#14B8A6' },
  { id: 'kitchen', name: 'Kitchen', icon: Utensils, color: '#F472B6' },
  { id: 'other', name: 'Other', icon: Package, color: '#6B7280' },
];

/* ════════════════════════════════════════════════════════════════════════ */

const CONDITION_CONFIG = {
  excellent: { color: colors.success, label: 'Excellent' },
  good: { color: colors.brand[600], label: 'Good' },
  fair: { color: colors.warning, label: 'Fair' },
};

const STATUS_CONFIG = {
  available: { color: colors.success, bg: '#D1FAE5', label: 'Available' },
  borrowed: { color: colors.warning, bg: '#FEF3C7', label: 'Borrowed' },
};

function CategoryCard({ category, selected, onPress }: { category: ItemCategory; selected: boolean; onPress: () => void }) {
  const Icon = category.icon;

  return (
    <Pressable
      style={[styles.categoryChip, selected && { backgroundColor: category.color, borderColor: category.color }]}
      onPress={onPress}
    >
      <Icon size={16} color={selected ? colors.background : category.color} />
      <Text
        variant="caption"
        style={{
          color: selected ? colors.background : colors.foreground,
          fontWeight: selected ? '600' : '400',
        }}
      >
        {category.name}
      </Text>
    </Pressable>
  );
}

function ItemCard({ item, onPress }: { item: ApiBorrowItem; onPress: () => void }) {
  const condition = CONDITION_CONFIG[item.condition];
  const categoryInfo = CATEGORIES.find(c => c.id === item.category);
  const Icon = categoryInfo?.icon || Package;

  return (
    <Pressable onPress={onPress}>
      <Card style={[styles.itemCard, !item.available && styles.itemCardUnavailable]}>
        <HStack gap={spacing.md}>
          <View style={[styles.itemIcon, { backgroundColor: `${categoryInfo?.color || colors.brand[600]}20` }]}>
            <Icon size={28} color={categoryInfo?.color || colors.brand[600]} />
          </View>
          <VStack style={{ flex: 1 }}>
            <HStack style={styles.itemHeader}>
              <Text variant="body" style={{ fontWeight: '600' }}>{item.name}</Text>
              {!item.available && (
                <View style={styles.unavailableBadge}>
                  <Text variant="caption" style={{ color: colors.danger }}>Unavailable</Text>
                </View>
              )}
            </HStack>
            <Text variant="caption" tone="secondary">{item.owner.name}</Text>
            <Text variant="caption" tone="secondary" numberOfLines={1} style={{ marginTop: 2 }}>
              {item.description}
            </Text>

            <HStack gap={spacing.md} style={styles.itemMeta}>
              <HStack gap={spacing.xs}>
                <Star size={12} color={colors.warning} fill={colors.warning} />
                <Text variant="caption" style={{ fontWeight: '500' }}>{item.rating}</Text>
              </HStack>
              <Text variant="caption" tone="secondary">Borrowed {item.borrowCount}x</Text>
              <View style={[styles.conditionDot, { backgroundColor: condition.color }]} />
              <Text variant="caption" style={{ color: condition.color }}>{condition.label}</Text>
            </HStack>
          </VStack>
          <ChevronRight size={20} color={colors.textSecondary} />
        </HStack>

        <View style={styles.divider} />

        <HStack style={styles.itemFooter}>
          {item.rentalType === 'free' ? (
            <HStack gap={spacing.xs}>
              <HandCoins size={14} color={colors.success} />
              <Text variant="body" style={{ color: colors.success, fontWeight: '600' }}>Free to borrow</Text>
            </HStack>
          ) : item.rentalType === 'deposit' ? (
            <Text variant="body">
              <Text style={{ color: colors.brand[600], fontWeight: '600' }}>₹{Math.round((item.depositAmountPaise ?? 0) / 100)}</Text>
              <Text tone="secondary"> refundable deposit</Text>
            </Text>
          ) : (
            <Text variant="body">
              <Text style={{ color: colors.brand[600], fontWeight: '600' }}>₹{Math.round((item.rentPerDayPaise ?? 0) / 100)}/day</Text>
              <Text tone="secondary"> + ₹{Math.round((item.depositAmountPaise ?? 0) / 100)} deposit</Text>
            </Text>
          )}
          <Text variant="caption" tone="secondary">Max {item.maxDays} days</Text>
        </HStack>
      </Card>
    </Pressable>
  );
}

export default function BorrowIndexScreen() {
  const router = useRouter();
  const pinCode = useOnboardingStore((s) => s.pin);
  const userId = useWalletStore((s) => s.userId);
  const [activeTab, setActiveTab] = useState<'browse' | 'my'>('browse');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ApiBorrowItem[]>([]);
  const [myItems, setMyItems] = useState<ApiBorrowItem[]>([]);
  const [requests, setRequests] = useState<ApiBorrowRequest[]>([]);

  const loadBrowse = useCallback(async () => {
    if (!pinCode) return;
    try {
      const res = await fetch(`${BASE}/api/mobile/borrow/items?pinCode=${pinCode}`);
      const data = await res.json();
      setItems(res.ok ? data.items : []);
    } catch {
      setItems([]);
    }
  }, [pinCode]);

  const loadMine = useCallback(async () => {
    if (!userId) return;
    try {
      const [itemsRes, requestsRes] = await Promise.all([
        fetch(`${BASE}/api/mobile/borrow/items?ownerId=${userId}`),
        fetch(`${BASE}/api/mobile/borrow/requests?ownerId=${userId}`),
      ]);
      const itemsData = await itemsRes.json();
      const requestsData = await requestsRes.json();
      setMyItems(itemsRes.ok ? itemsData.items : []);
      setRequests(requestsRes.ok ? requestsData.requests : []);
    } catch {
      setMyItems([]);
      setRequests([]);
    }
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadBrowse(), loadMine()]).finally(() => setLoading(false));
  }, [loadBrowse, loadMine]);

  const handleApprove = async (id: string) => {
    try {
      await fetch(`${BASE}/api/mobile/borrow/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
    } finally {
      loadMine();
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await fetch(`${BASE}/api/mobile/borrow/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'declined' }),
      });
    } finally {
      loadMine();
    }
  };

  const filteredItems = items.filter((item) => {
    if (selectedCategory && item.category !== selectedCategory) return false;
    if (showAvailableOnly && !item.available) return false;
    return true;
  });

  const borrowedCount = myItems.filter((i) => !i.available).length;

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
          <Text variant="h3" style={{ fontWeight: '700' }}>Borrow & Lend</Text>
          <Text variant="caption" tone="secondary">Share resources with neighbors</Text>
        </VStack>
        <Pressable onPress={() => router.push('/(borrow)/add')}>
          <Plus size={24} color={colors.brand[600]} />
        </Pressable>
      </HStack>

      {/* Tabs */}
      <HStack style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === 'browse' && styles.tabActive]}
          onPress={() => setActiveTab('browse')}
        >
          <Text
            variant="body"
            style={{
              color: activeTab === 'browse' ? colors.brand[600] : colors.textSecondary,
              fontWeight: activeTab === 'browse' ? '600' : '400',
            }}
          >
            Browse Items
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
            My Listings
          </Text>
          {borrowedCount > 0 && (
            <View style={styles.tabBadge}>
              <Text variant="caption" style={{ color: colors.background, fontWeight: '700' }}>
                {borrowedCount}
              </Text>
            </View>
          )}
        </Pressable>
      </HStack>

      {activeTab === 'browse' ? (
        <>
          {/* Filter Row */}
          <HStack style={styles.filterRow}>
            <Pressable
              style={[styles.filterChip, showAvailableOnly && styles.filterChipActive]}
              onPress={() => setShowAvailableOnly(!showAvailableOnly)}
            >
              <CheckCircle size={14} color={showAvailableOnly ? colors.background : colors.success} />
              <Text
                variant="caption"
                style={{
                  color: showAvailableOnly ? colors.background : colors.foreground,
                  fontWeight: showAvailableOnly ? '600' : '400',
                }}
              >
                Available Only
              </Text>
            </Pressable>
          </HStack>

          {/* Categories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesRow}
          >
            {CATEGORIES.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                selected={selectedCategory === cat.id}
                onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              />
            ))}
          </ScrollView>

          {/* Items List */}
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <VStack gap={spacing.md} style={styles.section}>
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onPress={() => router.push(`/(borrow)/${item.id}`)}
                />
              ))}

              {filteredItems.length === 0 && (
                <Card style={styles.emptyCard}>
                  <Package size={48} color={colors.textSecondary} />
                  <Text variant="bodyLg" style={[styles.emptyText, { fontWeight: '500' }]}>
                    No items found
                  </Text>
                  <Text variant="body" tone="secondary">
                    Try adjusting your filters
                  </Text>
                </Card>
              )}
            </VStack>
            <View style={styles.bottomPadding} />
          </ScrollView>
        </>
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <VStack gap={spacing.md} style={styles.section}>
            {/* My Listings */}
            <Text variant="bodyLg" style={{ fontWeight: '600' }}>Your Items</Text>
            {myItems.map((listing) => {
              const status = STATUS_CONFIG[listing.available ? 'available' : 'borrowed'];
              const borrower = listing.requests[0]?.requester.name;
              return (
                <Card key={listing.id} style={styles.listingCard}>
                  <HStack gap={spacing.md}>
                    <VStack style={{ flex: 1 }}>
                      <HStack gap={spacing.sm}>
                        <Text variant="body" style={{ fontWeight: '600' }}>{listing.name}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                          <Text variant="caption" style={{ color: status.color }}>{status.label}</Text>
                        </View>
                      </HStack>
                      {borrower && (
                        <Text variant="caption" tone="secondary">
                          Borrowed by {borrower} • Max {listing.maxDays} days
                        </Text>
                      )}
                    </VStack>
                    <ChevronRight size={20} color={colors.textSecondary} />
                  </HStack>
                </Card>
              );
            })}

            {myItems.length === 0 && (
              <Text variant="caption" tone="secondary">You haven&apos;t listed any items yet.</Text>
            )}

            {/* Requests Section */}
            {requests.length > 0 && (
              <>
                <Text variant="bodyLg" style={{ marginTop: spacing.md, fontWeight: '600' }}>
                  Borrow Requests
                </Text>
                {requests.map((request) => (
                  <Card key={request.id} style={styles.requestCard}>
                    <VStack gap={spacing.sm}>
                      <HStack>
                        <VStack style={{ flex: 1 }}>
                          <Text variant="body" style={{ fontWeight: '600' }}>{request.item.name}</Text>
                          <Text variant="caption" tone="secondary">
                            {request.requester.name} • {request.duration}
                          </Text>
                        </VStack>
                        {request.status === 'pending' ? (
                          <HStack gap={spacing.sm}>
                            <Pressable style={styles.declineButton} onPress={() => handleDecline(request.id)}>
                              <XCircle size={20} color={colors.danger} />
                            </Pressable>
                            <Pressable style={styles.approveButton} onPress={() => handleApprove(request.id)}>
                              <CheckCircle size={20} color={colors.success} />
                            </Pressable>
                          </HStack>
                        ) : (
                          <View style={[styles.statusBadge, { backgroundColor: request.status === 'approved' ? '#D1FAE5' : '#FEE2E2' }]}>
                            <Text variant="caption" style={{ color: request.status === 'approved' ? colors.success : colors.danger }}>
                              {request.status === 'approved' ? 'Approved' : 'Declined'}
                            </Text>
                          </View>
                        )}
                      </HStack>
                    </VStack>
                  </Card>
                ))}
              </>
            )}

            <Button
              label="List New Item"
              variant="secondary"
              onPress={() => router.push('/(borrow)/add')}
              style={{ marginTop: spacing.md }}
            />
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
    backgroundColor: colors.warning,
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  filterRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  filterChip: {
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
  filterChipActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  categoriesScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  categoriesRow: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
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
  scroll: { flex: 1 },
  section: {
    padding: spacing.lg,
  },
  itemCard: {
    padding: spacing.md,
  },
  itemCardUnavailable: {
    opacity: 0.7,
  },
  itemIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemHeader: {
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  unavailableBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  itemMeta: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  conditionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  itemFooter: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listingCard: {
    padding: spacing.md,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  requestCard: {
    padding: spacing.md,
  },
  declineButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    padding: spacing[6],
    alignItems: 'center',
  },
  emptyText: { marginTop: spacing.md },
  bottomPadding: { height: 100 },
});
