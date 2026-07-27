import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Package,
  Clock,
  MapPin,
  Star,
  ShoppingBag,
  Utensils,
  Pill,
  Milk,
  Cake,
  Beef,
  Fish,
  Leaf,
  ChevronRight,
  Bike,
  Timer,
  BadgePercent,
  Search,
  Filter,
  Heart,
} from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { STORES, QUICK_ITEMS, type Store, type QuickItem } from '@/data/delivery-catalog';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export type Order = {
  id: string;
  storeId: string | null;
  storeName: string;
  items: string;
  totalPaise: number;
  status: 'preparing' | 'picked' | 'delivering' | 'delivered' | 'cancelled';
  estimatedTime: string | null;
  deliveryPartner: string | null;
  createdAt: string;
};

/* ════════════════════════════════════════════════════════════════════════
   CATEGORY METADATA (UI-only — not persisted, holds icon components)
   ═══════════════════════════════════════════════════════════════════════ */

type StoreCategory = {
  id: string;
  name: string;
  icon: typeof ShoppingBag;
  color: string;
};

const CATEGORIES: StoreCategory[] = [
  { id: 'grocery', name: 'Grocery', icon: ShoppingBag, color: '#22C55E' },
  { id: 'food', name: 'Food', icon: Utensils, color: '#EF4444' },
  { id: 'pharmacy', name: 'Pharmacy', icon: Pill, color: '#3B82F6' },
  { id: 'dairy', name: 'Dairy', icon: Milk, color: '#F59E0B' },
  { id: 'bakery', name: 'Bakery', icon: Cake, color: '#EC4899' },
  { id: 'meat', name: 'Meat & Fish', icon: Beef, color: '#8B5CF6' },
  { id: 'vegetables', name: 'Vegetables', icon: Leaf, color: '#10B981' },
];

const STATUS_CONFIG = {
  preparing: { label: 'Preparing', color: colors.warning, icon: Timer },
  picked: { label: 'Picked Up', color: colors.info, icon: Package },
  delivering: { label: 'On the way', color: colors.brand[600], icon: Bike },
  delivered: { label: 'Delivered', color: colors.success, icon: Package },
  cancelled: { label: 'Cancelled', color: colors.danger, icon: Package },
};

type SortKey = 'distance' | 'rating' | 'price';
const SORT_CYCLE: SortKey[] = ['distance', 'rating', 'price'];
const SORT_LABEL: Record<SortKey, string> = {
  distance: 'Distance',
  rating: 'Rating',
  price: 'Price',
};

/* ════════════════════════════════════════════════════════════════════════ */

function ActiveOrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const status = STATUS_CONFIG[order.status];
  const StatusIcon = status.icon;

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.activeOrderCard}>
        <HStack gap="md">
          <View style={[styles.statusIcon, { backgroundColor: `${status.color}20` }]}>
            <StatusIcon size={20} color={status.color} />
          </View>
          <VStack style={{ flex: 1 }}>
            <HStack style={{ justifyContent: 'space-between' }}>
              <Text variant="body" style={{ fontWeight: '600' }}>{order.storeName}</Text>
              <View style={[styles.statusBadge, { backgroundColor: `${status.color}20` }]}>
                <Text variant="caption" style={{ fontWeight: '500', color: status.color }}>
                  {status.label}
                </Text>
              </View>
            </HStack>
            <Text variant="caption" tone="secondary">{order.items}</Text>
            {order.estimatedTime && (
              <HStack gap="xs" style={{ marginTop: spacing.xs }}>
                <Clock size={12} color={colors.brand[600]} />
                <Text variant="caption" style={{ fontWeight: '500', color: colors.brand[600] }}>
                  Arriving in {order.estimatedTime}
                </Text>
              </HStack>
            )}
          </VStack>
          <ChevronRight size={20} color={colors.textSecondary} />
        </HStack>
      </Card>
    </Pressable>
  );
}

function StoreCard({ store, onPress }: { store: Store; onPress: () => void }) {
  const category = CATEGORIES.find(c => c.id === store.category);

  return (
    <Pressable onPress={onPress}>
      <Card style={store.featured ? { ...styles.storeCard, ...styles.storeCardFeatured } : styles.storeCard}>
        {store.offers && (
          <View style={styles.offerBanner}>
            <BadgePercent size={12} color={colors.background} />
            <Text variant="caption" style={{ fontWeight: '500', color: colors.background }}>
              {store.offers}
            </Text>
          </View>
        )}

        <HStack gap="md">
          <View style={[styles.storeIcon, { backgroundColor: `${category?.color || colors.brand[600]}20` }]}>
            {category?.icon && <category.icon size={24} color={category.color} />}
          </View>
          <VStack style={{ flex: 1 }}>
            <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <VStack>
                <HStack gap="sm" style={{ alignItems: 'center' }}>
                  <Text variant="body" style={{ fontWeight: '600' }}>{store.name}</Text>
                  {store.isNeighborhood && (
                    <View style={styles.neighborBadge}>
                      <Text variant="caption" style={{ color: colors.success, fontSize: 10 }}>Local</Text>
                    </View>
                  )}
                </HStack>
                <Text variant="caption" tone="secondary">{category?.name}</Text>
              </VStack>
              {!store.isOpen && (
                <View style={styles.closedBadge}>
                  <Text variant="caption" style={{ color: colors.danger }}>Closed</Text>
                </View>
              )}
            </HStack>

            <HStack gap="md" style={{ marginTop: spacing.sm }}>
              <HStack gap="xs">
                <Star size={12} color={colors.warning} fill={colors.warning} />
                <Text variant="caption">{store.rating} ({store.reviews})</Text>
              </HStack>
              <HStack gap="xs">
                <MapPin size={12} color={colors.textSecondary} />
                <Text variant="caption" tone="secondary">{store.distance}</Text>
              </HStack>
              <HStack gap="xs">
                <Clock size={12} color={colors.textSecondary} />
                <Text variant="caption" tone="secondary">{store.deliveryTime}</Text>
              </HStack>
            </HStack>

            <HStack gap="md" style={{ marginTop: spacing.xs }}>
              <Text variant="caption" tone="secondary">
                {store.deliveryFeePaise === 0 ? 'Free delivery' : `₹${Math.round(store.deliveryFeePaise / 100)} delivery`}
              </Text>
              {store.minOrderPaise > 0 && (
                <Text variant="caption" tone="secondary">
                  Min: ₹{Math.round(store.minOrderPaise / 100)}
                </Text>
              )}
            </HStack>
          </VStack>
        </HStack>
      </Card>
    </Pressable>
  );
}

function QuickItemCard({ item, onPress }: { item: QuickItem; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.quickItemCard}>
        <View style={styles.quickItemImage}>
          <Text style={{ fontSize: 32 }}>{item.image}</Text>
        </View>
        <VStack style={{ flex: 1 }}>
          <Text variant="body" style={{ fontWeight: '500' }} numberOfLines={1}>{item.name}</Text>
          <Text variant="caption" tone="secondary" numberOfLines={1}>{item.store}</Text>
          <HStack gap="xs" style={{ marginTop: spacing.xs }}>
            <Text variant="body" style={{ fontWeight: '600', color: colors.brand[600] }}>₹{Math.round(item.pricePaise / 100)}</Text>
            {item.originalPricePaise && (
              <Text variant="caption" style={{ textDecorationLine: 'line-through', color: colors.textSecondary }}>
                ₹{Math.round(item.originalPricePaise / 100)}
              </Text>
            )}
          </HStack>
          <HStack gap="xs">
            <Clock size={10} color={colors.success} />
            <Text variant="caption" style={{ color: colors.success }}>{item.deliveryTime}</Text>
          </HStack>
        </VStack>
        <Button label="Add" size="sm" variant="secondary" onPress={onPress} />
      </Card>
    </Pressable>
  );
}

export default function DeliveryScreen() {
  const router = useRouter();
  const userId = useWalletStore((s) => s.userId);
  const stores = STORES;
  const quickItems = QUICK_ITEMS;
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  const [activeTab, setActiveTab] = useState<'all' | 'orders'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>('distance');

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/delivery/orders?ownerId=${userId}`);
      const data = await res.json();
      setOrders(res.ok ? data.orders : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const cycleSortBy = () => {
    const idx = SORT_CYCLE.indexOf(sortBy);
    setSortBy(SORT_CYCLE[(idx + 1) % SORT_CYCLE.length]);
  };

  const filteredStores = useMemo(() => {
    const base = stores.filter(s => !selectedCategory || s.category === selectedCategory);
    const sorted = [...base];
    if (sortBy === 'distance') {
      sorted.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    } else if (sortBy === 'rating') {
      sorted.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'price') {
      sorted.sort((a, b) => a.minOrderPaise - b.minOrderPaise);
    }
    return sorted;
  }, [stores, selectedCategory, sortBy]);

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));

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
          <Text variant="h3" style={{ fontWeight: '700' }}>Delivery</Text>
          <Text variant="caption" tone="secondary">Hyperlocal stores near you</Text>
        </VStack>
        <HStack gap="md">
          <Pressable onPress={() => router.push('/(delivery)/search')}>
            <Search size={22} color={colors.foreground} />
          </Pressable>
        </HStack>
      </HStack>

      {/* Tabs */}
      <HStack style={styles.tabs}>
        {(['all', 'orders'] as const).map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              variant="body"
              style={{
                fontWeight: activeTab === tab ? '600' : '400',
                color: activeTab === tab ? colors.brand[600] : colors.textSecondary,
              }}
            >
              {tab === 'all' ? 'Browse Stores' : 'My Orders'}
            </Text>
          </Pressable>
        ))}
      </HStack>

      {activeTab === 'all' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <Pressable
                key={cat.id}
                style={[styles.categoryChip, isSelected && { backgroundColor: cat.color, borderColor: cat.color }]}
                onPress={() => setSelectedCategory(isSelected ? null : cat.id)}
              >
                <Icon size={16} color={isSelected ? colors.background : cat.color} />
                <Text
                  variant="caption"
                  style={{
                    fontWeight: isSelected ? '600' : '400',
                    color: isSelected ? colors.background : colors.foreground,
                  }}
                >
                  {cat.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeTab === 'all' && (
          <>
            {/* Active Orders Banner */}
            {activeOrders.length > 0 && (
              <VStack gap="sm" style={styles.section}>
                <Text variant="bodyLg" style={{ fontWeight: '600' }}>Active Orders</Text>
                {activeOrders.map(order => (
                  <ActiveOrderCard
                    key={order.id}
                    order={order}
                    onPress={() => router.push(`/(delivery)/order/${order.id}`)}
                  />
                ))}
              </VStack>
            )}

            {/* Quick Items */}
            <VStack style={styles.section}>
              <HStack style={styles.sectionHeader}>
                <Text variant="bodyLg" style={{ fontWeight: '600' }}>Quick Add</Text>
                <Text variant="caption" style={{ color: colors.brand[600] }}>View All</Text>
              </HStack>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickItemsRow}
              >
                {quickItems.map(item => (
                  <QuickItemCard
                    key={item.id}
                    item={item}
                    onPress={() => router.push(`/(delivery)/item/${item.id}`)}
                  />
                ))}
              </ScrollView>
            </VStack>

            {/* Stores */}
            <VStack gap="md" style={styles.section}>
              <HStack style={styles.sectionHeader}>
                <Text variant="bodyLg" style={{ fontWeight: '600' }}>
                  {selectedCategory
                    ? CATEGORIES.find(c => c.id === selectedCategory)?.name
                    : 'All Stores'}
                </Text>
                <Pressable onPress={cycleSortBy}>
                  <HStack gap="xs">
                    <Filter size={16} color={colors.brand[600]} />
                    <Text variant="caption" style={{ color: colors.brand[600] }}>
                      Sort: {SORT_LABEL[sortBy]}
                    </Text>
                  </HStack>
                </Pressable>
              </HStack>

              {filteredStores.map(store => (
                <StoreCard
                  key={store.id}
                  store={store}
                  onPress={() => router.push(`/(delivery)/store/${store.id}`)}
                />
              ))}
            </VStack>
          </>
        )}

        {activeTab === 'orders' && (
          <VStack gap="md" style={styles.section}>
            {activeOrders.length > 0 && (
              <>
                <Text variant="bodyLg" style={{ fontWeight: '600' }}>Active</Text>
                {activeOrders.map(order => (
                  <ActiveOrderCard
                    key={order.id}
                    order={order}
                    onPress={() => router.push(`/(delivery)/order/${order.id}`)}
                  />
                ))}
              </>
            )}

            <Text variant="bodyLg" style={{ fontWeight: '600', marginTop: spacing.md }}>
              Past Orders
            </Text>
            {orders.filter(o => ['delivered', 'cancelled'].includes(o.status)).length === 0 ? (
              <Card style={styles.emptyCard}>
                <VStack style={{ alignItems: 'center' }}>
                  <Package size={48} color={colors.textSecondary} />
                  <Text variant="body" style={{ fontWeight: '500', marginTop: spacing.md }}>
                    No past orders yet
                  </Text>
                  <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
                    Your completed orders will appear here
                  </Text>
                </VStack>
              </Card>
            ) : (
              orders.filter(o => ['delivered', 'cancelled'].includes(o.status)).map(order => (
                <Card key={order.id} style={styles.pastOrderCard}>
                  <HStack style={{ justifyContent: 'space-between' }}>
                    <VStack>
                      <Text variant="body" style={{ fontWeight: '500' }}>{order.storeName}</Text>
                      <Text variant="caption" tone="secondary">{order.items}</Text>
                      <Text variant="caption" tone="secondary">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </Text>
                    </VStack>
                    <VStack style={{ alignItems: 'flex-end' }}>
                      <Text variant="body" style={{ fontWeight: '600' }}>₹{Math.round(order.totalPaise / 100)}</Text>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: STATUS_CONFIG[order.status].color + '20' }
                      ]}>
                        <Text
                          variant="caption"
                          style={{ color: STATUS_CONFIG[order.status].color }}
                        >
                          {STATUS_CONFIG[order.status].label}
                        </Text>
                      </View>
                    </VStack>
                  </HStack>
                </Card>
              ))
            )}
          </VStack>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
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
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.brand[600],
  },
  categoriesRow: {
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
  scroll: { flex: 1 },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  sectionHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  activeOrderCard: {
    padding: spacing.md,
    backgroundColor: colors.brand[50],
    borderColor: colors.brand[600],
    borderWidth: 1,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  quickItemsRow: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  quickItemCard: {
    padding: spacing.md,
    width: 160,
  },
  quickItemImage: {
    width: '100%',
    height: 60,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  storeCard: {
    padding: spacing.md,
  },
  storeCardFeatured: {
    borderColor: colors.brand[600],
    borderWidth: 1,
  },
  offerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    position: 'absolute',
    top: -1,
    right: spacing.md,
    zIndex: 1,
  },
  storeIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  neighborBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radius.sm,
  },
  closedBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  emptyCard: {
    padding: spacing[6],
    alignItems: 'center',
  },
  pastOrderCard: {
    padding: spacing.md,
  },
  bottomPadding: { height: 100 },
});
