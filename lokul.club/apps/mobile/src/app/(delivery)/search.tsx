import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Clock, MapPin, Search as SearchIcon, Star } from 'lucide-react-native';
import { Card, HStack, Input, Text, VStack } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { STORES, QUICK_ITEMS, type Store, type QuickItem } from '@/data/delivery-catalog';

type ResultRow =
  | { kind: 'store'; data: Store }
  | { kind: 'item'; data: QuickItem };

export default function DeliverySearchScreen() {
  const router = useRouter();
  const stores = STORES;
  const quickItems = QUICK_ITEMS;
  const [query, setQuery] = useState('');

  const results = useMemo<ResultRow[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const matchedStores = stores.filter(
      (s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q),
    );
    const matchedItems = quickItems.filter(
      (i) => i.name.toLowerCase().includes(q) || i.store.toLowerCase().includes(q),
    );

    return [
      ...matchedStores.map((data): ResultRow => ({ kind: 'store', data })),
      ...matchedItems.map((data): ResultRow => ({ kind: 'item', data })),
    ];
  }, [query, stores, quickItems]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack style={styles.header} gap="md">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Input
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="Search stores or items…"
            leftIcon={<SearchIcon size={18} color={colors.textSecondary} />}
          />
        </View>
      </HStack>

      {query.trim().length === 0 ? (
        <VStack style={styles.emptyState} gap="sm">
          <SearchIcon size={40} color={colors.textSecondary} />
          <Text variant="body" tone="secondary">Start typing to search stores and items</Text>
        </VStack>
      ) : results.length === 0 ? (
        <VStack style={styles.emptyState} gap="sm">
          <Text variant="body" tone="secondary">No results for "{query}"</Text>
        </VStack>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(row) => `${row.kind}-${row.data.id}`}
          contentContainerStyle={styles.list}
          renderItem={({ item: row }) =>
            row.kind === 'store' ? (
              <Pressable onPress={() => router.push(`/(delivery)/store/${row.data.id}`)}>
                <Card style={styles.row}>
                  <HStack gap="md" style={{ alignItems: 'center' }}>
                    <View style={styles.storeIconSm}>
                      <MapPin size={18} color={colors.brand[600]} />
                    </View>
                    <VStack style={{ flex: 1 }}>
                      <Text variant="body" style={{ fontWeight: '600' }}>{row.data.name}</Text>
                      <HStack gap="sm">
                        <HStack gap="xs">
                          <Star size={11} color={colors.warning} fill={colors.warning} />
                          <Text variant="caption" tone="secondary">{row.data.rating}</Text>
                        </HStack>
                        <Text variant="caption" tone="secondary">{row.data.distance}</Text>
                      </HStack>
                    </VStack>
                    <Text variant="caption" style={{ color: colors.brand[600] }}>Store</Text>
                  </HStack>
                </Card>
              </Pressable>
            ) : (
              <Pressable onPress={() => router.push(`/(delivery)/item/${row.data.id}`)}>
                <Card style={styles.row}>
                  <HStack gap="md" style={{ alignItems: 'center' }}>
                    <View style={styles.itemEmoji}>
                      <Text style={{ fontSize: 22 }}>{row.data.image}</Text>
                    </View>
                    <VStack style={{ flex: 1 }}>
                      <Text variant="body" style={{ fontWeight: '600' }}>{row.data.name}</Text>
                      <HStack gap="sm">
                        <Text variant="caption" tone="secondary">{row.data.store}</Text>
                        <HStack gap="xs">
                          <Clock size={11} color={colors.textSecondary} />
                          <Text variant="caption" tone="secondary">{row.data.deliveryTime}</Text>
                        </HStack>
                      </HStack>
                    </VStack>
                    <Text variant="body" style={{ fontWeight: '600', color: colors.brand[600] }}>
                      ₹{Math.round(row.data.pricePaise / 100)}
                    </Text>
                  </HStack>
                </Card>
              </Pressable>
            )
          }
        />
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  row: { padding: spacing.md, marginBottom: spacing.sm },
  storeIconSm: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemEmoji: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
