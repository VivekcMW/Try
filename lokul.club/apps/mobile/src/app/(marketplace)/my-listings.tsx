import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ListPlus, PackagePlus, Star } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Avatar, Button, Card, HStack, Screen, Text, VStack } from '@/components/ui';
import { useWalletStore } from '@/store/walletStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type ApiListing = {
  id: string; name: string; category?: string; priceLabel?: string;
  rating?: number; reviewCount?: number; active?: boolean;
};

export default function MyListingsScreen() {
  const { t }   = useTranslation('settings');
  const router  = useRouter();
  const userId  = useWalletStore((s) => s.userId);
  const [listings, setListings] = useState<ApiListing[]>([]);
  const [loading,  setLoading]  = useState(true);

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/api/mobile/service-listings?sellerId=${userId}`);
      const data = await res.json();
      setListings(data.items ?? []);
    } catch { setListings([]); } finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const isEmpty = !loading && listings.length === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.background }} edges={['top']}>
      <HStack gap={3} align="center" style={styles.topBar}>
        <Pressable
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/explore' as never)}
          style={styles.backBtn}
          accessibilityRole="button"
          hitSlop={10}
        >
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>{t('my_listings_title')}</Text>
      </HStack>
      <Screen scroll>
      <VStack gap={5} style={styles.wrap}>

        {loading ? (
          <ActivityIndicator color={colors.brand[600]} />
        ) : null}

        {isEmpty ? (
        <View style={styles.emptyCard}>
          <View style={styles.iconWrap}>
            <ListPlus size={24} color={colors.brand[700]} />
          </View>
          <VStack gap={1} align="center">
            <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
              {t('my_listings_empty')}
            </Text>
            <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
              {t('my_listings_subtitle')}
            </Text>
          </VStack>
          <Button
            label={t('my_listings_empty_cta')}
            leftIcon={<PackagePlus size={16} color="#fff" />}
            onPress={() => router.push('/(marketplace)')}
            fullWidth
          />
        </View>
        ) : null}

        {!loading && listings.length > 0 ? (
          <FlatList
            data={listings}
            keyExtractor={(l) => l.id}
            scrollEnabled={false}
            contentContainerStyle={{ gap: spacing[3] }}
            renderItem={({ item }) => (
              <Pressable onPress={() => router.push(`/(marketplace)/merchant/${item.id}` as never)}>
                <Card padding={4} elevation="xs" bordered>
                  <HStack gap={3} align="center">
                    <Avatar name={item.name} size="md" />
                    <VStack gap={0.5} style={{ flex: 1 }}>
                      <Text variant="body" style={{ fontWeight: '700' }}>{item.name}</Text>
                      {Boolean(item.category) && <Text variant="caption" tone="secondary">{item.category}</Text>}
                      {Boolean(item.priceLabel) && (
                        <Text variant="caption" style={{ color: colors.brand[600], fontWeight: '700' }}>{item.priceLabel}</Text>
                      )}
                    </VStack>
                    {item.rating != null && (
                      <HStack gap={1} align="center">
                        <Star size={12} color="#F59E0B" fill="#F59E0B" />
                        <Text variant="caption" style={{ fontWeight: '700' }}>{item.rating.toFixed(1)}</Text>
                      </HStack>
                    )}
                  </HStack>
                </Card>
              </Pressable>
            )}
          />
        ) : null}
      </VStack>
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.surface.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrap: { paddingTop: spacing[3], gap: spacing[4] },
  emptyCard: {
    borderWidth: 1, borderColor: colors.surface.border, borderRadius: radius.lg,
    backgroundColor: colors.surface.background, padding: spacing[5], gap: spacing[3], alignItems: 'center',
  },
  iconWrap: {
    width: 52, height: 52, borderRadius: radius.lg,
    backgroundColor: colors.brand[50], alignItems: 'center', justifyContent: 'center',
  },
});
