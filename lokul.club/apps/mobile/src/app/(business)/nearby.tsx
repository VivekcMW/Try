// PRD §06 — Customer-facing nearby businesses list (used from Discover)
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';
import { Badge, Card, HStack, RadiusSelector, Text, VStack } from '@/components/ui';
import { type MerchantType } from '@/store/businessStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type ApiMerchant = {
  id: string; name: string; emoji?: string; category?: string; merchantType?: string;
  rating?: number; reviewCount?: number; isOpen?: boolean;
};

type FilterKey = 'all' | MerchantType;

const FILTER_OPTS: { label: string; value: FilterKey }[] = [
  { label: 'All', value: 'all' },
  { label: 'Retail', value: 'retail' },
  { label: 'Food', value: 'food' },
  { label: 'Beauty & Health', value: 'appointment' },
  { label: 'Services', value: 'services' },
  { label: 'Education', value: 'education' },
];

export default function NearbyBusinesses() {
  const router  = useRouter();
  const pinCode = useOnboardingStore((s) => s.pin);
  const [filter,  setFilter]  = useState<FilterKey>('all');
  const [allBiz,  setAllBiz]  = useState<ApiMerchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!pinCode) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${BASE}/api/mobile/merchants?pinCode=${pinCode}`);
      const data = await res.json();
      setAllBiz(data.merchants ?? []);
    } catch {
      setAllBiz([]);
      setError('Could not load nearby businesses. Check your connection and try again.');
    } finally { setLoading(false); }
  }, [pinCode]);

  useEffect(() => { load(); }, [load]);

  const visible = filter === 'all'
    ? allBiz
    : allBiz.filter((b) => b.merchantType === filter || b.category === filter);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>Shops near you</Text>
        <RadiusSelector compact />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={{ paddingHorizontal: spacing[3], gap: spacing[2] }}
      >
        {FILTER_OPTS.map((opt) => (
          <Pressable
            key={opt.value}
            onPress={() => setFilter(opt.value)}
            style={[styles.filterChip, filter === opt.value && styles.filterChipActive]}
          >
            <Text
              variant="caption"
              style={{ fontWeight: '700', color: filter === opt.value ? '#fff' : colors.surface.textSecondary }}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scroll}>
        {loading ? <ActivityIndicator style={{ marginTop: spacing[8] }} /> : (
        <VStack gap={3}>
          {visible.map((b) => (
            <Pressable key={b.id} onPress={() => router.push(`/(business)/storefront/${b.id}` as never)}>
              <Card padding={3.5} elevation="xs" bordered>
                <HStack gap={3} align="center">
                  <View style={styles.emoji}>
                    <Text style={{ fontSize: 26 }}>{b.emoji ?? '🏪'}</Text>
                  </View>
                  <VStack gap={1} style={{ flex: 1 }}>
                    <HStack gap={2} align="center" style={{ justifyContent: 'space-between' }}>
                      <Text variant="body" style={{ fontWeight: '700', flex: 1 }}>{b.name}</Text>
                      {b.isOpen ? <Badge label="Open" tone="success" /> : <Badge label="Closed" tone="neutral" />}
                    </HStack>
                    <HStack gap={2} align="center">
                      <HStack gap={1} align="center">
                        <Star size={12} color="#F59E0B" fill="#F59E0B" />
                        <Text variant="caption" style={{ fontWeight: '700' }}>{(b.rating ?? 0).toFixed(1)}</Text>
                      </HStack>
                      <Text variant="caption" tone="secondary">({b.reviewCount ?? 0})</Text>
                    </HStack>
                  </VStack>
                </HStack>
              </Card>
            </Pressable>
          ))}
          {visible.length === 0 && (
            <Text variant="body" tone="secondary" style={{ textAlign: 'center', marginTop: spacing[8] }}>No businesses found</Text>
          )}
        </VStack>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[2],
    backgroundColor: colors.surface.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surface.border,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  filterBar: {
    backgroundColor: colors.surface.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surface.border,
    paddingVertical: spacing[2],
    flexGrow: 0,
  },
  filterChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: radius.full,
    backgroundColor: colors.gray[100],
  },
  filterChipActive: { backgroundColor: colors.brand[600] },
  scroll: { padding: spacing[4], paddingBottom: spacing[10] },
  emoji: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
