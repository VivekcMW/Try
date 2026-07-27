import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle, Star } from 'lucide-react-native';
import { Avatar, Card, HStack, Text, VStack } from '@/components/ui';
import { SERVICE_CATEGORIES } from '@/data/community-seed';
import { useOnboardingStore } from '@/store/onboardingStore';
import { colors, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type ProviderItem = {
  id: string;
  name: string;
  bio?: string;
  rating?: number;
  reviewCount?: number;
  priceLabel?: string;
  pricePaise?: number;
  verified?: boolean;
  category: string;
  // For service listings: ownerId == userId
  ownerId?: string;
  // For peer listings: listingId present
  listingId?: string;
};

export default function CategoryScreen() {
  const { cat }  = useLocalSearchParams<{ cat: string }>();
  const router   = useRouter();
  const pinCode  = useOnboardingStore((s) => s.pin);
  const category = SERVICE_CATEGORIES.find((c) => c.id === cat);
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!pinCode) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      // Fetch from both merchants and peer service-listings in parallel
      const [merchantRes, listingRes] = await Promise.allSettled([
        fetch(`${BASE}/api/mobile/merchants?pinCode=${pinCode}&category=${encodeURIComponent(cat ?? '')}`, { signal: controller.signal }),
        fetch(`${BASE}/api/mobile/service-listings?pinCode=${pinCode}&category=${encodeURIComponent(cat ?? '')}`, { signal: controller.signal }),
      ]);

      const merchantItems: ProviderItem[] = [];
      if (merchantRes.status === 'fulfilled' && merchantRes.value.ok) {
        const data = await merchantRes.value.json();
        (data.items ?? []).forEach((m: any) => {
          merchantItems.push({
            id:         m.id,
            name:       m.name,
            bio:        m.description,
            rating:     m.ratingAvg,
            reviewCount: m.ratingCount,
            priceLabel: m.priceLabel ?? undefined,
            verified:   m.owner?.kycTier !== 'bronze',
            category:   m.category,
            ownerId:    m.ownerId ?? m.owner?.id,
          });
        });
      }

      const listingItems: ProviderItem[] = [];
      if (listingRes.status === 'fulfilled' && listingRes.value.ok) {
        const data = await listingRes.value.json();
        (data.items ?? []).forEach((l: any) => {
          // Avoid showing duplicate if same user has both a merchant and a listing
          const alreadyShown = merchantItems.some((m) => m.ownerId === l.userId);
          if (!alreadyShown) {
            listingItems.push({
              id:          l.id,
              name:        l.user?.name ?? 'Provider',
              bio:         l.description || l.title,
              rating:      l.ratingAvg ?? undefined,
              reviewCount: l.ratingCount,
              pricePaise:  l.pricePaise,
              priceLabel:  l.pricePaise > 0 ? `₹${(l.pricePaise / 100).toFixed(0)}/${l.priceUnit ?? 'session'}` : 'Contact for price',
              verified:    l.user?.kycTier !== 'bronze',
              category:    l.category,
              ownerId:     l.userId,
              listingId:   l.id,
            });
          }
        });
      }

      setProviders([...listingItems, ...merchantItems]);
    } catch {
      setProviders([]);
      setError('Could not reach the server. Pull to retry.');
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }, [pinCode, cat]);

  useEffect(() => { load(); }, [load]);

  function openBooking(item: ProviderItem) {
    if (item.listingId) {
      // Peer service listing — pass listingId + price as params
      router.push({
        pathname: '/(marketplace)/book/[id]' as never,
        params: { id: item.ownerId ?? item.id, listingId: item.listingId, pricePaise: String(item.pricePaise ?? 0) },
      } as never);
    } else {
      router.push(`/(marketplace)/book/${item.id}` as never);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack gap={3} align="center" style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>
          {category?.label ?? 'Services'}
        </Text>
      </HStack>

      <FlatList
        data={providers}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: spacing[4], gap: spacing[3], paddingBottom: spacing[16] }}
        ListHeaderComponent={loading ? <ActivityIndicator style={{ marginVertical: spacing[8] }} color={colors.brand[600]} /> : null}
        ListEmptyComponent={
          !loading ? (
            <VStack gap={3} align="center" style={{ marginTop: spacing[8], paddingHorizontal: spacing[6] }}>
              <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
                {error ?? 'No service providers yet in this category.'}
              </Text>
              <Pressable onPress={load} accessibilityRole="button" style={styles.retryBtn}>
                <Text variant="caption" style={{ color: colors.brand[600], fontWeight: '700' }}>Retry</Text>
              </Pressable>
            </VStack>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => openBooking(item)} accessibilityRole="button">
            <Card padding={4} elevation="sm">
              <HStack gap={3} align="center">
                <Avatar name={item.name} size="lg" />
                <VStack gap={1} style={{ flex: 1 }}>
                  <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
                    {item.name}
                  </Text>
                  {item.bio && <Text variant="caption" tone="secondary">{item.bio.slice(0, 60)}{item.bio.length > 60 ? '…' : ''}</Text>}
                  {item.rating != null && (
                  <HStack gap={1} align="center">
                    <Star size={12} color="#F59E0B" fill="#F59E0B" />
                    <Text variant="caption" style={{ fontWeight: '700', color: colors.surface.heading }}>
                      {item.rating.toFixed(1)}
                    </Text>
                    {item.reviewCount != null && <Text variant="caption" tone="secondary">({item.reviewCount})</Text>}
                  </HStack>
                  )}
                  {item.priceLabel && (
                    <Text variant="caption" style={{ color: colors.brand[600], fontWeight: '700' }}>
                      {item.priceLabel}
                    </Text>
                  )}
                </VStack>
                <VStack gap={1} align="center">
                  {item.verified && (
                    <View style={styles.verifiedBadge}>
                      <CheckCircle size={14} color={colors.semantic.success} />
                    </View>
                  )}
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.brand[600] }}>Book →</Text>
                </VStack>
              </HStack>
            </Card>
          </Pressable>
        )}
      />
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
  verifiedBadge: {
    width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.semantic.success + '18',
  },
  retryBtn: {
    paddingHorizontal: spacing[4], paddingVertical: spacing[2],
    borderRadius: 8, borderWidth: 1, borderColor: colors.brand[600],
  },
});

