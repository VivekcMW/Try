import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle, Clock, MapPin, Package, Phone, Star } from 'lucide-react-native';
import { Avatar, Badge, Button, Card, HStack, Text, VStack } from '@/components/ui';
import { useWalletStore } from '@/store/walletStore';
import { colors, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type MerchantOrderStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';

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
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  disputed: 'Disputed',
};

const STATUS_COLORS: Record<MerchantOrderStatus, string> = {
  pending: colors.gray[500],
  confirmed: colors.semantic.info,
  in_progress: colors.semantic.warning,
  completed: colors.semantic.success,
  cancelled: colors.semantic.danger,
  disputed: colors.semantic.danger,
};

export default function MerchantOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const userId = useWalletStore((s) => s.userId);
  const [order, setOrder] = useState<MerchantOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
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
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCall = () => {
    if (order?.merchant.owner.phone) {
      Linking.openURL(`tel:${order.merchant.owner.phone}`);
    }
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            if (!userId || !id) return;
            setCancelling(true);
            try {
              const res = await fetch(`${BASE}/api/mobile/merchant-orders/${id}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  customerId: userId,
                  reason: 'Cancelled by customer',
                }),
              });
              
              if (res.ok) {
                Alert.alert('Success', 'Order cancelled successfully');
                load(); // Reload order to show updated status
              } else {
                const error = await res.json();
                Alert.alert('Error', error.error || 'Failed to cancel order');
              }
            } catch (e) {
              Alert.alert('Error', 'Failed to cancel order');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  const handleSubmitRating = async () => {
    if (!userId || !id || rating === 0) return;
    
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
        Alert.alert('Success', 'Thank you for your feedback!');
        load(); // Reload order to show rating
      } else {
        const error = await res.json();
        Alert.alert('Error', error.error || 'Failed to submit rating');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to submit rating');
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
          tone="neutral"
          style={{ backgroundColor: STATUS_COLORS[order.status] }}
        />
      </HStack>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing[16] }}>
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

        {/* Cancel Order Button */}
        {(order.status === 'pending' || order.status === 'confirmed') && (
          <Card padding={4} elevation="sm" style={styles.card}>
            <Button
              label={cancelling ? 'Cancelling...' : 'Cancel Order'}
              variant="secondary"
              onPress={handleCancelOrder}
              disabled={cancelling}
              style={{ backgroundColor: colors.semantic.dangerBg, borderColor: colors.semantic.danger }}
            />
          </Card>
        )}

        {/* Rating Section */}
        {order.status === 'completed' && !order.rating && (
          <Card padding={4} elevation="sm" style={styles.card}>
            <VStack gap={3}>
              <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
                Rate Your Experience
              </Text>
              <HStack gap={2} style={{ justifyContent: 'center', marginVertical: spacing[2] }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable
                    key={star}
                    onPress={() => setRating(star)}
                    accessibilityRole="button"
                  >
                    <Star
                      size={32}
                      color={star <= rating ? '#F59E0B' : colors.gray[300]}
                      fill={star <= rating ? '#F59E0B' : 'transparent'}
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
                    color={star <= (order.rating?.score || 0) ? '#F59E0B' : colors.gray[300]}
                    fill={star <= (order.rating?.score || 0) ? '#F59E0B' : 'transparent'}
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
