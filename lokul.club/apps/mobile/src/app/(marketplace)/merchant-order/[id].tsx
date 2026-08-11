import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, Linking, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle, Clock, MapPin, Package, Phone, Star } from 'lucide-react-native';
import { Avatar, Badge, Button, Card, HStack, Text, VStack } from '@/components/ui';
import { OrderTracker, type TrackerStatus } from '@/components/commerce';
import { useWalletStore } from '@/store/walletStore';
import { colors, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type MerchantOrderStatus = TrackerStatus;

type MerchantOrderDetail = {
  id: string;
  orderNumber: string;
  status: MerchantOrderStatus;
  subtotalPaise: number;
  deliveryFeePaise: number;
  taxPaise: number;
  totalPaise: number;
  paymentMethod: string;
  paymentStatus: string;
  deliveryMode: string;
  deliveryAddress: string | null;
  customerNotes: string | null;
  merchantNotes: string | null;
  createdAt: string;
  confirmedAt: string | null;
  inProgressAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  estimatedReadyAt: string | null;
  merchant: {
    id: string;
    name: string;
    category: string;
    avatarUrl: string | null;
    owner: { id: string; phone: string };
  };
  customer: {
    id: string;
    name: string;
    phone: string;
    avatarUrl: string | null;
    kycTier: string;
  };
  orderItems: Array<{
    id: string;
    name: string;
    kind: string;
    pricePaise: number;
    quantity: number;
    unit: string | null;
    totalPaise: number;
  }>;
  statusHistory: Array<{
    id: string;
    status: string;
    createdAt: string;
  }>;
  rating?: {
    id: string;
    score: number;
    review: string | null;
  };
};

const STATUS_LABELS: Record<MerchantOrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Accepted',
  in_progress: 'Preparing',
  out_for_delivery: 'On the way',
  ready_for_pickup: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
  disputed: 'Disputed',
};

type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';
const STATUS_TONE: Record<MerchantOrderStatus, BadgeTone> = {
  pending: 'warning',
  confirmed: 'info',
  in_progress: 'brand',
  out_for_delivery: 'brand',
  ready_for_pickup: 'brand',
  completed: 'success',
  cancelled: 'danger',
  disputed: 'danger',
};

// Demo order simulation — progresses through statuses on timers (id starts with "demo")
const DEMO_STAGE_DELAYS: Array<{ status: MerchantOrderStatus; afterMs: number }> = [
  { status: 'confirmed', afterMs: 8000 },
  { status: 'in_progress', afterMs: 20000 },
  { status: 'out_for_delivery', afterMs: 40000 },
  { status: 'completed', afterMs: 70000 },
];

function buildDemoOrder(id: string, params: { mode?: string; total?: string; merchant?: string; address?: string }): MerchantOrderDetail {
  const isPickup = params.mode === 'pickup';
  const totalPaise = Number(params.total ?? 0) || 11500;
  const now = new Date();
  return {
    id,
    orderNumber: id.replace('demo-', ''),
    status: 'pending',
    subtotalPaise: totalPaise,
    deliveryFeePaise: 0,
    taxPaise: 0,
    totalPaise,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    deliveryMode: isPickup ? 'pickup' : 'delivery',
    deliveryAddress: isPickup ? null : (params.address ?? 'Your saved address'),
    customerNotes: null,
    merchantNotes: null,
    createdAt: now.toISOString(),
    confirmedAt: null,
    inProgressAt: null,
    completedAt: null,
    cancelledAt: null,
    estimatedReadyAt: new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
    merchant: {
      id: '1',
      name: params.merchant ?? 'Amul Parlour',
      category: 'grocery',
      avatarUrl: null,
      owner: { id: 'demo-owner', phone: '+919999999999' },
    },
    customer: { id: 'demo-user', name: 'You', phone: '', avatarUrl: null, kycTier: 'basic' },
    orderItems: [],
    statusHistory: [{ id: '1', status: 'pending', createdAt: now.toISOString() }],
  };
}

export default function MerchantOrderDetailScreen() {
  const { id, mode, total, merchant: merchantParam, address } = useLocalSearchParams<{
    id: string; mode?: string; total?: string; merchant?: string; address?: string;
  }>();
  const router = useRouter();
  const userId = useWalletStore((s) => s.userId);
  const [order, setOrder] = useState<MerchantOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const isDemo = !!id?.startsWith('demo');
  const demoTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const load = useCallback(async () => {
    if (!id) return;
    if (isDemo) {
      setOrder(buildDemoOrder(id, { mode, total, merchant: merchantParam, address }));
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/merchant-orders/${id}`);
      const data = await res.json();
      setOrder(data.order);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, [id, isDemo, mode, total, merchantParam, address]);

  useEffect(() => {
    load();
  }, [load]);

  // Demo: progress the order through statuses on timers
  useEffect(() => {
    if (!isDemo) return;
    const isPickup = mode === 'pickup';
    demoTimers.current = DEMO_STAGE_DELAYS.map(({ status, afterMs }) =>
      setTimeout(() => {
        setOrder((prev) => {
          if (!prev || prev.status === 'cancelled') return prev;
          const next = status === 'out_for_delivery' && isPickup ? 'ready_for_pickup' : status;
          return {
            ...prev,
            status: next,
            statusHistory: [
              ...prev.statusHistory,
              { id: String(prev.statusHistory.length + 1), status: next, createdAt: new Date().toISOString() },
            ],
          };
        });
      }, afterMs)
    );
    return () => demoTimers.current.forEach(clearTimeout);
  }, [isDemo, mode]);

  // Live orders: poll while the app is foregrounded and the order is active
  useEffect(() => {
    if (isDemo || !order || ['completed', 'cancelled', 'disputed'].includes(order.status)) return;
    const interval = setInterval(() => {
      if (AppState.currentState === 'active') load();
    }, 15000);
    return () => clearInterval(interval);
  }, [isDemo, order, load]);

  const handleCall = () => {
    if (order?.merchant.owner.phone) {
      Linking.openURL(`tel:${order.merchant.owner.phone}`);
    }
  };

  const CANCEL_REASONS = ['Ordered by mistake', 'Changed my mind', 'Taking too long', 'Other'];

  const cancelWithReason = async (reason: string) => {
    if (isDemo) {
      demoTimers.current.forEach(clearTimeout);
      setOrder((prev) => prev ? { ...prev, status: 'cancelled' } : prev);
      return;
    }
    if (!userId || !id) return;
    setCancelling(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/merchant-orders/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: userId, reason }),
      });

      if (res.ok) {
        Alert.alert('Order Cancelled', 'Any payment made will be refunded.');
        load();
      } else {
        const error = await res.json();
        Alert.alert('Error', error.error || 'Failed to cancel order');
      }
    } catch {
      Alert.alert('Error', 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order?',
      'Tell us why — this helps the shop improve.',
      [
        ...CANCEL_REASONS.map((reason) => ({
          text: reason,
          onPress: () => cancelWithReason(reason),
        })),
        { text: 'Keep my order', style: 'cancel' as const },
      ]
    );
  };

  const handleSubmitRating = async () => {
    if (rating === 0) return;

    const applyLocalRating = () => {
      setOrder((prev) =>
        prev ? { ...prev, rating: { id: 'local', score: rating, review: review.trim() || null } } : prev
      );
      Alert.alert('Thank you! ⭐', 'Your rating helps this local shop grow.');
    };

    // Demo orders (or missing session): store the rating locally
    if (isDemo || !userId || !id) {
      applyLocalRating();
      return;
    }

    setSubmittingRating(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/merchant-orders/${id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: userId,
          score: rating,
          review: review.trim() || undefined,
        }),
      });

      if (res.ok) {
        Alert.alert('Thank you! ⭐', 'Your rating helps this local shop grow.');
        load(); // Reload order to show rating
      } else {
        const error = await res.json();
        Alert.alert('Error', error.error || 'Failed to submit rating');
      }
    } catch {
      // Backend unreachable — keep the rating locally so the user isn't blocked
      applyLocalRating();
    } finally {
      setSubmittingRating(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text variant="body" style={{ padding: spacing[6] }}>
          Order not found.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack gap={3} align="center" style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <VStack gap={0} style={{ flex: 1 }}>
          <Text variant="h3" style={{ color: colors.surface.heading }}>
            Order {order.orderNumber}
          </Text>
          <Text variant="caption" tone="secondary">
            {formatDate(order.createdAt)}
          </Text>
        </VStack>
        <Badge
          label={STATUS_LABELS[order.status]}
          tone={STATUS_TONE[order.status]}
        />
      </HStack>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing[16] }}>
        {/* Live order tracker */}
        <OrderTracker
          status={order.status}
          deliveryMode={order.deliveryMode}
          estimatedReadyAt={order.estimatedReadyAt}
          deliveryAddress={order.deliveryAddress}
          merchantName={order.merchant.name}
          shopAddress={`${order.merchant.name}, Kumar Sienna`}
          pickupCode={order.orderNumber.replace(/\D/g, '').slice(-4).padStart(4, '0')}
          onCallShop={handleCall}
        />

        {/* Merchant Info */}
        <Card padding={4} elevation="sm" style={styles.card}>
          <VStack gap={3}>
            <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
              Merchant
            </Text>
            <HStack gap={3} align="center">
              <Avatar name={order.merchant.name} size="md" />
              <VStack gap={0} style={{ flex: 1 }}>
                <Text variant="body" style={{ fontWeight: '600', color: colors.surface.heading }}>
                  {order.merchant.name}
                </Text>
                <Text variant="caption" tone="secondary">{order.merchant.category}</Text>
              </VStack>
              <Pressable onPress={handleCall} style={styles.phoneBtn}>
                <Phone size={18} color={colors.brand[600]} />
              </Pressable>
            </HStack>
          </VStack>
        </Card>

        {/* Delivery Info */}
        <Card padding={4} elevation="sm" style={styles.card}>
          <VStack gap={3}>
            <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
              Delivery Details
            </Text>
            <HStack gap={2} align="center">
              <MapPin size={16} color={colors.gray[500]} />
              <VStack gap={0} style={{ flex: 1 }}>
                <Text variant="caption" tone="secondary">
                  {order.deliveryMode === 'delivery' ? 'Home Delivery' : 'Self Pickup'}
                </Text>
                <Text variant="body" style={{ color: colors.surface.heading }}>
                  {order.deliveryAddress || 'Self Pickup'}
                </Text>
              </VStack>
            </HStack>
            {order.estimatedReadyAt && order.status !== 'completed' && order.status !== 'cancelled' && (
              <HStack gap={2} align="center">
                <Clock size={16} color={colors.brand[600]} />
                <VStack gap={0} style={{ flex: 1 }}>
                  <Text variant="caption" tone="secondary">Estimated Ready</Text>
                  <Text variant="body" style={{ color: colors.brand[600], fontWeight: '600' }}>
                    {formatDate(order.estimatedReadyAt)}
                  </Text>
                </VStack>
              </HStack>
            )}
            {order.customerNotes && (
              <VStack gap={1}>
                <Text variant="caption" tone="secondary">Your Notes:</Text>
                <Text variant="body" style={{ color: colors.surface.heading }}>
                  {order.customerNotes}
                </Text>
              </VStack>
            )}
          </VStack>
        </Card>

        {/* Order Items */}
        <Card padding={4} elevation="sm" style={styles.card}>
          <VStack gap={3}>
            <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
              Order Items
            </Text>
            {order.orderItems.map((item) => (
              <HStack key={item.id} gap={3}>
                <View style={styles.itemIcon}>
                  <Package size={20} color={colors.gray[400]} />
                </View>
                <VStack gap={0} style={{ flex: 1 }}>
                  <Text variant="body" style={{ fontWeight: '600', color: colors.surface.heading }}>
                    {item.name}
                  </Text>
                  <Text variant="caption" tone="secondary">
                    ₹{(item.pricePaise / 100).toFixed(2)}
                    {item.unit && ` per ${item.unit}`} × {item.quantity}
                  </Text>
                </VStack>
                <Text variant="body" style={{ fontWeight: '600', color: colors.surface.heading }}>
                  ₹{(item.totalPaise / 100).toFixed(2)}
                </Text>
              </HStack>
            ))}
            <View style={styles.divider} />
            <HStack gap={2} align="center" style={{ justifyContent: 'space-between' }}>
              <Text variant="body" tone="secondary">Subtotal</Text>
              <Text variant="body" style={{ fontWeight: '600' }}>
                ₹{(order.subtotalPaise / 100).toFixed(2)}
              </Text>
            </HStack>
            <HStack gap={2} align="center" style={{ justifyContent: 'space-between' }}>
              <Text variant="body" tone="secondary">Delivery Fee</Text>
              <Text variant="body" style={{ fontWeight: '600' }}>
                ₹{(order.deliveryFeePaise / 100).toFixed(2)}
              </Text>
            </HStack>
            <View style={styles.divider} />
            <HStack gap={2} align="center" style={{ justifyContent: 'space-between' }}>
              <Text variant="h3" style={{ color: colors.surface.heading }}>Total</Text>
              <Text variant="h3" style={{ color: colors.brand[600] }}>
                ₹{(order.totalPaise / 100).toFixed(2)}
              </Text>
            </HStack>
            <HStack gap={2} align="center" style={{ justifyContent: 'space-between', marginTop: spacing[2] }}>
              <Text variant="caption" tone="secondary">Payment Method</Text>
              <Badge label={order.paymentMethod.toUpperCase()} tone="neutral" />
            </HStack>
            <HStack gap={2} align="center" style={{ justifyContent: 'space-between' }}>
              <Text variant="caption" tone="secondary">Payment Status</Text>
              <Badge
                label={order.paymentStatus.toUpperCase()}
                tone={order.paymentStatus === 'paid' ? 'success' : 'warning'}
              />
            </HStack>
          </VStack>
        </Card>

        {/* Status Timeline */}
        <Card padding={4} elevation="sm" style={styles.card}>
          <VStack gap={3}>
            <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
              Order Timeline
            </Text>
            {order.statusHistory.map((history, index) => (
              <HStack key={history.id} gap={3}>
                <View style={styles.timelineDot}>
                  <CheckCircle size={16} color={colors.brand[600]} />
                </View>
                <VStack gap={0} style={{ flex: 1 }}>
                  <Text variant="body" style={{ fontWeight: '600', color: colors.surface.heading, textTransform: 'capitalize' }}>
                    {history.status.replace('_', ' ')}
                  </Text>
                  <Text variant="caption" tone="secondary">
                    {formatDate(history.createdAt)}
                  </Text>
                </VStack>
              </HStack>
            ))}
          </VStack>
        </Card>

        {/* Cancel — only before the shop accepts (or if payment isn't captured yet) */}
        {(order.status === 'pending' || (order.status === 'confirmed' && order.paymentStatus !== 'paid')) && (
          <Pressable
            onPress={handleCancelOrder}
            disabled={cancelling}
            style={styles.cancelBtn}
            accessibilityRole="button"
            accessibilityLabel="Cancel order"
          >
            <Text style={styles.cancelBtnText}>
              {cancelling ? 'Cancelling…' : 'Cancel Order'}
            </Text>
          </Pressable>
        )}

        {/* Rating Section */}
        {order.status === 'completed' && !order.rating && (
          <Card padding={4} elevation="sm" style={styles.card}>
            <VStack gap={3}>
              <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
                How was your order?
              </Text>
              <Text variant="caption" tone="secondary">
                Your rating helps {order.merchant.name} serve the society better
              </Text>
              <HStack gap={3} style={{ justifyContent: 'center', marginVertical: spacing[2] }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable
                    key={star}
                    onPress={() => setRating(star)}
                    accessibilityRole="button"
                    accessibilityLabel={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    hitSlop={6}
                  >
                    <Star
                      size={36}
                      color={star <= rating ? colors.accent[500] : colors.gray[300]}
                      fill={star <= rating ? colors.accent[500] : 'transparent'}
                    />
                  </Pressable>
                ))}
              </HStack>
              <TextInput
                style={styles.reviewInput}
                placeholder="Write a review (optional)"
                placeholderTextColor={colors.gray[400]}
                value={review}
                onChangeText={setReview}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <Button
                label={submittingRating ? 'Submitting...' : 'Submit Rating'}
                onPress={handleSubmitRating}
                disabled={rating === 0 || submittingRating}
              />
            </VStack>
          </Card>
        )}

        {/* Show Existing Rating */}
        {order.rating && (
          <Card padding={4} elevation="sm" style={styles.card}>
            <VStack gap={2}>
              <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
                Your Rating
              </Text>
              <HStack gap={1}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    color={star <= (order.rating?.score || 0) ? colors.accent[500] : colors.gray[300]}
                    fill={star <= (order.rating?.score || 0) ? colors.accent[500] : 'transparent'}
                  />
                ))}
              </HStack>
              {order.rating.review && (
                <Text variant="body" style={{ color: colors.surface.heading }}>
                  {order.rating.review}
                </Text>
              )}
            </VStack>
          </Card>
        )}

        {/* Help Section */}
        <Card padding={4} elevation="sm" style={styles.card}>
          <VStack gap={2}>
            <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
              Need Help?
            </Text>
            <Text variant="caption" tone="secondary">
              Contact the merchant directly for any queries about your order.
            </Text>
            <Button
              label="Call Merchant"
              variant="secondary"
              size="sm"
              leftIcon={<Phone size={16} color={colors.brand[600]} />}
              onPress={handleCall}
            />
          </VStack>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.background },
  topBar: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 0.5,
    borderBottomColor: colors.surface.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: { marginHorizontal: spacing[4], marginTop: spacing[4] },
  cancelBtn: {
    marginHorizontal: spacing[4],
    marginTop: spacing[4],
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.semantic.danger,
    backgroundColor: colors.surface.background,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.semantic.danger,
  },
  phoneBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.surface.border,
    marginVertical: spacing[2],
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: 8,
    padding: spacing[3],
    fontSize: 14,
    color: colors.surface.foreground,
    backgroundColor: colors.surface.background,
    minHeight: 80,
  },
});
