import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Plus, Users } from 'lucide-react-native';
import { Badge, Card, HStack, Text, VStack } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { colors, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type ApiPost = {
  id: string; type: string; body?: string; createdAt: string;
  tags: string[]; author: { name: string };
};

export default function EventsScreen() {
  const router  = useRouter();
  const pinCode = useOnboardingStore((s) => s.pin);
  const [items,   setItems]   = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!pinCode) { setLoading(false); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/api/mobile/posts?pinCode=${pinCode}&type=event&limit=30`);
      const data = await res.json();
      setItems(data.items ?? []);
    } catch { setItems([]); } finally { setLoading(false); }
  }, [pinCode]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack gap={3} align="center" style={styles.topBar}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/explore')} style={styles.backBtn} accessibilityRole="button">
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Community Events</Text>
        <Pressable
          onPress={() => router.push('/(community)/event-create' as never)}
          style={styles.createBtn}
          accessibilityRole="button"
          accessibilityLabel="Create event"
        >
          <Plus size={18} color="#fff" />
        </Pressable>
      </HStack>

      <FlatList
        data={items}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ padding: spacing[4], gap: spacing[3], paddingBottom: spacing[16] }}
        ListEmptyComponent={
          <Text variant="body" tone="secondary" style={{ textAlign: 'center', marginTop: spacing[8] }}>No events yet</Text>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/(community)/event/${item.id}` as never)} accessibilityRole="button">
            <Card padding={4} elevation="sm">
              <VStack gap={2}>
                <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
                  {item.body?.slice(0, 60) ?? 'Event'}
                </Text>
                <HStack gap={3} align="center">
                  <HStack gap={1} align="center">
                    <Calendar size={13} color={colors.brand[600]} />
                    <Text variant="caption" style={{ color: colors.brand[600] }}>
                      {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </Text>
                  </HStack>
                  <HStack gap={1} align="center">
                    <Users size={13} color={colors.gray[400]} />
                    <Text variant="caption" tone="secondary">{item.author.name}</Text>
                  </HStack>
                </HStack>
                {item.tags.length > 0 && <Badge label={item.tags[0]} tone="neutral" />}
              </VStack>
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
  createBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.brand[600], alignItems: 'center', justifyContent: 'center',
  },
});
