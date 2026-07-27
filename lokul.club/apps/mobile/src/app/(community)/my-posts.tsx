import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, FileText, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Button, Card, HStack, Screen, Text, VStack } from '@/components/ui';
import { useWalletStore } from '@/store/walletStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type ApiPost = { id: string; type: string; body?: string; createdAt: string; commentCount: number; reactionCount: number };

export default function MyPostsScreen() {
  const { t }  = useTranslation('settings');
  const router = useRouter();
  const userId = useWalletStore((s) => s.userId);
  const [items,   setItems]   = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/api/mobile/posts?userId=${userId}&limit=40`);
      const data = await res.json();
      setItems(data.items ?? []);
    } catch { setItems([]); } finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  if (!loading && items.length > 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.surfaceMuted }} edges={['top']}>
        <HStack gap={3} align="center" style={styles.topBar}>
          <Pressable
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/explore' as never)}
            style={styles.backBtn}
            accessibilityRole="button"
            hitSlop={10}
          >
            <ArrowLeft size={20} color={colors.surface.heading} />
          </Pressable>
          <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>{t('my_posts_title')}</Text>
        </HStack>
        <FlatList
          data={items}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ padding: spacing[4], gap: spacing[3], paddingBottom: spacing[16] }}
          renderItem={({ item }) => (
            <Card padding={4} elevation="sm">
              <VStack gap={1}>
                <Text variant="caption" style={{ color: colors.brand[600], fontWeight: '700', textTransform: 'capitalize' }}>
                  {item.type.replace('_', ' ')}
                </Text>
                <Text variant="body" style={{ color: colors.surface.heading, lineHeight: 22 }} numberOfLines={3}>
                  {item.body}
                </Text>
                <Text variant="caption" tone="secondary">
                  {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  {'  ·  '}{item.reactionCount} likes · {item.commentCount} comments
                </Text>
              </VStack>
            </Card>
          )}
        />
        </SafeAreaView>
    );
  }

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
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>{t('my_posts_title')}</Text>
      </HStack>
      <Screen scroll>
      <VStack gap={5} style={styles.wrap}>

        <View style={styles.emptyCard}>
          <View style={styles.iconWrap}>
            <FileText size={24} color={colors.brand[700]} />
          </View>
          <VStack gap={1} align="center">
            <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
              {t('my_posts_empty')}
            </Text>
            <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
              {t('my_posts_subtitle')}
            </Text>
          </VStack>

          <Button
            label={t('my_posts_empty_cta')}
            leftIcon={<Plus size={16} color="#fff" />}
            onPress={() => router.push('/(tabs)/create' as never)}
            fullWidth
          />
        </View>
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
  wrap: {
    paddingTop: spacing[3],
    gap: spacing[4],
  },
  emptyCard: {
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface.background,
    padding: spacing[5],
    gap: spacing[3],
    alignItems: 'center',
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
