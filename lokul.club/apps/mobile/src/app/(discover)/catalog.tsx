import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, TrendingUp, Sparkles, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Card, HStack, Text, VStack } from '@/components/ui';
import { MerchantCard } from '@/components/MerchantCard';
import { useCatalog } from '@/hooks/useCatalog';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🏪' },
  { id: 'food', label: 'Food', emoji: '🍽️' },
  { id: 'grocery', label: 'Grocery', emoji: '🛒' },
  { id: 'pharmacy', label: 'Pharmacy', emoji: '💊' },
  { id: 'bakery', label: 'Bakery', emoji: '🍞' },
  { id: 'salon', label: 'Salon', emoji: '💇' },
  { id: 'laundry', label: 'Laundry', emoji: '👕' },
  { id: 'pet_care', label: 'Pets', emoji: '🐾' },
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
];

export default function CatalogScreen() {
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
        <VStack gap={1.5} style={styles.header}>
          <HStack gap={3} align="center">
            <Pressable onPress={() => router.back()} accessibilityLabel="Go back" testID="back-button">
              <ArrowLeft size={24} color={colors.surface.heading} />
            </Pressable>
            <Text variant="h1" style={{ color: colors.surface.heading }}>
              Discover
            </Text>
          </HStack>

          {location && (
            <HStack gap={1.5} align="center">
              <MapPin size={14} color={colors.surface.textSecondary} />
              <Text variant="caption" tone="secondary" testID="location-text">
                Shops near you{pinCode ? ` · PIN ${pinCode}` : ''}
              </Text>
            </HStack>
          )}
        </VStack>

        {/* Tab switcher */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabScroll}
          contentContainerStyle={styles.tabContainer}
        >
          <Pressable
            onPress={() => setActiveTab('nearby')}
            style={[styles.tab, activeTab === 'nearby' && styles.tabActive]}
          >
            <MapPin size={16} color={activeTab === 'nearby' ? colors.brand[600] : colors.surface.textSecondary} />
            <Text
              variant="body"
              style={[
                styles.tabText,
                activeTab === 'nearby' && styles.tabTextActive,
              ]}
            >
              Nearby
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('trending')}
            style={[styles.tab, activeTab === 'trending' && styles.tabActive]}
          >
            <TrendingUp size={16} color={activeTab === 'trending' ? colors.brand[600] : colors.surface.textSecondary} />
            <Text
              variant="body"
              style={[
                styles.tabText,
                activeTab === 'trending' && styles.tabTextActive,
              ]}
            >
              Trending
            </Text>
          </Pressable>

          {userId && (
            <Pressable
              onPress={() => setActiveTab('for-you')}
              style={[styles.tab, activeTab === 'for-you' && styles.tabActive]}
            >
              <Sparkles size={16} color={activeTab === 'for-you' ? colors.brand[600] : colors.surface.textSecondary} />
              <Text
                variant="body"
                style={[
                  styles.tabText,
                  activeTab === 'for-you' && styles.tabTextActive,
                ]}
              >
                For You
              </Text>
            </Pressable>
          )}
        </ScrollView>

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
                <Text variant="body" style={{ color: '#fff', fontWeight: '600' }}>
                  Enable Location
                </Text>
              </Pressable>
            </VStack>
          </Card>
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
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
  },
  tabScroll: {
    flexGrow: 0,
  },
  tabContainer: {
    paddingHorizontal: spacing[5],
    gap: spacing[2.5],
    paddingVertical: spacing[3],
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    paddingHorizontal: spacing[4],
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surface.background,
    borderWidth: 1.5,
    borderColor: colors.surface.border,
  },
  tabActive: {
    backgroundColor: colors.brand[50],
    borderColor: colors.brand[200],
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.surface.textSecondary,
  },
  tabTextActive: {
    color: colors.brand[600],
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryList: {
    paddingHorizontal: spacing[5],
    gap: spacing[2.5],
    paddingVertical: spacing[3],
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    paddingHorizontal: spacing[4],
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surface.background,
    borderWidth: 1.5,
    borderColor: colors.surface.border,
  },
  categoryChipActive: {
    backgroundColor: colors.brand[600],
    borderColor: colors.brand[600],
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.surface.foreground,
  },
  categoryTextActive: {
    color: '#fff',
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
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    paddingBottom: spacing[5],
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
