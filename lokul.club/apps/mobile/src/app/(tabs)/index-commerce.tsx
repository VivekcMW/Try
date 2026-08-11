import { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPin, Bell, ShoppingCart, ChevronDown, Search } from 'lucide-react-native';
import { HStack, RadiusSelector, Text } from '@/components/ui';
import { colors, radius, spacing, fontSize } from '@lokul/ui-tokens';
import {
  CategoryPills,
  ProductQuickAddCard,
  MerchantSpotlightCard,
  StickyCartBar,
} from '@/components/commerce';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useCartStore } from '@/store/cartStore';
import { OfflineBanner } from '@/components/OfflineBanner';

const { width: SCREEN_W } = Dimensions.get('window');
const PRODUCT_CARD_WIDTH = (SCREEN_W - 44) / 2;  // 2 columns: paddingH(32px) + gap(12px)

// Dummy data - replace with actual API calls
const DUMMY_MERCHANTS = [
  {
    id: '1',
    name: 'Amul Parlour',
    category: 'Dairy · Ice Cream',
    rating: 4.5,
    reviewCount: 120,
    deliveryTime: 10,
    deliveryFeePaise: 0,
    freeDeliveryAbovePaise: 10000,
    offer: { type: 'percent_off' as const, value: 20 },
    tags: ['Verified', 'Fast delivery'],
    isEndorsed: true,
    isOpenNow: true,
    acceptingOrders: true,
    distanceKm: 0.5,
  },
  {
    id: '2',
    name: 'Fresh Veggies Store',
    category: 'Vegetables · Fruits',
    rating: 4.3,
    reviewCount: 85,
    deliveryTime: 15,
    deliveryFeePaise: 2000,
    tags: ['Organic'],
    isOpenNow: true,
    acceptingOrders: true,
    distanceKm: 0.8,
  },
  {
    id: '3',
    name: 'MedPlus Pharmacy',
    category: 'Medicines · Healthcare',
    rating: 4.7,
    reviewCount: 200,
    deliveryTime: 20,
    deliveryFeePaise: 0,
    freeDeliveryAbovePaise: 5000,
    tags: ['24/7', 'Verified'],
    isEndorsed: true,
    isOpenNow: true,
    acceptingOrders: true,
    distanceKm: 1.2,
  },
  {
    id: '5',
    name: 'Glamour Touch Salon',
    category: 'Salon · Grooming',
    rating: 4.6,
    reviewCount: 94,
    offer: { type: 'percent_off' as const, value: 15 },
    tags: ['Verified'],
    isEndorsed: true,
    isOpenNow: true,
    acceptingOrders: true,
    distanceKm: 0.6,
  },
  {
    id: '7',
    name: 'Sunrise Family Clinic',
    category: 'Clinic · General Physician',
    rating: 4.8,
    reviewCount: 210,
    tags: ['Verified', 'Walk-in'],
    isEndorsed: true,
    isOpenNow: true,
    acceptingOrders: true,
    distanceKm: 0.7,
  },
];

const DUMMY_PRODUCTS = [
  {
    id: '1',
    name: 'Amul Taaza Milk',
    unit: '500ml',
    pricePaise: 6000,
    mrpPaise: 7000,
    inStock: true,
    merchantId: '1',
    merchantName: 'Amul Parlour',
    kind: 'product',
  },
  {
    id: '2',
    name: 'Britannia Bread',
    unit: '400g',
    pricePaise: 4000,
    mrpPaise: 4500,
    inStock: true,
    merchantId: '1',
    merchantName: 'Amul Parlour',
    kind: 'product',
  },
  {
    id: '3',
    name: 'Tata Tea Gold',
    unit: '1kg',
    pricePaise: 19000,
    mrpPaise: 22000,
    inStock: true,
    merchantId: '1',
    merchantName: 'Amul Parlour',
    kind: 'product',
  },
  {
    id: '4',
    name: 'Amul Butter',
    unit: '100g',
    pricePaise: 5500,
    inStock: true,
    merchantId: '1',
    merchantName: 'Amul Parlour',
    kind: 'product',
  },
  {
    id: '5',
    name: 'Fortune Oil',
    unit: '1L',
    pricePaise: 18000,
    mrpPaise: 20000,
    inStock: true,
    merchantId: '1',
    merchantName: 'Amul Parlour',
    kind: 'product',
  },
  {
    id: '6',
    name: 'Maggi Noodles',
    unit: '12 pack',
    pricePaise: 14000,
    inStock: false,
    merchantId: '1',
    merchantName: 'Amul Parlour',
    kind: 'product',
  },
];

export default function HomeScreenCommerce() {
  const router = useRouter();
  const societyName = useOnboardingStore((s) => s.societyName) ?? 'Tower B-302';
  // Subscribe to items so the badge updates when the cart changes
  const cartItems = useCartStore((s) => s.items);
  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  
  const [refreshing, setRefreshing] = useState(false);
  const [merchants, setMerchants] = useState(DUMMY_MERCHANTS);
  const [products, setProducts] = useState(DUMMY_PRODUCTS);

  // Load data from API
  const loadData = useCallback(async () => {
    // TODO: Replace with actual API calls
    // const merchantsData = await fetch('/api/merchants/nearby').then(r => r.json());
    // const productsData = await fetch('/api/products/essentials').then(r => r.json());
    
    // For now, using dummy data
    setMerchants(DUMMY_MERCHANTS);
    setProducts(DUMMY_PRODUCTS);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData().finally(() => setRefreshing(false));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']} testID="home-screen-commerce">
      <OfflineBanner />
      
      {/* Header */}
      <View style={styles.header}>
        <HStack style={styles.topRow} align="center">
          {/* Location */}
          <Pressable
            style={styles.locationButton}
            onPress={() => router.push('/(settings)' as any)}
            accessibilityRole="button"
            accessibilityLabel="Change location"
          >
            <View style={styles.locationPin}>
              <MapPin size={18} color={colors.brand[600]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.locationLabel}>Delivering to</Text>
              <HStack gap={1} align="center">
                <Text style={styles.locationText} numberOfLines={1}>
                  {societyName}
                </Text>
                <ChevronDown size={14} color={colors.surface.heading} />
              </HStack>
            </View>
          </Pressable>

          <HStack gap={2} align="center">
            {/* Discovery radius — taps cycle 200m → 500m → 2km → 5km */}
            <RadiusSelector compact />

            {/* Notifications */}
            <Pressable
              style={styles.iconButton}
              onPress={() => router.push('/(notifications)' as any)}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
            >
              <Bell size={20} color={colors.surface.heading} />
            </Pressable>

            {/* Cart */}
            <Pressable
              style={styles.iconButton}
              onPress={() => router.push('/(marketplace)/cart' as any)}
              accessibilityRole="button"
              accessibilityLabel={`Cart with ${itemCount} items`}
            >
              <ShoppingCart size={20} color={colors.surface.heading} />
              {itemCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{itemCount}</Text>
                </View>
              )}
            </Pressable>
          </HStack>
        </HStack>

        {/* Search Bar */}
        <Pressable
          style={styles.searchBar}
          onPress={() => router.push('/(discover)/search' as any)}
          accessibilityRole="button"
          accessibilityLabel="Search food, groceries"
        >
          <Search size={18} color={colors.surface.textSecondary} />
          <Text style={styles.searchPlaceholder}>Search food, groceries...</Text>
        </Pressable>
      </View>

      {/* Category Pills */}
      <CategoryPills />

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <Text style={styles.promoTitle}>Apni dukaan, ab app par 🇮🇳</Text>
          <Text style={styles.promoSubtitle}>
            Order from shops in your own neighborhood — every order supports a local family business
          </Text>
        </View>

        {/* Trust Strip — local vendor mission */}
        <View style={styles.trustStrip}>
          <View style={styles.trustItem}>
            <Text style={styles.trustIcon}>🏪</Text>
            <Text style={styles.trustLabel}>100% Local{'\n'}Shops</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <Text style={styles.trustIcon}>🤝</Text>
            <Text style={styles.trustLabel}>No Middlemen,{'\n'}Fair Prices</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <Text style={styles.trustIcon}>⚡</Text>
            <Text style={styles.trustLabel}>Delivered by{'\n'}Neighbors</Text>
          </View>
        </View>

        {/* Merchants Spotlight */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Nearby & Open Now</Text>
              <Text style={styles.sectionSubtitle}>Shops from your own locality</Text>
            </View>
            <Pressable
              onPress={() => router.push('/(discover)/catalog' as any)}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="See all nearby shops"
            >
              <Text style={styles.viewAll}>See all</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {merchants.map((merchant) => (
              <View key={merchant.id} style={{ marginRight: spacing[3] }}>
                <MerchantSpotlightCard merchant={merchant} />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Product Quick Add */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Daily Essentials</Text>
              <Text style={styles.sectionSubtitle}>Milk, bread, atta & more</Text>
            </View>
            <Pressable
              onPress={() => router.push('/(marketplace)' as any)}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="See all daily essentials"
            >
              <Text style={styles.viewAll}>See all</Text>
            </Pressable>
          </View>

          <View style={styles.productGrid}>
            {products.map((product) => (
              <View key={product.id} style={{ width: PRODUCT_CARD_WIDTH }}>
                <ProductQuickAddCard product={product} />
              </View>
            ))}
          </View>
        </View>

        {/* Community Feed Teaser */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>What's Happening</Text>
              <Text style={styles.sectionSubtitle}>Updates from your society</Text>
            </View>
            <Pressable
              onPress={() => router.push('/(tabs)/explore' as any)}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="See all community updates"
            >
              <Text style={styles.viewAll}>See all</Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.communityCard}
            onPress={() => router.push('/(tabs)/explore' as any)}
            accessibilityRole="button"
          >
            <View style={styles.communityIcon}>
              <Text style={{ fontSize: 20 }}>💬</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.communityTitle}>Community Updates</Text>
              <Text style={styles.communityBody}>
                3 new posts from your neighbors — tap to catch up
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Spacer for cart bar */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky Cart Bar */}
      <StickyCartBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface.background,
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
    backgroundColor: colors.surface.background,
  },
  topRow: {
    height: 48,
    marginBottom: spacing[3],
  },
  locationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  locationPin: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationLabel: {
    fontSize: fontSize.xs,
    color: colors.surface.textSecondary,
    marginBottom: 1,
  },
  locationText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.surface.heading,
    maxWidth: 180,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.surface.border,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.semantic.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.surface.background,
  },
  searchBar: {
    height: 48,
    backgroundColor: colors.surface.surfaceMuted,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surface.border,
    paddingHorizontal: spacing[3.5],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2.5],
  },
  searchPlaceholder: {
    fontSize: fontSize.sm,
    color: colors.surface.textSecondary,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing[20],
  },
  promoBanner: {
    marginHorizontal: spacing[4],
    marginTop: spacing[4],
    padding: spacing[5],
    backgroundColor: colors.brand[600],
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  promoTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.surface.background,
    marginBottom: spacing[1],
  },
  promoSubtitle: {
    fontSize: fontSize.sm,
    color: colors.brand[100],
    lineHeight: 20,
  },
  section: {
    paddingTop: spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.surface.heading,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: fontSize.xs,
    color: colors.surface.textSecondary,
    marginTop: 2,
  },
  viewAll: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.brand[600],
  },
  trustStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing[4],
    marginTop: spacing[3],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
    backgroundColor: colors.accent[50],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.accent[100],
  },
  trustItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1.5],
  },
  trustIcon: {
    fontSize: 18,
  },
  trustLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accent[700],
    lineHeight: 14,
  },
  trustDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.accent[200],
  },
  horizontalScroll: {
    paddingHorizontal: spacing[4],
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing[4],
    gap: spacing[3],
  },
  communityCard: {
    marginHorizontal: spacing[4],
    padding: spacing[4],
    backgroundColor: colors.surface.surfaceMuted,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.surface.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  communityIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  communityTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.surface.heading,
    marginBottom: 2,
  },
  communityBody: {
    fontSize: fontSize.xs,
    color: colors.surface.textSecondary,
    lineHeight: 17,
  },
});
