// PRD §05 — Order Detail Screen (buyer + seller views)
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, Modal, Pressable, ScrollView,
  StyleSheet, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft, Calendar, CheckCircle, Clock, MessageCircle,
  MapPin, Star, XCircle,
} from 'lucide-react-native';
import { Avatar, Badge, Button, Card, HStack, Text, VStack } from '@/components/ui';
import { useWalletStore } from '@/store/walletStore';
import { usePeerStore, type PeerRole } from '@/store/peerRoleStore';
import { colors, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type OrderStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';

type OrderDetail = {
  id: string;
  status: OrderStatus;
  title: string;
  descriptionSnapshot: string;
  pricePaise: number;
  quantity: number;
  scheduledAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  addressNote: string | null;
  buyerNote: string | null;
  sellerNote: string | null;
  createdAt: string;
  buyer:  { id: string; name: string; avatarUrl: string | null; kycTier: string };
  seller: { id: string; name: string; avatarUrl: string | null; kycTier: string };
  listing: { id: string; category: string; title: string } | null;
  rating: { score: number; review: string | null } | null;
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending:     'Pending',
  confirmed:   'Confirmed',
  in_progress: 'In Progress',
  completed:   'Completed',
  cancelled:   'Cancelled',
  disputed:    'Disputed',
};
const STATUS_TONE: Record<OrderStatus, 'neutral' | 'success' | 'warning' | 'danger'> = {
  pending:     'neutral',
  confirmed:   'warning',
  in_progress: 'warning',
  completed:   'success',
  cancelled:   'danger',
  disputed:    'danger',
};

export default function OrderDetailScreen() {
  const { id }  = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const userId  = useWalletStore((s) => s.userId);
  const syncFromApi = useWalletStore((s) => s.syncFromApi);

  const [order,   setOrder]   = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting,  setActing]  = useState(false);

  // Rating modal state
  const [ratingOpen,  setRatingOpen]  = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingText,  setRatingText]  = useState('');
  const [submitting,  setSubmitting]  = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/api/mobile/orders/${id}`);
      const data = await res.json();
      setOrder(data);
    } catch { /* noop */ } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Sync wallet balances from API
  const syncWallet = useCallback(async () => {
    if (!userId) return;
    try {
      const res  = await fetch(`${BASE}/api/mobile/wallet?userId=${userId}`);
      const data = await res.json();
      if (data.balancePaise !== undefined) syncFromApi(data);
    } catch { /* noop */ }
  }, [userId, syncFromApi]);

  const isBuyer  = order?.buyer.id  === userId;
  const isSeller = order?.seller.id === userId;

  async function updateStatus(status: string, extra: Record<string, string> = {}) {
    if (!order) return;
    setActing(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, requesterId: userId, ...extra }),
      });
      if (res.ok) {
        await load();
        // Sync wallet balances after any status change that affects money
        if (status === 'completed' || status === 'cancelled') {
          await syncWallet();
          // If seller just completed an order, record earnings in peer role store
          if (status === 'completed' && isSeller && order.listing?.category) {
            const role = order.listing.category as PeerRole;
            usePeerStore.getState().recordEarning(role, order.pricePaise * order.quantity);
          }
        }
      } else {
        Alert.alert('Error', 'Action failed. Please try again.');
      }
    } catch { Alert.alert('Error', 'Network error'); } finally { setActing(false); }
  }

  function confirmCancel() {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => updateStatus('cancelled', { cancelReason: 'Cancelled by user' }),
        },
      ],
    );
  }

  function confirmReject() {
    Alert.alert(
      'Reject Order',
      'Reject this booking request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => updateStatus('cancelled', { cancelReason: 'Rejected by provider' }),
        },
      ],
    );
  }

  async function submitRating() {
    if (!order || !userId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId:  order.id,
          raterId:  userId,
          score:    ratingScore,
          review:   ratingText.trim() || null,
        }),
      });
      if (res.ok) {
        setRatingOpen(false);
        setRatingText('');
        await load();
      } else {
        const d = await res.json();
        Alert.alert('Error', d.error ?? 'Failed to submit rating');
      }
    } catch { Alert.alert('Error', 'Network error'); } finally { setSubmitting(false); }
  }

  function goToChat() {
    if (!order) return;
    const otherId = isBuyer ? order.seller.id : order.buyer.id;
    // Create or open DM with the other party
    router.push(`/(chat)/new-dm?recipientId=${otherId}` as never);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator style={{ marginTop: spacing[16] }} color={colors.brand[600]} />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <HStack gap={3} align="center" style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color={colors.surface.heading} />
          </Pressable>
          <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Order</Text>
        </HStack>
        <Text variant="body" style={{ padding: spacing[6] }}>Order not found.</Text>
      </SafeAreaView>
    );
  }

  const otherParty = isBuyer ? order.seller : order.buyer;
  const canBuyerCancel  = isBuyer  && (order.status === 'pending' || order.status === 'confirmed');
  const canSellerAccept = isSeller && order.status === 'pending';
  const canSellerStart  = isSeller && order.status === 'confirmed';
  const canSellerComplete = isSeller && order.status === 'in_progress';
  const canBuyerRate = isBuyer && order.status === 'completed' && !order.rating;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <HStack gap={3} align="center" style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Order Details</Text>
        <Badge label={STATUS_LABEL[order.status]} tone={STATUS_TONE[order.status]} size="sm" />
      </HStack>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Order title + price */}
        <Card padding={4} elevation="sm">
          <VStack gap={2}>
            <Text variant="h3" style={{ color: colors.surface.heading }}>{order.title}</Text>
            {order.listing && (
              <Text variant="caption" tone="secondary" style={{ textTransform: 'capitalize' }}>
                {order.listing.category}
              </Text>
            )}
            <HStack justify="between" align="center">
              <Text variant="caption" tone="secondary">
                Placed {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
              <Text variant="h3" style={{ color: colors.brand[700] }}>
                ₹{(order.pricePaise / 100).toFixed(0)}
              </Text>
            </HStack>
          </VStack>
        </Card>

        {/* Status timeline */}
        <Card padding={4} elevation="xs">
          <VStack gap={3}>
            <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>Status</Text>
            {(['pending', 'confirmed', 'in_progress', 'completed'] as OrderStatus[]).map((s, i) => {
              const isActive  = order.status === s;
              const isPast    = ['pending','confirmed','in_progress','completed'].indexOf(order.status) > i;
              const isDone    = isPast || isActive;
              let textColor: string = colors.surface.textSecondary;
              if (isDone) textColor = colors.surface.heading;
              if (isActive) textColor = colors.brand[700];
              if (order.status === 'cancelled' || order.status === 'disputed') return null;
              return (
                <HStack key={s} gap={3} align="center">
                  <View style={[styles.dot, isDone && styles.dotDone]} />
                  <Text
                    variant="body"
                    style={{ color: textColor, fontWeight: isActive ? '700' : '400' }}
                  >
                    {STATUS_LABEL[s]}
                  </Text>
                  {isActive && (
                    <Badge label="Current" tone="warning" size="sm" />
                  )}
                </HStack>
              );
            })}
            {(order.status === 'cancelled' || order.status === 'disputed') && (
              <HStack gap={3} align="center">
                <XCircle size={16} color={colors.semantic?.danger ?? '#DC2626'} />
                <Text variant="body" style={{ color: colors.semantic?.danger ?? '#DC2626', fontWeight: '700' }}>
                  {STATUS_LABEL[order.status]}
                </Text>
              </HStack>
            )}
            {!!order.cancelReason && (
              <Text variant="caption" tone="secondary">Reason: {order.cancelReason}</Text>
            )}
          </VStack>
        </Card>

        {/* Schedule + address */}
        <Card padding={4} elevation="xs">
          <VStack gap={3}>
            <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>Booking Info</Text>
            {!!order.scheduledAt && (
              <HStack gap={3} align="center">
                <Calendar size={16} color={colors.brand[600]} />
                <Text variant="body" style={{ color: colors.surface.heading }}>
                  {new Date(order.scheduledAt).toLocaleString('en-IN', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </Text>
              </HStack>
            )}
            {!!order.addressNote && (
              <HStack gap={3} align="center">
                <MapPin size={16} color={colors.brand[600]} />
                <Text variant="body" style={{ color: colors.surface.heading, flex: 1 }}>
                  {order.addressNote}
                </Text>
              </HStack>
            )}
            {!!order.buyerNote && (
              <HStack gap={3} align="start">
                <Clock size={16} color={colors.surface.textSecondary} />
                <Text variant="caption" tone="secondary" style={{ flex: 1 }}>
                  Note: {order.buyerNote}
                </Text>
              </HStack>
            )}
          </VStack>
        </Card>

        {/* Parties */}
        <Card padding={4} elevation="xs">
          <VStack gap={3}>
            <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
              {isBuyer ? 'Service Provider' : 'Customer'}
            </Text>
            <HStack gap={3} align="center">
              <Avatar name={otherParty.name} size="md" />
              <VStack gap={0.5} style={{ flex: 1 }}>
                <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
                  {otherParty.name}
                </Text>
                {otherParty.kycTier === 'silver' || otherParty.kycTier === 'gold' ? (
                  <HStack gap={1} align="center">
                    <CheckCircle size={12} color={colors.semantic?.success ?? '#059669'} />
                    <Text variant="caption" tone="secondary" style={{ textTransform: 'capitalize' }}>
                      {otherParty.kycTier} verified
                    </Text>
                  </HStack>
                ) : null}
              </VStack>
              <Pressable onPress={goToChat} style={styles.chatBtn} accessibilityRole="button">
                <MessageCircle size={18} color={colors.brand[600]} />
              </Pressable>
            </HStack>
          </VStack>
        </Card>

        {/* Rating (if completed + already rated) */}
        {order.status === 'completed' && order.rating && isBuyer && (
          <Card padding={4} elevation="xs">
            <VStack gap={2}>
              <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>Your Rating</Text>
              <HStack gap={1}>
                {[1,2,3,4,5].map((n) => (
                  <Star key={n} size={20} color="#F59E0B" fill={n <= (order.rating?.score ?? 0) ? '#F59E0B' : 'transparent'} />
                ))}
              </HStack>
              {!!order.rating?.review && (
                <Text variant="body" style={{ color: colors.surface.heading }}>{order.rating.review}</Text>
              )}
            </VStack>
          </Card>
        )}

        {/* Seller note */}
        {!!order.sellerNote && (
          <Card padding={4} elevation="xs">
            <VStack gap={1}>
              <Text variant="caption" tone="secondary">Provider Note</Text>
              <Text variant="body" style={{ color: colors.surface.heading }}>{order.sellerNote}</Text>
            </VStack>
          </Card>
        )}

        {/* ── ACTION BUTTONS ── */}

        {/* SELLER actions */}
        {canSellerAccept && (
          <VStack gap={2}>
            <Button
              label={acting ? 'Accepting…' : 'Accept Booking'}
              disabled={acting}
              onPress={() => updateStatus('confirmed')}
              fullWidth
            />
            <Button
              label="Reject"
              variant="secondary"
              disabled={acting}
              onPress={confirmReject}
              fullWidth
            />
          </VStack>
        )}

        {canSellerStart && (
          <Button
            label={acting ? 'Starting…' : 'Start Work'}
            disabled={acting}
            onPress={() => updateStatus('in_progress')}
            fullWidth
          />
        )}

        {canSellerComplete && (
          <Button
            label={acting ? 'Completing…' : 'Mark as Complete'}
            disabled={acting}
            onPress={() => updateStatus('completed')}
            fullWidth
          />
        )}

        {/* BUYER actions */}
        {canBuyerCancel && (
          <Button
            label="Cancel Order"
            variant="secondary"
            disabled={acting}
            onPress={confirmCancel}
            fullWidth
          />
        )}

        {canBuyerRate && (
          <Button
            label="Rate this Service"
            onPress={() => setRatingOpen(true)}
            fullWidth
          />
        )}

        {order.status === 'completed' && (
          <Button
            label="Message Provider"
            variant="secondary"
            onPress={goToChat}
            fullWidth
          />
        )}

      </ScrollView>

      {/* ── RATING MODAL ── */}
      <Modal
        visible={ratingOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setRatingOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text variant="h3" style={{ color: colors.surface.heading, marginBottom: spacing[4] }}>
              Rate this Service
            </Text>

            {/* Star picker */}
            <HStack gap={2} style={{ justifyContent: 'center', marginBottom: spacing[4] }}>
              {[1,2,3,4,5].map((n) => (
                <Pressable key={n} onPress={() => setRatingScore(n)} accessibilityRole="button">
                  <Star
                    size={36}
                    color="#F59E0B"
                    fill={n <= ratingScore ? '#F59E0B' : 'transparent'}
                  />
                </Pressable>
              ))}
            </HStack>

            <Text variant="caption" tone="secondary" style={{ textAlign: 'center', marginBottom: spacing[3] }}>
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][ratingScore]}
            </Text>

            {/* Review text */}
            <TextInput
              value={ratingText}
              onChangeText={setRatingText}
              placeholder="Write a review (optional)…"
              placeholderTextColor={colors.surface.textSecondary}
              multiline
              numberOfLines={3}
              style={styles.reviewInput}
            />

            <VStack gap={2} style={{ marginTop: spacing[4] }}>
              <Button
                label={submitting ? 'Submitting…' : 'Submit Rating'}
                disabled={submitting}
                onPress={submitRating}
                fullWidth
              />
              <Button
                label="Cancel"
                variant="secondary"
                onPress={() => setRatingOpen(false)}
                fullWidth
              />
            </VStack>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  topBar:  {
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    backgroundColor: colors.surface.background,
    borderBottomWidth: 0.5, borderBottomColor: colors.surface.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center',
  },
  content: { padding: spacing[4], gap: spacing[3], paddingBottom: spacing[16] },
  dot: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: colors.gray[200], borderWidth: 2, borderColor: colors.gray[300],
  },
  dotDone: { backgroundColor: colors.brand[600], borderColor: colors.brand[600] },
  chatBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.brand[50], alignItems: 'center', justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface.background,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: spacing[6], paddingBottom: spacing[10],
  },
  reviewInput: {
    borderWidth: 1, borderColor: colors.surface.border,
    borderRadius: 10, padding: spacing[3],
    color: colors.surface.heading, fontSize: 14,
    minHeight: 80, textAlignVertical: 'top',
  },
});
