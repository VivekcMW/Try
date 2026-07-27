// PRD §08 — Group buy listing / index
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Users } from 'lucide-react-native';
import { Badge, Card, HStack, Text, VStack } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type ApiGroupBuy = {
  id: string; title: string; emoji?: string; unit: string;
  pricePerUnit: number; marketPrice?: number; targetQty: number; minQty: number;
  currentQty: number; closesAt: string; status: string;
  organizer: { name: string };
};

export default function GroupBuyIndex() {
  const router  = useRouter();
  const pinCode = useOnboardingStore((s) => s.pin);
  const [items,   setItems]   = useState<ApiGroupBuy[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!pinCode) { setLoading(false); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/api/mobile/group-buys?pinCode=${pinCode}`);
      const data = await res.json();
      setItems(data.items ?? []);
    } catch { setItems([]); } finally { setLoading(false); }
  }, [pinCode]);

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/explore')} hitSlop={10} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>Group buys</Text>
        <Pressable onPress={() => router.push('/(groupbuy)/create' as never)} hitSlop={10} style={styles.iconBtn}>
          <Plus size={22} color={colors.brand[700]} />
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      ) : (
      <ScrollView contentContainerStyle={styles.scroll}>
        <VStack gap={3}>
          {items.map((gb) => {
            const pct = Math.min(100, Math.round((gb.currentQty / gb.targetQty) * 100));
            const hoursLeft = Math.max(0, Math.round((new Date(gb.closesAt).getTime() - Date.now()) / 3600000));
            const savings = gb.marketPrice && gb.marketPrice > 0
              ? Math.round(((gb.marketPrice - gb.pricePerUnit) / gb.marketPrice) * 100)
              : 0;
            const locked = gb.currentQty >= gb.minQty;
            return (
              <Pressable key={gb.id} onPress={() => router.push(`/(groupbuy)/${gb.id}` as never)}>
                <Card padding={4} elevation="xs" bordered>
                  <HStack gap={3} align="center">
                    <View style={styles.thumb}>
                      <Text style={{ fontSize: 28 }}>{gb.emoji ?? '🛒'}</Text>
                    </View>
                    <VStack gap={1} style={{ flex: 1 }}>
                      <Text variant="body" style={{ fontWeight: '800' }} numberOfLines={2}>{gb.title}</Text>
                      <HStack gap={2} align="center">
                        <Text variant="h3" style={{ color: colors.brand[700], fontWeight: '800' }}>₹{gb.pricePerUnit}</Text>
                        {gb.marketPrice != null && (
                          <Text variant="caption" tone="secondary" style={{ textDecorationLine: 'line-through' }}>₹{gb.marketPrice}</Text>
                        )}
                        {savings > 0 && <Badge label={`-${savings}%`} tone="success" />}
                      </HStack>
                      <Text variant="caption" tone="secondary">per {gb.unit} · by {gb.organizer.name}</Text>
                    </VStack>
                  </HStack>

                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: locked ? '#16A34A' : colors.brand[600] }]} />
                  </View>
                  <HStack gap={2} align="center" style={{ marginTop: spacing[2], justifyContent: 'space-between' }}>
                    <HStack gap={1} align="center">
                      <Users size={12} color={colors.surface.textSecondary} />
                      <Text variant="caption" tone="secondary">
                        {gb.currentQty}/{gb.targetQty} {gb.unit} · min {gb.minQty}
                      </Text>
                    </HStack>
                    {locked ? (
                      <Badge label="DEAL LOCKED" tone="success" />
                    ) : (
                      <Text variant="caption" style={{ fontWeight: '700', color: hoursLeft < 12 ? colors.semantic.danger : colors.surface.textSecondary }}>
                        {hoursLeft}h left
                      </Text>
                    )}
                  </HStack>
                </Card>
              </Pressable>
            );
          })}
        </VStack>
      </ScrollView>
      )}
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
  thumb: {
    width: 56, height: 56, borderRadius: radius.md,
    backgroundColor: colors.brand[50],
    alignItems: 'center', justifyContent: 'center',
  },
  barTrack: { marginTop: spacing[3], height: 6, backgroundColor: colors.gray[200], borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
});
