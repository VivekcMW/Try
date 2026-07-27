import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus } from 'lucide-react-native';
import { Badge, Card, HStack, Text, VStack } from '@/components/ui';
import { LockedFeatureCard } from '@/components/LockedFeatureCard';
import { useOnboardingStore } from '@/store/onboardingStore';
import { colors, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type ApiPost = { id: string; body?: string; createdAt: string; author: { name: string }; tags: string[] };

export default function NoticesScreen() {
  const router  = useRouter();
  const pinCode = useOnboardingStore((s) => s.pin);
  const societyId = useOnboardingStore((s) => s.societyId);
  const [items,   setItems]   = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!pinCode) { setLoading(false); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/api/mobile/posts?pinCode=${pinCode}&type=rwa_notice&limit=30`);
      const data = await res.json();
      setItems(data.items ?? []);
    } catch { setItems([]); } finally { setLoading(false); }
  }, [pinCode]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  if (!societyId) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <HStack gap={3} align="center" style={styles.topBar}>
          <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/explore')} style={styles.backBtn} accessibilityRole="button">
            <ArrowLeft size={20} color={colors.surface.heading} />
          </Pressable>
          <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>RWA Notices</Text>
        </HStack>
        <LockedFeatureCard
          title="Society feature"
          description="Map your community to see RWA notices, manage visitors, and participate in society polls."
          ctaLabel="Map my community"
          onPress={() => router.push('/(community-setup)')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack gap={3} align="center" style={styles.topBar}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/explore')} style={styles.backBtn} accessibilityRole="button">
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>RWA Notices</Text>
        <Pressable
          onPress={() => router.push('/(community)/create-notice' as never)}
          style={styles.createBtn}
          accessibilityRole="button"
          accessibilityLabel="Post notice"
        >
          <Plus size={18} color="#fff" />
        </Pressable>
      </HStack>

      <FlatList
        data={items}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ padding: spacing[4], gap: spacing[3], paddingBottom: spacing[16] }}
        ListEmptyComponent={
          <Text variant="body" tone="secondary" style={{ textAlign: 'center', marginTop: spacing[8] }}>
            No notices at the moment
          </Text>
        }
        renderItem={({ item }) => (
          <Card padding={4} elevation="sm">
            <VStack gap={2}>
              <Text variant="caption" tone="secondary">
                {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </Text>
              <Text variant="body" style={{ color: colors.surface.heading, lineHeight: 22 }}>
                {item.body}
              </Text>
              <Text variant="caption" tone="secondary">— {item.author.name}</Text>
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
});
