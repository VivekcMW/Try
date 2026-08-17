import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus } from 'lucide-react-native';
import { Badge, Card, HStack, Text, VStack } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { colors, spacing } from '@lokul/ui-tokens';
import { FeatureGate } from '@/components/FeatureGate';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type ApiPost = { id: string; type: string; body?: string; createdAt: string; author: { name: string }; tags: string[] };

export default function LostFoundScreen() {
  return (
    <FeatureGate featureKey="lost_found">
      <LostFoundScreenInner />
    </FeatureGate>
  );
}

function LostFoundScreenInner() {
  const router  = useRouter();
  const pinCode = useOnboardingStore((s) => s.pin);
  const [filter,  setFilter]  = useState<'all' | 'lost' | 'found'>('all');
  const [allItems, setAllItems] = useState<ApiPost[]>([]);
  const [loading,  setLoading]  = useState(true);

  const load = useCallback(async () => {
    if (!pinCode) { setLoading(false); return; }
    setLoading(true);
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res  = await fetch(`${BASE}/api/mobile/posts?pinCode=${pinCode}&type=lost&limit=40`, { signal: ctrl.signal });
      const data = await res.json();
      setAllItems(Array.isArray(data?.items) ? data.items : []);
    } catch { setAllItems([]); } finally { clearTimeout(to); setLoading(false); }
  }, [pinCode]);

  useEffect(() => { load(); }, [load]);

  const items = filter === 'all' ? allItems : allItems.filter((i) => i.tags.includes(filter));

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack gap={3} align="center" style={styles.topBar}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/explore')} style={styles.backBtn} accessibilityRole="button">
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Lost &amp; Found</Text>
        <Pressable
          onPress={() => router.push('/(community)/create-lost-found' as never)}
          style={styles.createBtn}
          accessibilityRole="button"
          accessibilityLabel="Post lost or found item"
        >
          <Plus size={18} color="#fff" />
        </Pressable>
      </HStack>

      {/* Filter tabs */}
      <HStack gap={0} style={styles.filterRow}>
        {(['all', 'lost', 'found'] as const).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            accessibilityRole="button"
          >
            <Text
              variant="caption"
              style={{
                fontWeight: '700',
                textTransform: 'capitalize',
                color: filter === f ? colors.brand[600] : colors.surface.textSecondary,
              }}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </Pressable>
        ))}
      </HStack>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: spacing[4], gap: spacing[3], paddingBottom: spacing[16] }}
        ListEmptyComponent={
          <Text variant="body" tone="secondary" style={{ textAlign: 'center', marginTop: spacing[8] }}>
            No items here
          </Text>
        }
        renderItem={({ item }) => (
          <Card padding={4} elevation="sm">
            <VStack gap={2}>
              <HStack gap={2} align="center">
                <Badge
                  label={item.tags.includes('found') ? 'FOUND' : 'LOST'}
                  tone={item.tags.includes('found') ? 'success' : 'warning'}
                />
                <Text variant="caption" tone="secondary" style={{ marginLeft: 'auto' }}>
                  {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </Text>
              </HStack>
              <Text variant="body" style={{ color: colors.surface.heading, lineHeight: 22 }}>{item.body}</Text>
              <Text variant="caption" tone="secondary">By {item.author.name}</Text>
            </VStack>
          </Card>
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
  createBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.brand[600], alignItems: 'center', justifyContent: 'center',
  },
  filterRow: {
    borderBottomWidth: 0.5, borderBottomColor: colors.surface.border,
  },
  filterTab: {
    flex: 1, alignItems: 'center', paddingVertical: spacing[3],
    borderBottomWidth: 2.5, borderBottomColor: 'transparent',
  },
  filterTabActive: { borderBottomColor: colors.brand[600] },
});
