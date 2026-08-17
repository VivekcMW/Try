import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, TrendingUp, Sparkles, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Card, HStack, Text, VStack } from '@/components/ui';
import { MerchantCard } from '@/components/MerchantCard';
import { useCatalog } from '@/hooks/useCatalog';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { FeatureGate } from '@/components/FeatureGate';

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🏪' },
  { id: 'food', label: 'Food', emoji: '🍽️' },
  { id: 'grocery', label: 'Grocery', emoji: '🛒' },
  { id: 'pharmacy', label: 'Pharmacy', emoji: '💊' },
  { id: 'clinic', label: 'Clinics', emoji: '🏥' },
  { id: 'lab_test', label: 'Lab Tests', emoji: '🧪' },
  { id: 'salon', label: 'Salon', emoji: '💇' },
  { id: 'repair', label: 'Repairs', emoji: '🔧' },
  { id: 'pest_control', label: 'Pest Control', emoji: '🪳' },
  { id: 'movers', label: 'Movers', emoji: '📦' },
  { id: 'event', label: 'Events', emoji: '🎉' },
  { id: 'tiffin', label: 'Tiffin', emoji: '🍱' },
  { id: 'consult', label: 'CA & Legal', emoji: '⚖️' },
  { id: 'laundry', label: 'Laundry', emoji: '👕' },
  { id: 'pet_care', label: 'Pets', emoji: '🐾' },
  { id: 'bakery', label: 'Bakery', emoji: '🍞' },
];

// Demo fallback shown when the API returns no merchants for the area
const DEMO_MERCHANTS = [
  {
    id: '1',
    name: 'Amul Parlour',
    category: 'grocery',
    description: 'Dairy · Ice Cream · Snacks',
    avatarUrl: null,
    lat: 0, lng: 0,
    distanceKm: 0.5,
    rating: 4.5,
    ratingCount: 120,
    isOpenNow: true,
    acceptingOrders: true,
    closedReason: null,
    businessHours: { start: '07:00', end: '22:00' },
    estimatedDeliveryMins: 10,
    deliveryFeePaise: 0,
    minimumOrderPaise: null,
    freeDeliveryAbovePaise: 10000,
    offer: { id: 'o1', title: '20% OFF', type: 'percent_off', value: 20, minSpendPaise: null },
    subscriptionTier: null,
    isEndorsed: true,
  },
  {
    id: '2',
    name: 'Fresh Veggies Store',
    category: 'grocery',
    description: 'Vegetables · Fruits · Organic',
    avatarUrl: null,
    lat: 0, lng: 0,
    distanceKm: 0.8,
    rating: 4.3,
    ratingCount: 85,
    isOpenNow: true,
    acceptingOrders: true,
    closedReason: null,
    businessHours: { start: '06:00', end: '21:00' },
    estimatedDeliveryMins: 15,
    deliveryFeePaise: 2000,
    minimumOrderPaise: null,
    freeDeliveryAbovePaise: null,
    offer: null,
    subscriptionTier: null,
    isEndorsed: false,
  },
  {
    id: '3',
    name: 'MedPlus Pharmacy',
    category: 'pharmacy',
    description: 'Medicines · Healthcare · 24/7',
    avatarUrl: null,
    lat: 0, lng: 0,
    distanceKm: 1.2,
    rating: 4.7,
    ratingCount: 200,
    isOpenNow: true,
    acceptingOrders: true,
    closedReason: null,
    businessHours: { start: '00:00', end: '23:59' },
    estimatedDeliveryMins: 20,
    deliveryFeePaise: 0,
    minimumOrderPaise: null,
    freeDeliveryAbovePaise: 5000,
    offer: null,
    subscriptionTier: null,
    isEndorsed: true,
  },
  {
    id: '4',
    name: 'Sharma Bakery',
    category: 'bakery',
    description: 'Fresh bread · Cakes · Cookies',
    avatarUrl: null,
    lat: 0, lng: 0,
    distanceKm: 0.9,
    rating: 4.4,
    ratingCount: 64,
    isOpenNow: true,
    acceptingOrders: true,
    closedReason: null,
    businessHours: { start: '07:00', end: '21:00' },
    estimatedDeliveryMins: 25,
    deliveryFeePaise: 1500,
    minimumOrderPaise: null,
    freeDeliveryAbovePaise: null,
    offer: { id: 'o2', title: '₹50 OFF', type: 'flat_off', value: 5000, minSpendPaise: 20000 },
    subscriptionTier: null,
    isEndorsed: false,
  },
  {
    id: '5',
    name: 'Glamour Touch Salon',
    category: 'salon',
    description: 'Haircuts · Facials · Grooming for men & women',
    avatarUrl: null,
    lat: 0, lng: 0,
    distanceKm: 0.6,
    rating: 4.6,
    ratingCount: 94,
    isOpenNow: true,
    acceptingOrders: true,
    closedReason: null,
    businessHours: { start: '09:00', end: '20:00' },
    estimatedDeliveryMins: null,
    deliveryFeePaise: null,
    minimumOrderPaise: null,
    freeDeliveryAbovePaise: null,
    offer: { id: 'o3', title: '15% OFF', type: 'percent_off', value: 15, minSpendPaise: null },
    subscriptionTier: null,
    isEndorsed: true,
  },
  {
    id: '6',
    name: 'Style Studio Unisex Salon',
    category: 'salon',
    description: 'Hair spa · Manicure · Bridal packages',
    avatarUrl: null,
    lat: 0, lng: 0,
    distanceKm: 1.1,
    rating: 4.2,
    ratingCount: 58,
    isOpenNow: true,
    acceptingOrders: true,
    closedReason: null,
    businessHours: { start: '10:00', end: '21:00' },
    estimatedDeliveryMins: null,
    deliveryFeePaise: null,
    minimumOrderPaise: null,
    freeDeliveryAbovePaise: null,
    offer: null,
    subscriptionTier: null,
    isEndorsed: false,
  },
  {
    id: '7',
    name: 'Sunrise Family Clinic',
    category: 'clinic',
    description: 'General physician · Vaccinations · Health checks',
    avatarUrl: null,
    lat: 0, lng: 0,
    distanceKm: 0.7,
    rating: 4.8,
    ratingCount: 210,
    isOpenNow: true,
    acceptingOrders: true,
    closedReason: null,
    businessHours: { start: '08:00', end: '21:00' },
    estimatedDeliveryMins: null,
    deliveryFeePaise: null,
    minimumOrderPaise: null,
    freeDeliveryAbovePaise: null,
    offer: null,
    subscriptionTier: null,
    isEndorsed: true,
  },
  {
    id: '8',
    name: 'Smile Care Dental Clinic',
    category: 'clinic',
    description: 'Dental checkups · Cleaning · Root canal',
    avatarUrl: null,
    lat: 0, lng: 0,
    distanceKm: 1.4,
    rating: 4.5,
    ratingCount: 132,
    isOpenNow: true,
    acceptingOrders: true,
    closedReason: null,
    businessHours: { start: '10:00', end: '20:00' },
    estimatedDeliveryMins: null,
    deliveryFeePaise: null,
    minimumOrderPaise: null,
    freeDeliveryAbovePaise: null,
    offer: { id: 'o4', title: 'Free checkup', type: 'flat_off', value: 20000, minSpendPaise: null },
    subscriptionTier: null,
    isEndorsed: true,
  },
  {
    id: '9',
    name: 'LifeCare Multispeciality Hospital',
    category: 'clinic',
    description: 'OPD · Diagnostics · 24/7 emergency',
    avatarUrl: null,
    lat: 0, lng: 0,
    distanceKm: 2.3,
    rating: 4.4,
    ratingCount: 340,
    isOpenNow: true,
    acceptingOrders: true,
    closedReason: null,
    businessHours: { start: '00:00', end: '23:59' },
    estimatedDeliveryMins: null,
    deliveryFeePaise: null,
    minimumOrderPaise: null,
    freeDeliveryAbovePaise: null,
    offer: null,
    subscriptionTier: null,
    isEndorsed: false,
  },
  {
    id: '10',
    name: 'QuickFix AC & Appliance Repair',
    category: 'repair',
    description: 'AC · Fridge · Washing machine — doorstep repair',
    avatarUrl: null,
    lat: 0, lng: 0,
    distanceKm: 1.8,
    rating: 4.5,
    ratingCount: 176,
    isOpenNow: true,
    acceptingOrders: true,
    closedReason: null,
    businessHours: { start: '09:00', end: '21:00' },
    estimatedDeliveryMins: null,
    deliveryFeePaise: null,
    minimumOrderPaise: null,
    freeDeliveryAbovePaise: null,
    offer: { id: 'o5', title: 'Visit fee waived on repair', type: 'flat_off', value: 9900, minSpendPaise: null },
    subscriptionTier: null,
    isEndorsed: true,
  },
  {
    id: '11',
    name: 'Sharma Plumbing & Electrical',
    category: 'repair',
    description: 'Leaks · Wiring · Fittings — 30-day work warranty',
    avatarUrl: null,
    lat: 0, lng: 0,
    distanceKm: 1.2,
    rating: 4.3,
    ratingCount: 98,
    isOpenNow: true,
    acceptingOrders: true,
    closedReason: null,
    businessHours: { start: '08:00', end: '20:00' },
    estimatedDeliveryMins: null,
    deliveryFeePaise: null,
    minimumOrderPaise: null,
    freeDeliveryAbovePaise: null,
    offer: null,
    subscriptionTier: null,
    isEndorsed: false,
  },
  {
    id: '12',
    name: 'SafeNest Packers & Movers',
    category: 'movers',
    description: 'Local shifting · Free site visit · Insured transit',
    avatarUrl: null,
    lat: 0, lng: 0,
    distanceKm: 3.5,
    rating: 4.6,
    ratingCount: 220,
    isOpenNow: true,
    acceptingOrders: true,
    closedReason: null,
    businessHours: { start: '09:00', end: '19:00' },
    estimatedDeliveryMins: null,
    deliveryFeePaise: null,
    minimumOrderPaise: null,
    freeDeliveryAbovePaise: null,
    offer: null,
    subscriptionTier: null,
    isEndorsed: true,
  },
  {
    id: '13',
    name: 'Happy Paws Grooming & Vet',
    category: 'pet_care',
    description: 'Grooming at home or clinic · Vet consultations',
    avatarUrl: null,
    lat: 0, lng: 0,
    distanceKm: 1.6,
    rating: 4.7,
    ratingCount: 143,
    isOpenNow: true,
    acceptingOrders: true,
    closedReason: null,
    businessHours: { start: '09:00', end: '20:00' },
    estimatedDeliveryMins: null,
    deliveryFeePaise: null,
    minimumOrderPaise: null,
    freeDeliveryAbovePaise: null,
    offer: null,
    subscriptionTier: null,
    isEndorsed: true,
  },
  {
    id: '14',
    name: 'HealthFirst Diagnostics @Home',
    category: 'lab_test',
    description: 'Blood tests at home · NABL lab · Reports in 24h',
    avatarUrl: null,
    lat: 0, lng: 0,
    distanceKm: 2.1,
    rating: 4.6,
    ratingCount: 188,
    isOpenNow: true,
    acceptingOrders: true,
    closedReason: null,
    businessHours: { start: '06:00', end: '12:00' },
    estimatedDeliveryMins: null,
    deliveryFeePaise: null,
    minimumOrderPaise: null,
    freeDeliveryAbovePaise: null,
    offer: null,
    subscriptionTier: null,
    isEndorsed: true,
  },
  {
    id: '15',
    name: 'ShieldPro Pest Control',
    category: 'pest_control',
    description: 'Cockroach · Termite · Bed bugs · 90-day warranty',
    avatarUrl: null,
    lat: 0, lng: 0,
    distanceKm: 2.8,
    rating: 4.4,
    ratingCount: 112,
    isOpenNow: true,
    acceptingOrders: true,
    closedReason: null,
    businessHours: { start: '09:00', end: '19:00' },
    estimatedDeliveryMins: null,
    deliveryFeePaise: null,
    minimumOrderPaise: null,
    freeDeliveryAbovePaise: null,
    offer: null,
    subscriptionTier: null,
    isEndorsed: true,
  },
  {
    id: '16',
    name: 'Moments Photography & Events',
    category: 'event',
    description: 'Weddings · Birthdays · Society events',
    avatarUrl: null,
    lat: 0, lng: 0,
    distanceKm: 3.2,
    rating: 4.8,
    ratingCount: 76,
    isOpenNow: true,
    acceptingOrders: true,
    closedReason: null,
    businessHours: { start: '10:00', end: '20:00' },
    estimatedDeliveryMins: null,
    deliveryFeePaise: null,
    minimumOrderPaise: null,
    freeDeliveryAbovePaise: null,
    offer: null,
    subscriptionTier: null,
    isEndorsed: true,
  },
  {
    id: '17',
    name: 'Ghar Ka Khana Tiffin',
    category: 'tiffin',
    description: 'Home-style tiffins · Monthly plans · Fresh daily',
    avatarUrl: null,
    lat: 0, lng: 0,
    distanceKm: 0.9,
    rating: 4.5,
    ratingCount: 261,
    isOpenNow: true,
    acceptingOrders: true,
    closedReason: null,
    businessHours: { start: '07:00', end: '21:00' },
    estimatedDeliveryMins: null,
    deliveryFeePaise: null,
    minimumOrderPaise: null,
    freeDeliveryAbovePaise: null,
    offer: { id: 'o6', title: '3-day trial ₹360', type: 'flat_off', value: 0, minSpendPaise: null },
    subscriptionTier: null,
    isEndorsed: true,
  },
  {
    id: '18',
    name: 'LegalEase CA & Advocates',
    category: 'consult',
    description: 'Tax · GST · Legal — online or in office',
    avatarUrl: null,
    lat: 0, lng: 0,
    distanceKm: 1.9,
    rating: 4.7,
    ratingCount: 89,
    isOpenNow: true,
    acceptingOrders: true,
    closedReason: null,
    businessHours: { start: '10:00', end: '19:00' },
    estimatedDeliveryMins: null,
    deliveryFeePaise: null,
    minimumOrderPaise: null,
    freeDeliveryAbovePaise: null,
    offer: null,
    subscriptionTier: null,
    isEndorsed: true,
  },
  {
    id: '20',
    name: 'Sparkle Wash Laundry',
    category: 'laundry',
    description: 'Free pickup & delivery · Wash, iron, dry-clean',
    avatarUrl: null,
    lat: 0, lng: 0,
    distanceKm: 1.1,
    rating: 4.3,
    ratingCount: 154,
    isOpenNow: true,
    acceptingOrders: true,
    closedReason: null,
    businessHours: { start: '08:00', end: '21:00' },
    estimatedDeliveryMins: null,
    deliveryFeePaise: null,
    minimumOrderPaise: null,
    freeDeliveryAbovePaise: null,
    offer: null,
    subscriptionTier: null,
    isEndorsed: false,
  },
];

export default function CatalogScreen() {
  return (
    <FeatureGate featureKey="services">
      <CatalogScreenInner />
    </FeatureGate>
  );
}

function CatalogScreenInner() {
  const router = useRouter();
  const userId = useWalletStore((s) => s.userId) ?? undefined;
  const pinCode = useOnboardingStore((s) => s.pin);

  const {
    location,
    locationPermission,
    nearbyMerchants,
    trendingMerchants,
    recommendations,
    loading,
    error,
    requestLocation,
    fetchNearby,
    fetchTrending,
    fetchRecommendations,
    track,
  } = useCatalog({ autoFetch: false, userId });

  const [activeTab, setActiveTab] = useState<'nearby' | 'trending' | 'for-you'>('nearby');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Initial load
  useEffect(() => {
    handleRefresh();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    
    const coords = location || await requestLocation();
    
    if (coords) {
      await Promise.all([
        fetchNearby(selectedCategory !== 'all' ? { category: selectedCategory } : {}),
        fetchTrending(selectedCategory !== 'all' ? { category: selectedCategory } : {}),
        userId ? fetchRecommendations() : Promise.resolve(),
      ]);
    } else {
      // Fallback to trending by pin code if location denied
      await fetchTrending({ pinCode, category: selectedCategory !== 'all' ? selectedCategory : undefined });
    }

    setRefreshing(false);
  }, [location, selectedCategory, userId, pinCode, requestLocation, fetchNearby, fetchTrending, fetchRecommendations]);

  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    // Re-fetch with new category
    if (activeTab === 'nearby') {
      fetchNearby(categoryId !== 'all' ? { category: categoryId } : {});
    } else if (activeTab === 'trending') {
      fetchTrending(categoryId !== 'all' ? { category: categoryId } : {});
    }
  }, [activeTab, fetchNearby, fetchTrending]);

  const handleMerchantPress = useCallback((merchantId: string, category: string) => {
    track('view_merchant', { merchantId, category });
    router.push({ pathname: '/(marketplace)/merchant/[id]', params: { id: merchantId } } as never);
  }, [track, router]);

  const getCurrentData = () => {
    let data;
    switch (activeTab) {
      case 'nearby':
        data = nearbyMerchants;
        break;
      case 'trending':
        data = trendingMerchants;
        break;
      case 'for-you':
        data = recommendations;
        break;
      default:
        data = [];
    }
    // Demo fallback so the screen is never empty while backend has no data
    if (!loading && data.length === 0 && !error) {
      data = DEMO_MERCHANTS.filter(
        (m) => selectedCategory === 'all' || m.category === selectedCategory
      ) as never[];
    }
    return data;
  };

  const currentData = getCurrentData();
  const showLocationPrompt = locationPermission === 'denied' && activeTab === 'nearby';

  return (
    <SafeAreaView style={styles.safe} edges={['top']} testID="catalog-screen">
      <VStack style={styles.container}>
        {/* Header */}
        <HStack gap={3} align="center" style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            testID="back-button"
            style={styles.backBtn}
            hitSlop={8}
          >
            <ArrowLeft size={22} color={colors.surface.heading} />
          </Pressable>
          <VStack gap={0.5} style={{ flex: 1 }}>
            <Text variant="h2" style={{ color: colors.surface.heading }}>
              Discover Shops
            </Text>
            <HStack gap={1} align="center">
              <MapPin size={12} color={colors.surface.textSecondary} />
              <Text variant="caption" tone="secondary" testID="location-text">
                Near you{pinCode ? ` · PIN ${pinCode}` : ''}
              </Text>
            </HStack>
          </VStack>
        </HStack>

        {/* Segmented control */}
        <View style={styles.segmentWrap}>
          <Pressable
            onPress={() => setActiveTab('nearby')}
            style={[styles.segment, activeTab === 'nearby' && styles.segmentActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: activeTab === 'nearby' }}
          >
            <MapPin size={15} color={activeTab === 'nearby' ? colors.surface.background : colors.surface.textSecondary} />
            <Text style={[styles.segmentText, activeTab === 'nearby' && styles.segmentTextActive]}>
              Nearby
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('trending')}
            style={[styles.segment, activeTab === 'trending' && styles.segmentActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: activeTab === 'trending' }}
          >
            <TrendingUp size={15} color={activeTab === 'trending' ? colors.surface.background : colors.surface.textSecondary} />
            <Text style={[styles.segmentText, activeTab === 'trending' && styles.segmentTextActive]}>
              Trending
            </Text>
          </Pressable>

          {userId && (
            <Pressable
              onPress={() => setActiveTab('for-you')}
              style={[styles.segment, activeTab === 'for-you' && styles.segmentActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: activeTab === 'for-you' }}
            >
              <Sparkles size={15} color={activeTab === 'for-you' ? colors.surface.background : colors.surface.textSecondary} />
              <Text style={[styles.segmentText, activeTab === 'for-you' && styles.segmentTextActive]}>
                For You
              </Text>
            </Pressable>
          )}
        </View>

        {/* Category filters */}
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(item) => item.id}
          style={styles.categoryScroll}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleCategoryChange(item.id)}
              style={[
                styles.categoryChip,
                selectedCategory === item.id && styles.categoryChipActive,
              ]}
            >
              <Text variant="caption">{item.emoji}</Text>
              <Text
                variant="caption"
                style={[
                  styles.categoryText,
                  selectedCategory === item.id && styles.categoryTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />

        {/* Location permission prompt */}
        {showLocationPrompt && (
          <Card padding={3.5} elevation="sm" style={styles.locationPrompt}>
            <VStack gap={2}>
              <HStack gap={2} align="center">
                <MapPin size={20} color={colors.brand[600]} />
                <Text variant="body" style={{ fontWeight: '600', flex: 1 }}>
                  Enable location for better results
                </Text>
              </HStack>
              <Text variant="caption" tone="secondary">
                We'll show you merchants near you with accurate distances and delivery times.
              </Text>
              <Pressable
                onPress={requestLocation}
                style={styles.locationButton}
              >
                <Text variant="body" style={{ color: colors.surface.background, fontWeight: '600' }}>
                  Enable Location
                </Text>
              </Pressable>
            </VStack>
          </Card>
        )}

        {/* Results context */}
        {!loading && currentData.length > 0 && (
          <Text variant="caption" tone="secondary" style={styles.resultsLine}>
            {currentData.length} {currentData.length === 1 ? 'shop' : 'shops'}
            {selectedCategory !== 'all' ? ` in ${CATEGORIES.find((c) => c.id === selectedCategory)?.label}` : ''}
            {activeTab === 'nearby' ? ' near you' : activeTab === 'trending' ? ' trending this week' : ' picked for you'}
          </Text>
        )}

        {/* Merchant list */}
        <FlatList
          data={currentData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MerchantCard
              merchant={item}
              onPress={() => handleMerchantPress(item.id, item.category)}
              showDistance={activeTab === 'nearby'}
              showTrendingScore={activeTab === 'trending'}
              showRecommendationScore={activeTab === 'for-you'}
            />
          )}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: spacing[3] }} />}
          ListEmptyComponent={
            loading ? (
              <View style={styles.centerContent}>
                <ActivityIndicator size="large" color={colors.brand[600]} />
              </View>
            ) : (
              <View style={styles.centerContent}>
                <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
                  {error || 'No merchants found in this area'}
                </Text>
                {error && (
                  <Pressable onPress={handleRefresh} style={styles.retryButton}>
                    <Text variant="body" style={{ color: colors.brand[600], fontWeight: '600' }}>
                      Try Again
                    </Text>
                  </Pressable>
                )}
              </View>
            )
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.brand[600]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </VStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface.surfaceMuted,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[3],
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surface.background,
    borderWidth: 1,
    borderColor: colors.surface.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentWrap: {
    flexDirection: 'row',
    marginHorizontal: spacing[4],
    padding: spacing[1],
    backgroundColor: colors.surface.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surface.border,
    gap: spacing[1],
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1.5],
    height: 38,
    borderRadius: radius.sm,
  },
  segmentActive: {
    backgroundColor: colors.brand[600],
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.surface.textSecondary,
  },
  segmentTextActive: {
    color: colors.surface.background,
  },
  resultsLine: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[2],
  },
  categoryScroll: {
    flexGrow: 0,
    // Horizontal FlatList ignores contentContainer vertical padding in its height,
    // so give the list an explicit height: chip (36) + top/bottom margin (12+12)
    height: 60,
  },
  categoryList: {
    paddingHorizontal: spacing[4],
    gap: spacing[2],
    alignItems: 'center',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surface.background,
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  categoryChipActive: {
    backgroundColor: colors.brand[50],
    borderColor: colors.brand[600],
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.surface.foreground,
  },
  categoryTextActive: {
    color: colors.brand[700],
  },
  locationPrompt: {
    marginHorizontal: spacing[5],
    marginBottom: spacing[3],
  },
  locationButton: {
    backgroundColor: colors.brand[600],
    paddingVertical: spacing[2.5],
    paddingHorizontal: spacing[4],
    borderRadius: radius.md,
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    paddingBottom: spacing[8],
  },
  centerContent: {
    paddingVertical: spacing[12],
    alignItems: 'center',
    gap: spacing[4],
  },
  retryButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.brand[600],
  },
});
