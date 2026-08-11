import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Search, Zap } from 'lucide-react-native';
import { Badge, Card, HStack, Text, VStack } from '@/components/ui';
import { AdSlot } from '@/components/AdSlot';
import type { ClassifiedCategory } from '@/data/community-seed';
import { useOnboardingStore } from '@/store/onboardingStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const CATEGORIES: { id: ClassifiedCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'furniture', label: 'Furniture' },
  { id: 'kids', label: 'Kids' },
  { id: 'books', label: 'Books' },
  { id: 'sports', label: 'Sports' },
  { id: 'appliances', label: 'Appliances' },
  { id: 'other', label: 'Other' },
];

const COND_TONE: Record<string, 'success' | 'warning' | 'neutral'> = {
  new: 'success', like_new: 'success', good: 'warning', fair: 'neutral', poor: 'neutral',
};

const PROMOTED_ITEMS = [
  { id: 'promo-1', title: 'LG 32" Smart TV (2023)', description: 'Like-new, 1 year warranty remaining', priceRs: 18500, seller: { name: 'Rahul M.' }, condition: 'like_new', category: 'electronics' },
  { id: 'promo-2', title: 'Teak Wood Dining Table (6-seater)', description: 'Solid teak, minor scratches', priceRs: 22000, seller: { name: 'Sunita K.' }, condition: 'good', category: 'furniture' },
] as const;

type ApiClassified = {
  id: string; title: string; description?: string; priceRs?: number;
  category: string; condition?: string; status: string;
  seller: { name: string };
};

export default function ClassifiedsIndexScreen() {
  const router       = useRouter();
  const pinCode      = useOnboardingStore((s) => s.pin);
  const [query,          setQuery]          = useState('');
  const [activeCategory, setActiveCategory] = useState<ClassifiedCategory | 'all'>('all');
  const [items,   setItems]   = useState<ApiClassified[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!pinCode) { setLoading(false); return; }
    setLoading(true);
    try {
      let url = `${BASE}/api/mobile/classifieds?pinCode=${pinCode}`;
      if (activeCategory !== 'all') url += `&category=${activeCategory}`;
      const res  = await fetch(url);
      const data = await res.json();
      setItems(data.items ?? []);
    } catch { setItems([]); } finally { setLoading(false); }
  }, [pinCode, activeCategory]);

  useEffect(() => { load(); }, [load]);

  const baseFiltered = items.filter((c) => {
    const q = query.toLowerCase();
    return (
      (c.title ?? '').toLowerCase().includes(q) ||
      (c.seller?.name ?? '').toLowerCase().includes(q)
    );
  });

  // Inject an ad placeholder every 5 listings
  type ListItem = ApiClassified | { kind: 'ad'; id: string };
  const filtered: ListItem[] = baseFiltered.reduce<ListItem[]>((acc, item, idx) => {
    acc.push(item);
    if ((idx + 1) % 5 === 0) acc.push({ kind: 'ad', id: `__ad_${idx}__` });
    return acc;
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <HStack gap={3} align="center" style={styles.topBar}>
        <VStack gap={0} style={{ flex: 1 }}>
          <Text variant="h3" style={{ color: colors.surface.heading }}>Classifieds</Text>
          <Text variant="caption" tone="secondary">Buy & sell within the community</Text>
        </VStack>
        <Pressable
          onPress={() => router.push('/(classifieds)/create' as any)}
          style={styles.createBtn}
          accessibilityRole="button"
        >
          <Plus size={18} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Sell</Text>
        </Pressable>
      </HStack>

      {/* Search */}
      <View style={styles.searchWrap}>
        <HStack gap={2.5} align="center" style={styles.searchContainer}>
          <Search size={18} color={colors.surface.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search listings…"
            placeholderTextColor={colors.surface.textSecondary}
            value={query}
            onChangeText={setQuery}
          />
        </HStack>
      </View>

      {/* Category filter */}
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.catScroll}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setActiveCategory(item.id as ClassifiedCategory | 'all')}
            style={[styles.catChip, activeCategory === item.id && styles.catChipActive]}
          >
            <Text
              variant="caption"
              style={{ fontWeight: '700', color: activeCategory === item.id ? '#fff' : colors.surface.foreground }}
            >
              {item.label}
            </Text>
          </Pressable>
        )}
        style={{ maxHeight: 48 }}
      />

      {/* Listings */}
      <FlatList
        data={filtered}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: spacing[4], gap: spacing[3], paddingBottom: spacing[16] }}
        ListHeaderComponent={
          <VStack gap={3} style={{ marginBottom: spacing[1] }}>
            {/* Promoted listings */}
            <HStack gap={1.5} align="center">
              <Zap size={14} color="#B45309" />
              <Text variant="caption" style={{ fontWeight: '700', color: '#B45309' }}>Promoted Listings</Text>
            </HStack>
            {PROMOTED_ITEMS.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => router.push(`/(classifieds)/listing/${item.id}` as never)}
                accessibilityRole="button"
              >
                <Card padding={0} elevation="sm" style={styles.promotedCard}>
                  <HStack gap={0} align="stretch">
                    <View style={[styles.listingColor, { backgroundColor: '#FEF3C7' }]} />
                    <VStack gap={1.5} style={{ flex: 1, padding: spacing[3] }}>
                      <HStack gap={2} align="center">
                        <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading, flex: 1 }}>
                          {item.title}
                        </Text>
                        <View style={styles.promotedBadge}>
                          <Zap size={9} color="#B45309" />
                          <Text style={{ fontSize: 9, fontWeight: '800', color: '#B45309' }}>PROMOTED</Text>
                        </View>
                      </HStack>
                      <Text variant="caption" tone="secondary" numberOfLines={1}>{item.description}</Text>
                      <HStack gap={2} align="center">
                        <Badge label={item.condition.replace('_', ' ')} tone={COND_TONE[item.condition] ?? 'neutral'} />
                        <Text variant="caption" tone="secondary">{item.seller.name}</Text>
                      </HStack>
                      <Text variant="body" style={{ fontWeight: '800', color: colors.brand[600] }}>
                        ₹{item.priceRs.toLocaleString()}
                      </Text>
                    </VStack>
                  </HStack>
                </Card>
              </Pressable>
            ))}
            <View style={styles.sectionDivider} />
          </VStack>
        }
        ListEmptyComponent={
          <Text variant="body" tone="secondary" style={{ textAlign: 'center', marginTop: spacing[8] }}>
            No listings found
          </Text>
        }
        renderItem={({ item }) => {
          if ('kind' in item && item.kind === 'ad') {
            return <View style={{ marginHorizontal: spacing[4], marginBottom: spacing[3] }}><AdSlot placement="marketplace" pinCode={pinCode ?? undefined} /></View>;
          }
          const c = item as ApiClassified;
          return (
          <Pressable onPress={() => router.push(`/(classifieds)/listing/${c.id}` as never)} accessibilityRole="button">
            <Card padding={0} elevation="sm">
              <HStack gap={0} align="stretch">
                {/* Color block */}
                <View style={[styles.listingColor, { backgroundColor: colors.brand[100] }]} />
                <VStack gap={1.5} style={{ flex: 1, padding: spacing[3] }}>
                  <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
                    {c.title}
                  </Text>
                  <Text variant="caption" tone="secondary" numberOfLines={1}>
                    {c.description}
                  </Text>
                  <HStack gap={2} align="center">
                    <Badge
                      label={(c.condition ?? 'used').replace('_', ' ')}
                      tone={COND_TONE[c.condition ?? ''] ?? 'neutral'}
                    />
                    <Text variant="caption" tone="secondary">{c.seller.name}</Text>
                  </HStack>
                  <Text variant="body" style={{ fontWeight: '800', color: colors.brand[600] }}>
                    {!c.priceRs ? 'Free' : `₹${c.priceRs.toLocaleString()}`}
                  </Text>
                </VStack>
              </HStack>
            </Card>
          </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.background },
  topBar: {
    paddingHorizontal: spacing[5], paddingTop: spacing[5], paddingBottom: spacing[3],
  },
  createBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[1],
    backgroundColor: colors.brand[600], paddingHorizontal: spacing[4],
    paddingVertical: spacing[2], borderRadius: 20,
  },
  searchWrap: { paddingHorizontal: spacing[4], paddingBottom: spacing[2] },
  searchContainer: {
    backgroundColor: colors.surface.surfaceMuted,
    borderRadius: radius.full,
    paddingHorizontal: spacing[4],
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.surface.heading,
    padding: 0,
  },
  catScroll: { paddingHorizontal: spacing[4], paddingBottom: spacing[2], gap: spacing[2] },
  catChip: {
    paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: 20,
    backgroundColor: colors.gray[100], borderWidth: 1.5, borderColor: 'transparent',
  },
  catChipActive: { backgroundColor: colors.brand[600], borderColor: colors.brand[600] },
  listingColor: { width: 8, borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
  promotedCard: { borderWidth: 1.5, borderColor: '#F59E0B' },
  promotedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    backgroundColor: '#FEF3C7', paddingHorizontal: 5, paddingVertical: 2,
    borderRadius: 6, borderWidth: 1, borderColor: '#F59E0B',
  },
  sectionDivider: { height: 1, backgroundColor: colors.surface.border, marginVertical: spacing[1] },
});
