// PRD §05 — Reseller dashboard
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Package, Plus, TrendingUp } from 'lucide-react-native';
import { Badge, Button, Card, HStack, Text, VStack } from '@/components/ui';
import { type ResellerListing } from '@/data/peer-seed';
import { usePeerStore } from '@/store/peerRoleStore';
import { useVerificationStore } from '@/store/verificationStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { Header, Stat, ActivateScreen } from './cook';

export default function ResellerDashboard() {
  const router = useRouter();
  const reseller = usePeerStore((s) => s.roles.reseller);
  const activate = usePeerStore((s) => s.activate);
  const tier = useVerificationStore((s) => s.tier);
  // No reseller-inventory model exists yet (Classifieds tracks single one-off
  // sales, not wholesale stock/margin) — starts honestly empty, not seeded.
  const [items, setItems] = useState<ResellerListing[]>([]);

  if (!reseller.active) {
    return (
      <ActivateScreen
        title="Reseller"
        desc="Source products at wholesale, list them in your locality, and earn margin. No GST needed under threshold."
        canActivate={tier !== 'bronze'}
        onActivate={() => activate('reseller')}
      />
    );
  }

  const inv = items.reduce((s, i) => s + i.stock, 0);
  const sold = items.reduce((s, i) => s + i.sold, 0);
  const revenue = items.reduce((s, i) => s + i.sold * i.resellPriceRupees, 0);
  const profit = items.reduce((s, i) => s + i.sold * (i.resellPriceRupees - i.buyPriceRupees), 0);

  const toggleActive = (id: string) =>
    setItems((arr) => arr.map((i) => (i.id === id ? { ...i, active: !i.active } : i)));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Reseller" onBack={() => router.back()} />

      <View style={styles.statsStrip}>
        <Stat label="In stock" value={inv} tint="#A855F7" />
        <Stat label="Units sold" value={sold} tint="#10B981" />
        <Stat label="₹ Profit" value={profit} tint={colors.brand[600]} prefix="₹" />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={{ marginBottom: spacing[3] }}>
          <Button
            label="+ Relist a new item"
            variant="secondary"
            onPress={() =>
              router.push({
                pathname: '/(classifieds)/create',
                params: { condition: 'new', category: 'other' },
              } as never)
            }
            fullWidth
          />
        </View>

        <VStack gap={3}>
          {items.length === 0 ? (
            <Text variant="body" tone="secondary" style={{ textAlign: 'center', marginTop: spacing[8] }}>
              No listings yet — relist an item to get started
            </Text>
          ) : (
            items.map((i) => (
              <ListingCard key={i.id} item={i} onToggle={() => toggleActive(i.id)} />
            ))
          )}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

function ListingCard({ item, onToggle }: { readonly item: ResellerListing; readonly onToggle: () => void }) {
  const margin = item.resellPriceRupees - item.buyPriceRupees;
  const marginPct = Math.round((margin / item.buyPriceRupees) * 100);

  return (
    <Card padding={4} elevation="xs" bordered>
      <HStack gap={3} align="start">
        <View style={styles.thumb}>
          <Package size={22} color="#A855F7" />
        </View>
        <VStack gap={1} style={{ flex: 1 }}>
          <HStack gap={2} align="center" style={{ justifyContent: 'space-between' }}>
            <Text variant="body" style={{ fontWeight: '700', flex: 1 }} numberOfLines={2}>
              {item.title}
            </Text>
            <Switch
              value={item.active}
              onValueChange={onToggle}
              trackColor={{ true: colors.brand[600], false: colors.gray[300] }}
            />
          </HStack>
          <Badge label={item.category} tone="neutral" />
        </VStack>
      </HStack>

      <View style={styles.divider} />

      <HStack gap={3} align="center" style={{ justifyContent: 'space-between' }}>
        <VStack gap={0.5}>
          <Text variant="caption" tone="secondary">Buy</Text>
          <Text variant="body" style={{ fontWeight: '700' }}>₹{item.buyPriceRupees}</Text>
        </VStack>
        <VStack gap={0.5}>
          <Text variant="caption" tone="secondary">Sell</Text>
          <Text variant="body" style={{ fontWeight: '700', color: colors.brand[700] }}>
            ₹{item.resellPriceRupees}
          </Text>
        </VStack>
        <VStack gap={0.5}>
          <Text variant="caption" tone="secondary">Margin</Text>
          <HStack gap={1} align="center">
            <TrendingUp size={13} color="#10B981" />
            <Text variant="body" style={{ fontWeight: '700', color: '#10B981' }}>
              {marginPct}%
            </Text>
          </HStack>
        </VStack>
        <VStack gap={0.5} align="end">
          <Text variant="caption" tone="secondary">Stock</Text>
          <Text
            variant="body"
            style={{ fontWeight: '700', color: item.stock === 0 ? '#DC2626' : colors.surface.heading }}
          >
            {item.stock}
          </Text>
        </VStack>
      </HStack>

      <Text variant="caption" tone="secondary" style={{ marginTop: spacing[2] }}>
        {item.sold} units sold · ₹{(item.sold * item.resellPriceRupees).toLocaleString('en-IN')} revenue
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  statsStrip: {
    flexDirection: 'row',
    gap: spacing[2],
    padding: spacing[3],
    backgroundColor: colors.surface.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surface.border,
  },
  scroll: { padding: spacing[4], paddingBottom: spacing[10] },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: '#FAF5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.surface.border,
    marginVertical: spacing[3],
  },
});
