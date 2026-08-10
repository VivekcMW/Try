// Global search screen — accessible from any context in the app
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Building2,
  Search,
  Star,
  Users,
  Wrench,
} from 'lucide-react-native';
import { Avatar, Badge, Card, HStack, Text, VStack } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type Merchant   = { id: string; kind: 'merchant';   name: string; category: string; ratingAvg?: number };
type Community  = { id: string; kind: 'community';  name: string; type: string; memberCount: number };
type Listing    = { id: string; kind: 'listing';    title: string; category: string; user: { id: string; name: string; avatarUrl?: string | null } };

type ResultItem = Merchant | Community | Listing;

function isMerchant(r: ResultItem): r is Merchant   { return r.kind === 'merchant'; }
function isCommunity(r: ResultItem): r is Community { return r.kind === 'community'; }
function isListing(r: ResultItem): r is Listing     { return r.kind === 'listing'; }

const RECENT_SEARCHES_KEY = 'lokul_recent_searches';

export default function SearchScreen() {
  const router   = useRouter();
  const pinCode  = useOnboardingStore((s) => s.pin);
  const inputRef = useRef<TextInput>(null);

  const [q,       setQ]       = useState('');
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(
    async (text: string) => {
      if (text.length < 2) { setResults([]); return; }
      // Abort previous request
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      const to = setTimeout(() => ctrl.abort(), 8000);
      setLoading(true);
      try {
        const res  = await fetch(`${BASE}/api/mobile/search?q=${encodeURIComponent(text)}&pinCode=${pinCode}`, { signal: ctrl.signal });
        const data = await res.json();
        const all: ResultItem[] = [
          ...(data?.results?.merchants   ?? []),
          ...(data?.results?.communities ?? []),
          ...(data?.results?.listings    ?? []),
        ];
        if (!ctrl.signal.aborted) setResults(all);
      } catch {
        if (!ctrl.signal.aborted) setResults([]);
      } finally {
        clearTimeout(to);
        if (!ctrl.signal.aborted) setLoading(false);
      }
    },
    [pinCode]
  );

  const handleChange = (text: string) => {
    setQ(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { search(text); }, 300);
  };

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();
  }, []);

  const handleClear = () => {
    setQ('');
    setResults([]);
    inputRef.current?.focus();
  };

  function navigateTo(item: ResultItem) {
    if (isMerchant(item))  router.push(`/(marketplace)/merchant/${item.id}` as never);
    if (isCommunity(item)) router.push(`/(groups)/home/${item.id}` as never);
    if (isListing(item))   router.push(`/(peer)/profile/${item.user.id}` as never);
  }

  function renderItem({ item }: { item: ResultItem }) {
    if (isMerchant(item)) {
      return (
        <Pressable onPress={() => navigateTo(item)} accessibilityRole="button">
          <Card padding={3} elevation="xs" style={styles.resultCard}>
            <HStack gap={3} align="center">
              <View style={styles.resultIcon}>
                <Building2 size={18} color={colors.brand[600]} />
              </View>
              <VStack gap={0.5} style={{ flex: 1 }}>
                <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
                  {item.name}
                </Text>
                <Text variant="caption" tone="secondary" style={{ textTransform: 'capitalize' }}>
                  {item.category}
                </Text>
              </VStack>
              {item.ratingAvg != null && item.ratingAvg > 0 && (
                <HStack gap={1} align="center">
                  <Star size={12} color="#FBBF24" fill="#FBBF24" />
                  <Text variant="caption" style={{ fontWeight: '700', color: colors.surface.textSecondary }}>
                    {item.ratingAvg.toFixed(1)}
                  </Text>
                </HStack>
              )}
              <Badge label="Business" tone="brand" />
            </HStack>
          </Card>
        </Pressable>
      );
    }

    if (isCommunity(item)) {
      return (
        <Pressable onPress={() => navigateTo(item)} accessibilityRole="button">
          <Card padding={3} elevation="xs" style={styles.resultCard}>
            <HStack gap={3} align="center">
              <View style={styles.resultIcon}>
                <Users size={18} color={colors.brand[600]} />
              </View>
              <VStack gap={0.5} style={{ flex: 1 }}>
                <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
                  {item.name}
                </Text>
                <Text variant="caption" tone="secondary">
                  {item.memberCount} members · {item.type}
                </Text>
              </VStack>
              <Badge label="Group" tone="neutral" />
            </HStack>
          </Card>
        </Pressable>
      );
    }

    if (isListing(item)) {
      return (
        <Pressable onPress={() => navigateTo(item)} accessibilityRole="button">
          <Card padding={3} elevation="xs" style={styles.resultCard}>
            <HStack gap={3} align="center">
              <Avatar name={item.user.name} size="sm" />
              <VStack gap={0.5} style={{ flex: 1 }}>
                <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
                  {item.title}
                </Text>
                <Text variant="caption" tone="secondary">{item.user.name}</Text>
              </VStack>
              <Badge label="Service" tone="success" />
            </HStack>
          </Card>
        </Pressable>
      );
    }

    return null;
  }

  const sectionHeaders: { [key: string]: string } = {
    merchant:  'Businesses',
    community: 'Groups & Communities',
    listing:   'Peer Services',
  };

  // Group results by kind for section headers
  const groupedSections: { kind: string; data: ResultItem[] }[] = [];
  const seen = new Set<string>();
  for (const item of results) {
    if (!seen.has(item.kind)) {
      seen.add(item.kind);
      groupedSections.push({ kind: item.kind, data: results.filter((r) => r.kind === item.kind) });
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Search bar */}
      <HStack gap={2} align="center" style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <HStack gap={2.5} align="center" style={styles.searchBox}>
          <Search size={18} color={colors.surface.textSecondary} />
          <TextInput
            ref={inputRef}
            value={q}
            onChangeText={handleChange}
            placeholder="Search merchants, groups, services…"
            placeholderTextColor={colors.surface.textSecondary}
            autoFocus
            returnKeyType="search"
            style={styles.searchInput}
          />
          {q.length > 0 && (
            <Pressable onPress={handleClear} accessibilityRole="button" accessibilityLabel="Clear">
              <View style={styles.clearBtn}>
                <Text variant="caption" style={{ color: colors.surface.textSecondary }}>✕</Text>
              </View>
            </Pressable>
          )}
        </HStack>
      </HStack>

      {/* Results */}
      {q.length >= 2 ? (
        loading ? (
          <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
        ) : results.length === 0 ? (
          <VStack gap={3} align="center" style={{ marginTop: spacing[16] }}>
            <Search size={40} color={colors.gray[300]} />
            <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
              No results for &ldquo;{q}&rdquo;
            </Text>
            <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
              Try searching with different keywords
            </Text>
          </VStack>
        ) : (
          <FlatList
            data={groupedSections}
            keyExtractor={(s) => s.kind}
            contentContainerStyle={{ padding: spacing[4], gap: spacing[4], paddingBottom: spacing[16] }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: section }) => (
              <VStack gap={2}>
                <Text
                  variant="caption"
                  style={{ fontWeight: '700', color: colors.surface.textSecondary, letterSpacing: 0.5 }}
                >
                  {sectionHeaders[section.kind] ?? section.kind.toUpperCase()}
                </Text>
                {section.data.map((item) => (
                  <View key={item.id}>{renderItem({ item })}</View>
                ))}
              </VStack>
            )}
          />
        )
      ) : (
        <VStack gap={3} align="center" style={{ marginTop: spacing[20] }}>
          <Wrench size={36} color={colors.gray[300]} />
          <Text variant="body" tone="secondary">Start typing to search</Text>
        </VStack>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.background },
  topBar: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2.5],
    borderBottomWidth: 0.5,
    borderBottomColor: colors.surface.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center',
  },
  searchBox: {
    flex: 1,
    backgroundColor: colors.surface.surfaceMuted,
    borderRadius: radius.full,
    paddingHorizontal: spacing[4],
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: colors.surface.heading,
    fontSize: 14,
    padding: 0,
  },
  clearBtn: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.gray[300],
    alignItems: 'center', justifyContent: 'center',
  },
  resultCard: { marginBottom: 0 },
  resultIcon: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: colors.brand[50] ?? '#EEF4FB',
    alignItems: 'center', justifyContent: 'center',
  },
});
