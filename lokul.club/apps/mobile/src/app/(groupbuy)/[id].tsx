// PRD §08 — Group buy detail (join + commit)
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Minus, Plus, ShieldCheck, Truck, Users } from 'lucide-react-native';
import { Badge, Button, Card, HStack, Text, VStack } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type ApiGroupBuy = {
  id: string; title: string; emoji?: string; description?: string;
  unit: string; pricePerUnit: number; marketPrice?: number;
  targetQty: number; minQty: number; currentQty: number;
  closesAt: string; status: string; deliveryDate?: string; radiusKm?: number;
  organizer: { name: string; flat?: string };
  myCommit?: { qty: number } | null;
  commitCount: number;
};

export default function GroupBuyDetail() {
  const router  = useRouter();
  const { id }  = useLocalSearchParams<{ id: string }>();
  const userId  = useWalletStore((s) => s.userId);
  const [gb,       setGb]       = useState<ApiGroupBuy | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [qty,      setQty]      = useState(1);
  const [committing, setCommitting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res  = await fetch(`${BASE}/api/mobile/group-buys/${id}?userId=${userId ?? ''}`, { signal: ctrl.signal });
      const data = await res.json();
      setGb(data ?? null);
      if (data?.myCommit?.qty) setQty(data.myCommit.qty);
    } catch { /* aborted or failed */ } finally { clearTimeout(to); setLoading(false); }
  }, [id, userId]);

  useEffect(() => { load(); }, [load]);

  const handleCommit = async () => {
    if (!userId || !gb || qty < 1) return;
    setCommitting(true);
    try {
      const res  = await fetch(`${BASE}/api/mobile/group-buys/${gb.id}/commit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, qty }),
      });
      if (res.ok) { Alert.alert('Committed!', `You committed ${qty} ${gb.unit}.`); load(); }
      else { const d = await res.json(); Alert.alert('Error', d.error ?? 'Failed'); }
    } catch { Alert.alert('Error', 'Network error'); } finally { setCommitting(false); }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      </SafeAreaView>
    );
  }

  if (!gb) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text variant="body" style={{ padding: spacing[6] }}>Group buy not found.</Text>
      </SafeAreaView>
    );
  }

  const pct      = Math.min(100, Math.round((gb.currentQty / gb.targetQty) * 100));
  const savings  = (gb.marketPrice ?? 0) > 0 ? (gb.marketPrice! - gb.pricePerUnit) * Math.max(1, qty) : 0;
  const hoursLeft = Math.max(0, Math.round((new Date(gb.closesAt).getTime() - Date.now()) / 3600000));
  const locked   = gb.currentQty >= gb.minQty;
  const total    = gb.pricePerUnit * qty;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>Group buy</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card padding={5} elevation="xs" bordered>
          <HStack gap={3} align="center">
            <View style={styles.thumb}>
              <Text style={{ fontSize: 36 }}>{gb.emoji ?? '🛒'}</Text>
            </View>
            <VStack gap={1} style={{ flex: 1 }}>
              <Text variant="h3" style={{ fontWeight: '800' }}>{gb.title}</Text>
              <Text variant="caption" tone="secondary">by {gb.organizer.name}{gb.organizer.flat ? ` · ${gb.organizer.flat}` : ''}</Text>
            </VStack>
          </HStack>

          <Text variant="body" style={{ marginTop: spacing[3] }} tone="secondary">{gb.description}</Text>

          <HStack gap={3} align="center" style={{ marginTop: spacing[4] }}>
            <VStack gap={0.5}>
              <Text variant="caption" tone="secondary">Group price</Text>
              <Text variant="h2" style={{ color: colors.brand[700], fontWeight: '800' }}>₹{gb.pricePerUnit}</Text>
            </VStack>
            {gb.marketPrice != null && (
            <VStack gap={0.5}>
              <Text variant="caption" tone="secondary">Market</Text>
              <Text variant="body" tone="secondary" style={{ textDecorationLine: 'line-through' }}>₹{gb.marketPrice}</Text>
            </VStack>
            )}
            {gb.marketPrice != null && gb.marketPrice > 0 && (
              <Badge label={`Save ${Math.round(((gb.marketPrice - gb.pricePerUnit) / gb.marketPrice) * 100)}%`} tone="success" />
            )}
          </HStack>

          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: locked ? '#16A34A' : colors.brand[600] }]} />
          </View>
          <HStack gap={2} align="center" style={{ marginTop: spacing[2], justifyContent: 'space-between' }}>
            <Text variant="caption" tone="secondary">{gb.currentQty}/{gb.targetQty} {gb.unit} committed</Text>
            <Text variant="caption" style={{ fontWeight: '700' }}>min {gb.minQty} to unlock</Text>
          </HStack>
        </Card>

        <Card padding={4} elevation="xs" bordered style={{ marginTop: spacing[3] }}>
          <Text variant="caption" style={{ fontWeight: '700', textTransform: 'uppercase', color: colors.surface.textSecondary, letterSpacing: 0.6 }}>
            Logistics
          </Text>
          <HStack gap={3} align="center" style={{ marginTop: spacing[2] }}>
            <Truck size={18} color={colors.brand[700]} />
            <VStack gap={0}>
              <Text variant="body" style={{ fontWeight: '700' }}>
                {gb.deliveryDate ? `Delivery: ${gb.deliveryDate}` : 'Delivery date TBD'}
              </Text>
              <Text variant="caption" tone="secondary">
                {gb.radiusKm != null ? `Within ${gb.radiusKm} km · doorstep drop` : 'Doorstep delivery'}
              </Text>
            </VStack>
          </HStack>
          <HStack gap={3} align="center" style={{ marginTop: spacing[2] }}>
            <ShieldCheck size={18} color="#16A34A" />
            <Text variant="caption" tone="secondary">Funds held in escrow — released only after delivery</Text>
          </HStack>
        </Card>

        <Card padding={4} elevation="xs" bordered style={{ marginTop: spacing[3] }}>
          <HStack gap={2} align="center">
            <Users size={16} color={colors.surface.textSecondary} />
            <Text variant="caption" style={{ fontWeight: '700' }}>Participants ({gb.commitCount})</Text>
          </HStack>
        </Card>
      </ScrollView>

      {/* Sticky commit bar */}
      <View style={styles.footer}>
        <View style={styles.qtyBox}>
          <Pressable onPress={() => setQty(Math.max(0, qty - 1))} style={styles.qtyBtn}><Minus size={16} color={colors.surface.heading} /></Pressable>
          <Text variant="body" style={{ fontWeight: '800', minWidth: 24, textAlign: 'center' }}>{qty}</Text>
          <Pressable onPress={() => setQty(qty + 1)} style={styles.qtyBtn}><Plus size={16} color={colors.surface.heading} /></Pressable>
        </View>
        <View style={{ flex: 1, marginLeft: spacing[3] }}>
          <Button
            label={qty === 0 ? `Closes in ${hoursLeft}h` : `Commit ₹${total}${savings > 0 ? ` · save ₹${Math.round(savings)}` : ''}`}
            onPress={handleCommit}
            fullWidth
            disabled={qty === 0 || committing}
          />
        </View>
      </View>
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
    width: 72, height: 72, borderRadius: radius.lg,
    backgroundColor: colors.brand[50],
    alignItems: 'center', justifyContent: 'center',
  },
  barTrack: { marginTop: spacing[3], height: 8, backgroundColor: colors.gray[200], borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  footer: {
    padding: spacing[3], paddingBottom: spacing[6],
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface.background,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.surface.border,
  },
  qtyBox: { flexDirection: 'row', alignItems: 'center', gap: spacing[2.5], backgroundColor: colors.gray[100], borderRadius: radius.md, paddingHorizontal: spacing[2], paddingVertical: spacing[1.5] },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surface.background, alignItems: 'center', justifyContent: 'center' },
});
