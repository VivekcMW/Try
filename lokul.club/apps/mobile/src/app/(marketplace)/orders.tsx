// PRD §05 — My Orders (buyer + seller) — real API
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight, Clock, ShoppingBag } from 'lucide-react-native';
import { Badge, Button, Card, HStack, Text, VStack } from '@/components/ui';
import { RatingModal } from '@/components/RatingModal';
import { useWalletStore } from '@/store/walletStore';
import { colors, spacing } from '@lokul/ui-tokens';

type OrderStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';

type Order = {
  id: string;
  status: OrderStatus;
  pricePaise: number;
  scheduledAt: string | null;
  createdAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  title: string;
  listing: { id: string; title: string; category: string } | null;
  seller: { id: string; name: string; avatarUrl: string | null };
  buyer:  { id: string; name: string; avatarUrl: string | null };
  rating: { score: number } | null;
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending', confirmed: 'Confirmed', in_progress: 'In Progress',
  completed: 'Completed', cancelled: 'Cancelled', disputed: 'Disputed',
};
const STATUS_TONE: Record<OrderStatus, 'neutral' | 'success' | 'warning' | 'danger'> = {
  pending: 'neutral', confirmed: 'warning', in_progress: 'warning',
  completed: 'success', cancelled: 'danger', disputed: 'danger',
};

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export default function MyOrdersScreen() {
  const router  = useRouter();
  const userId  = useWalletStore((s) => s.userId);
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<'buyer' | 'seller'>('buyer');
  const [ratingOrderId,   setRatingOrderId]   = useState<string | null>(null);
  const [ratingSellerName, setRatingSellerName] = useState('');

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res = await fetch(`${BASE}/api/mobile/orders?userId=${userId}&role=${tab}`, { signal: ctrl.signal });
      const data = await res.json();
      setOrders(Array.isArray(data?.items) ? data.items : []);
    } catch {
      setOrders([]);
    } finally {
      clearTimeout(to);
      setLoading(false);
    }
  }, [userId, tab]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(orderId: string, status: string, extra: Record<string, string> = {}) {
    try {
      const res = await fetch(`${BASE}/api/mobile/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, requesterId: userId, ...extra }),
      });
      if (!res.ok) { Alert.alert('Update failed', 'Please try again.'); return; }
      load();
    } catch { Alert.alert('Network error', 'Please check your connection and try again.'); }
  }

  function cancelOrder(orderId: string) {
    updateStatus(orderId, 'cancelled', { cancelReason: 'Cancelled by user' });
  }

  async function rateOrder(orderId: string, score: number) {
    try {
      const res = await fetch(`${BASE}/api/mobile/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, raterId: userId, score }),
      });
      if (!res.ok) { Alert.alert('Rating failed', 'Could not submit rating.'); return; }
      load();
    } catch { Alert.alert('Network error', 'Please check your connection and try again.'); }
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <HStack gap={3} align="center" style={s.topBar}>
        <Pressable onPress={() => router.back()} style={s.backBtn} accessibilityRole="button">
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>My Orders</Text>
      </HStack>

      {/* Tab */}
      <HStack gap={0} style={s.tabs}>
        {(['buyer', 'seller'] as const).map((t) => (
          <Pressable key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Text variant="caption" style={{ fontWeight: '700', color: tab === t ? colors.brand[700] : colors.surface.textSecondary }}>
              {t === 'buyer' ? 'Orders Placed' : 'Orders Received'}
            </Text>
          </Pressable>
        ))}
      </HStack>

      {loading && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.brand[600]} />
        </View>
      )}
      {!loading && orders.length === 0 && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3] }}>
          <ShoppingBag size={40} color={colors.surface.textSecondary} />
          <Text variant="body" tone="secondary">No orders yet.</Text>
        </View>
      )}
      {!loading && orders.length > 0 && (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={{ padding: spacing[4], gap: spacing[3], paddingBottom: spacing[16] }}
          renderItem={({ item: o }) => {
            const displayTitle = o.title ?? o.listing?.title ?? 'Order';
            const categoryLabel = o.listing?.category ?? '';
            const partyName = tab === 'buyer' ? o.seller.name : o.buyer.name;
            return (
              <Pressable
                onPress={() => router.push(`/(marketplace)/order/${o.id}` as never)}
                accessibilityRole="button"
              >
                <Card padding={4} elevation="xs" bordered>
                  <VStack gap={2}>
                    <HStack justify="between" align="center">
                      <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading, flex: 1 }}>
                        {displayTitle}
                      </Text>
                      <HStack gap={1} align="center">
                        <Badge label={STATUS_LABEL[o.status]} tone={STATUS_TONE[o.status]} size="sm" />
                        <ChevronRight size={14} color={colors.surface.textSecondary} />
                      </HStack>
                    </HStack>

                    <Text variant="caption" tone="secondary" style={{ textTransform: 'capitalize' }}>
                      {categoryLabel}{categoryLabel && partyName ? ' · ' : ''}{partyName}
                    </Text>

                    <HStack justify="between" align="center">
                      <HStack gap={1} align="center">
                        <Clock size={12} color={colors.surface.textSecondary} />
                        <Text variant="caption" tone="secondary">
                          {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </Text>
                      </HStack>
                      <Text variant="body" style={{ fontWeight: '700', color: colors.brand[700] }}>
                        ₹{(o.pricePaise / 100).toFixed(0)}
                      </Text>
                    </HStack>

                    {/* ── SELLER inline actions ── */}
                    {tab === 'seller' && o.status === 'pending' && (
                      <HStack gap={2}>
                        <View style={{ flex: 1 }}>
                          <Button
                            label="Accept"
                            size="sm"
                            onPress={(e) => { e?.stopPropagation?.(); updateStatus(o.id, 'confirmed'); }}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Button
                            label="Reject"
                            variant="secondary"
                            size="sm"
                            onPress={(e) => { e?.stopPropagation?.(); updateStatus(o.id, 'cancelled', { cancelReason: 'Rejected by provider' }); }}
                          />
                        </View>
                      </HStack>
                    )}
                    {tab === 'seller' && o.status === 'confirmed' && (
                      <Button
                        label="Start Work"
                        size="sm"
                        onPress={(e) => { e?.stopPropagation?.(); updateStatus(o.id, 'in_progress'); }}
                      />
                    )}
                    {tab === 'seller' && o.status === 'in_progress' && (
                      <Button
                        label="Mark Complete"
                        size="sm"
                        onPress={(e) => { e?.stopPropagation?.(); updateStatus(o.id, 'completed'); }}
                      />
                    )}

                    {/* ── BUYER inline actions ── */}
                    {tab === 'buyer' && o.status === 'pending' && (
                      <Button
                        label="Cancel"
                        variant="secondary"
                        size="sm"
                        onPress={(e) => { e?.stopPropagation?.(); cancelOrder(o.id); }}
                      />
                    )}

                    {tab === 'buyer' && o.status === 'completed' && !o.rating && (
                      <Button
                        label="Rate Service →"
                        size="sm"
                        onPress={(e) => {
                          e?.stopPropagation?.();
                          setRatingOrderId(o.id);
                          setRatingSellerName(o.seller.name);
                        }}
                      />
                    )}

                    {o.status === 'completed' && o.rating && (
                      <Text variant="caption" style={{ color: '#F59E0B' }}>
                        {'★'.repeat(o.rating.score)} Your rating
                      </Text>
                    )}
                  </VStack>
                </Card>
              </Pressable>
            );
          }}
        />
      )}
      <RatingModal
        visible={!!ratingOrderId}
        orderId={ratingOrderId ?? ''}
        sellerName={ratingSellerName}
        onClose={() => setRatingOrderId(null)}
        onDone={() => { setRatingOrderId(null); load(); }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: colors.surface.background },
  topBar:    { paddingHorizontal: spacing[4], paddingVertical: spacing[3] },
  backBtn:   { padding: spacing[1] },
  tabs:      { borderBottomWidth: 1, borderColor: '#E5E7EB' },
  tab:       { flex: 1, paddingVertical: spacing[3], alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderColor: colors.brand[600] },
});
