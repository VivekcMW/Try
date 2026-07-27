/**
 * Real Estate search
 * Route: /(realestate)/search
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Building, MapPin, Search as SearchIcon } from 'lucide-react-native';
import { Card, HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { useOnboardingStore } from '@/store/onboardingStore';
import { formatPrice, type PropertyDealType } from './index';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type ApiProperty = {
  id: string;
  title: string;
  dealType: PropertyDealType;
  buildingType: string;
  bhk: string | null;
  location: string;
  pricePaise: number;
  priceUnit: string | null;
};

export default function RealEstateSearchScreen() {
  const router = useRouter();
  const pinCode = useOnboardingStore((s) => s.pin);
  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    if (!pinCode) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/realestate/properties?pinCode=${pinCode}`);
      const data = await res.json();
      setProperties(data.properties ?? []);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [pinCode]);

  useEffect(() => { load(); }, [load]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return properties;
    return properties.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.buildingType.toLowerCase().includes(q) ||
        (p.bhk ?? '').toLowerCase().includes(q),
    );
  }, [properties, query]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <View style={styles.searchBox}>
          <SearchIcon size={16} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by location, BHK, or type"
            placeholderTextColor={colors.textDisabled}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
        </View>
      </HStack>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      ) : (
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Building size={40} color={colors.textSecondary} />
            <Text variant="body" style={{ fontWeight: '600', marginTop: spacing.md }}>No matching properties</Text>
          </Card>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/(realestate)/property/${item.id}`)}>
            <Card style={styles.card}>
              <Text variant="body" style={{ fontWeight: '600' }}>{item.title}</Text>
              <HStack gap="xs" style={{ marginTop: spacing.xs }}>
                <MapPin size={12} color={colors.textSecondary} />
                <Text variant="caption" tone="secondary">{item.location}</Text>
              </HStack>
              <Text variant="body" style={{ fontWeight: '700', color: colors.brand[600], marginTop: spacing.xs }}>
                {formatPrice(item.pricePaise, item.dealType)}{item.priceUnit ?? ''}
              </Text>
            </Card>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
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
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceMuted,
  },
  searchInput: { flex: 1, paddingVertical: spacing.sm, fontSize: 15, color: colors.foreground },
  content: { padding: spacing.lg, paddingBottom: 100 },
  card: { padding: spacing.md },
  emptyCard: { padding: spacing[6] ?? 32, alignItems: 'center' },
});
