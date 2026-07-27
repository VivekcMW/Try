// PRD §07 — Wallet home
import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, Banknote, Plus, ShieldCheck, Wallet } from 'lucide-react-native';
import { Badge, Button, Card, HStack, Text, VStack } from '@/components/ui';
import { useWalletStore, rupees, type LedgerEntry } from '@/store/walletStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

export default function WalletHome() {
  const router = useRouter();
  const { userId, balancePaise, heldPaise, earningsPaise, ledger, syncFromApi } = useWalletStore();
  const [refreshing, setRefreshing] = useState(false);

  const fetchWallet = useCallback(async () => {
    if (!userId) return;
    const base = process.env.EXPO_PUBLIC_API_BASE ?? '';
    try {
      const r = await fetch(`${base}/api/mobile/wallet?userId=${userId}`);
      const data = await r.json();
      if (data.balancePaise !== undefined) syncFromApi(data);
    } catch { /* noop */ }
  }, [userId, syncFromApi]);

  useEffect(() => { fetchWallet(); }, [fetchWallet]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWallet();
    setRefreshing(false);
  }, [fetchWallet]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/explore')} hitSlop={10} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>Lokul Wallet</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand[600]} />}
      >
        <Card padding={5} elevation="sm" bordered style={{ backgroundColor: colors.brand[700], borderColor: colors.brand[700] }}>
          <HStack gap={2} align="center" style={{ justifyContent: 'space-between' }}>
            <HStack gap={2} align="center">
              <Wallet size={18} color="#FFFFFFCC" />
              <Text variant="caption" style={{ color: '#FFFFFFCC', fontWeight: '700', letterSpacing: 0.6 }}>BALANCE</Text>
            </HStack>
            <ShieldCheck size={16} color="#86EFAC" />
          </HStack>
          <Text style={{ color: '#fff', fontSize: 38, fontWeight: '800', lineHeight: 48, marginTop: spacing[2] }}>
            {rupees(balancePaise)}
          </Text>
          <HStack gap={3} align="center" style={{ marginTop: spacing[2] }}>
            <Text variant="caption" style={{ color: '#FFFFFFAA' }}>Held in escrow: {rupees(heldPaise)}</Text>
          </HStack>
          <HStack gap={2} align="center" style={{ marginTop: spacing[4] }}>
            <View style={{ flex: 1 }}>
              <Button label="Add money" variant="secondary" leftIcon={<Plus size={16} color={colors.brand[700]} />} onPress={() => router.push('/(wallet)/add-money' as never)} fullWidth />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="Payout" variant="secondary" leftIcon={<Banknote size={16} color={colors.brand[700]} />} onPress={() => router.push('/(wallet)/payouts' as never)} fullWidth />
            </View>
          </HStack>
        </Card>

        <HStack gap={3} align="center" style={{ marginTop: spacing[3] }}>
          <KPI label="Lifetime earnings" value={rupees(earningsPaise)} tint="#16A34A" />
          <KPI label="In escrow" value={rupees(heldPaise)} tint="#F59E0B" />
        </HStack>

        <HStack gap={2} align="center" style={{ marginTop: spacing[4], justifyContent: 'space-between' }}>
          <Text variant="caption" style={{ fontWeight: '700', textTransform: 'uppercase', color: colors.surface.textSecondary, letterSpacing: 0.6 }}>
            Recent activity
          </Text>
          <Pressable onPress={() => router.push('/(wallet)/ledger' as never)}>
            <Text variant="caption" style={{ fontWeight: '700', color: colors.brand[700] }}>See all →</Text>
          </Pressable>
        </HStack>

        <VStack gap={2} style={{ marginTop: spacing[2] }}>
          {ledger.slice(0, 8).map((e) => <LedgerRow key={e.id} entry={e} />)}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

function KPI({ label, value, tint }: { readonly label: string; readonly value: string; readonly tint: string }) {
  return (
    <View style={[styles.kpi, { borderColor: tint + '33' }]}>
      <Text variant="caption" tone="secondary">{label}</Text>
      <Text variant="body" style={{ fontWeight: '800', color: tint, marginTop: 4 }}>{value}</Text>
    </View>
  );
}

export function LedgerRow({ entry }: { readonly entry: LedgerEntry }) {
  const credit = entry.amountPaise >= 0;
  const Icon = credit ? ArrowDownLeft : ArrowUpRight;
  return (
    <Card padding={3} elevation="none" bordered>
      <HStack gap={3} align="center">
        <View style={[styles.iconRing, { backgroundColor: credit ? '#DCFCE7' : '#FEE2E2' }]}>
          <Icon size={16} color={credit ? '#16A34A' : '#DC2626'} />
        </View>
        <VStack gap={0.5} style={{ flex: 1 }}>
          <Text variant="body" style={{ fontWeight: '700' }} numberOfLines={1}>{entry.description}</Text>
          <HStack gap={2} align="center">
            <Text variant="caption" tone="secondary">{new Date(entry.ts).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</Text>
            {entry.status === 'pending' && <Badge label="PENDING" tone="warning" size="sm" />}
            {entry.type === 'hold' && <Badge label="ESCROW" tone="info" size="sm" />}
          </HStack>
        </VStack>
        <Text variant="body" style={{ fontWeight: '800', color: credit ? '#16A34A' : colors.surface.foreground }}>
          {credit ? '+' : ''}{rupees(entry.amountPaise)}
        </Text>
      </HStack>
    </Card>
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
  kpi: { flex: 1, padding: spacing[3], backgroundColor: colors.surface.background, borderRadius: radius.md, borderWidth: 1 },
  iconRing: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
