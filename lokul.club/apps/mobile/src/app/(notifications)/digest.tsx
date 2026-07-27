// PRD §08 — Calm daily digest
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Sunrise, TrendingUp } from 'lucide-react-native';
import { Card, HStack, Text, VStack } from '@/components/ui';
import { useNotificationStore, CATEGORY_META } from '@/store/notificationStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

export default function DigestScreen() {
  const router = useRouter();
  const inbox = useNotificationStore((s) => s.inbox);

  const today = useMemo(() => {
    const cutoff = Date.now() - 24 * 3600000;
    return inbox.filter((n) => n.ts >= cutoff);
  }, [inbox]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof today>();
    today.forEach((n) => {
      const arr = map.get(n.category) ?? [];
      arr.push(n);
      map.set(n.category, arr);
    });
    return Array.from(map.entries());
  }, [today]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>Today’s digest</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card padding={5} elevation="sm" bordered style={{ backgroundColor: colors.brand[700], borderColor: colors.brand[700] }}>
          <HStack gap={3} align="center">
            <Sunrise size={28} color="#FCD34D" />
            <VStack gap={0.5} style={{ flex: 1 }}>
              <Text variant="caption" style={{ color: '#FFFFFFCC', fontWeight: '700', letterSpacing: 0.6 }}>GOOD MORNING</Text>
              <Text variant="h2" style={{ color: '#fff', fontWeight: '800' }}>{today.length} updates around you</Text>
            </VStack>
          </HStack>
          <Text variant="caption" style={{ color: '#FFFFFFCC', marginTop: spacing[3] }}>
            We keep things calm. One summary, once a day. No buzzes for things that can wait.
          </Text>
        </Card>

        <VStack gap={3} style={{ marginTop: spacing[5] }}>
          {grouped.map(([cat, items]) => {
            const meta = CATEGORY_META[cat as keyof typeof CATEGORY_META];
            return (
              <Card key={cat} padding={4} elevation="none" bordered>
                <HStack gap={2} align="center" style={{ justifyContent: 'space-between' }}>
                  <HStack gap={2} align="center">
                    <View style={[styles.dot, { backgroundColor: meta.tint }]} />
                    <Text variant="body" style={{ fontWeight: '800' }}>{meta.label}</Text>
                  </HStack>
                  <Text variant="caption" style={{ color: meta.tint, fontWeight: '700' }}>{items.length} updates</Text>
                </HStack>
                <VStack gap={1.5} style={{ marginTop: spacing[3] }}>
                  {items.slice(0, 3).map((n) => (
                    <HStack key={n.id} gap={2} align="center">
                      <Text style={{ fontSize: 16 }}>{n.emoji ?? '•'}</Text>
                      <Text variant="caption" style={{ flex: 1 }} numberOfLines={1}>{n.title}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Card>
            );
          })}
          {grouped.length === 0 && (
            <Card padding={6} elevation="none" bordered style={{ alignItems: 'center' }}>
              <TrendingUp size={28} color={colors.surface.textSecondary} />
              <Text variant="body" tone="secondary" style={{ marginTop: spacing[2] }}>Nothing notable today. A calm day is a good day.</Text>
            </Card>
          )}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    backgroundColor: colors.surface.background,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.surface.border,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing[4], paddingBottom: spacing[10] },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
