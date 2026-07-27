// PRD §07 — Full ledger
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Text, VStack } from '@/components/ui';
import { useWalletStore, type LedgerType } from '@/store/walletStore';
import { LedgerRow } from './index';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const FILTERS: { v: LedgerType | 'all'; label: string }[] = [
  { v: 'all', label: 'All' },
  { v: 'earn', label: 'Earnings' },
  { v: 'spend', label: 'Spends' },
  { v: 'topup', label: 'Top-ups' },
  { v: 'payout', label: 'Payouts' },
  { v: 'hold', label: 'Escrow' },
];

export default function LedgerScreen() {
  const router = useRouter();
  const ledger = useWalletStore((s) => s.ledger);
  const [f, setF] = useState<LedgerType | 'all'>('all');

  const filtered = useMemo(
    () => (f === 'all' ? ledger : ledger.filter((e) => e.type === f)),
    [ledger, f],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>Ledger</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips} contentContainerStyle={{ paddingHorizontal: spacing[3], gap: spacing[2] }}>
        {FILTERS.map((x) => {
          const a = f === x.v;
          return (
            <Pressable key={x.v} onPress={() => setF(x.v)} style={[styles.chip, a && styles.chipActive]}>
              <Text variant="caption" style={{ fontWeight: '700', color: a ? colors.brand[700] : colors.surface.textSecondary }}>{x.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scroll}>
        <VStack gap={2}>
          {filtered.map((e) => <LedgerRow key={e.id} entry={e} />)}
          {filtered.length === 0 && (
            <Text variant="body" tone="secondary" style={{ textAlign: 'center', padding: spacing[8] }}>
              Nothing here yet.
            </Text>
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
  chips: {
    flexGrow: 0,
    backgroundColor: colors.surface.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surface.border,
    paddingVertical: spacing[2],
  },
  chip: {
    paddingHorizontal: spacing[3], paddingVertical: spacing[1.5],
    borderRadius: radius.full, backgroundColor: colors.gray[100],
  },
  chipActive: { backgroundColor: colors.brand[50] },
  scroll: { padding: spacing[4], paddingBottom: spacing[10] },
});
