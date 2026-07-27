import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, BadgePercent, Clock, MapPin, Star, Store as StoreIcon } from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { STORES, QUICK_ITEMS } from '@/data/delivery-catalog';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export default function StoreDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const pinCode = useOnboardingStore((s) => s.pin);
  const userId = useWalletStore((s) => s.userId);
  const balancePaise = useWalletStore((s) => s.balancePaise);
  const store = STORES.find((st) => st.id === id);
  const [submitting, setSubmitting] = useState(false);

  const storeItems = useMemo(
    () => (store ? QUICK_ITEMS.filter((i) => i.storeId === store.id) : []),
    [store],
  );

  async function handleOrderNow() {
    if (!store) {
      Alert.alert('Error', 'This store is no longer available.');
      return;
    }
    if (storeItems.length === 0) {
      Alert.alert('No items', 'This store has no quick items to order yet.');
      return;
    }
    if (!userId || !pinCode) {
      Alert.alert('Not signed in', 'Please complete onboarding first.');
      return;
    }
    const totalPaise = storeItems.reduce((sum, i) => sum + i.pricePaise, 0);
    if (totalPaise > balancePaise) {
      Alert.alert('Insufficient balance', 'Please top up your Lokul Wallet and try again.');
      return;
    }
    setSubmitting(true);
    try {
      const itemsLabel =
        storeItems.length === 1
          ? storeItems[0].name
          : `${storeItems[0].name} + ${storeItems.length - 1} more`;
      const res = await fetch(`${BASE}/api/mobile/delivery/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: userId,
          storeId: store.id,
          storeName: store.name,
          items: itemsLabel,
          totalPaise,
          estimatedTime: store.deliveryTime,
          pinCode,
        }),
      });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      useWalletStore.getState().spend(totalPaise, `Order: ${store.name}`);
      router.replace(`/(delivery)/order/${data.order.id}`);
    } catch {
      Alert.alert('Error', 'Could not place the order — please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack style={styles.header} gap="md">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>Store details</Text>
      </HStack>

      {!store ? (
        <VStack style={styles.emptyState} gap="sm">
          <StoreIcon size={48} color={colors.textSecondary} />
          <Text variant="body" style={{ fontWeight: '600' }}>Store not found</Text>
          <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
            This store may have been removed or the link is invalid.
          </Text>
        </VStack>
      ) : (
        <VStack style={styles.content} gap="md">
          <Card style={{ padding: spacing.lg }}>
            <HStack style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <VStack style={{ flex: 1 }}>
                <Text variant="h3" style={{ fontWeight: '700' }}>{store.name}</Text>
                <HStack gap="sm" style={{ marginTop: spacing.xs }}>
                  <HStack gap="xs">
                    <Star size={13} color={colors.warning} fill={colors.warning} />
                    <Text variant="body">{store.rating} ({store.reviews})</Text>
                  </HStack>
                </HStack>
              </VStack>
              {!store.isOpen && (
                <View style={styles.closedBadge}>
                  <Text variant="caption" style={{ color: colors.danger }}>Closed</Text>
                </View>
              )}
            </HStack>

            {store.offers && (
              <HStack gap="xs" style={styles.offerRow}>
                <BadgePercent size={14} color={colors.success} />
                <Text variant="caption" style={{ color: colors.success, fontWeight: '600' }}>
                  {store.offers}
                </Text>
              </HStack>
            )}

            <HStack gap="lg" style={{ marginTop: spacing.md }}>
              <HStack gap="xs">
                <MapPin size={14} color={colors.textSecondary} />
                <Text variant="caption" tone="secondary">{store.distance}</Text>
              </HStack>
              <HStack gap="xs">
                <Clock size={14} color={colors.textSecondary} />
                <Text variant="caption" tone="secondary">{store.deliveryTime}</Text>
              </HStack>
            </HStack>

            <HStack gap="lg" style={{ marginTop: spacing.xs }}>
              <Text variant="caption" tone="secondary">
                {store.deliveryFeePaise === 0 ? 'Free delivery' : `₹${Math.round(store.deliveryFeePaise / 100)} delivery fee`}
              </Text>
              {store.minOrderPaise > 0 && (
                <Text variant="caption" tone="secondary">Min order: ₹{Math.round(store.minOrderPaise / 100)}</Text>
              )}
            </HStack>
          </Card>

          <VStack gap="sm">
            <Text variant="bodyLg" style={{ fontWeight: '600' }}>Quick items</Text>
            {storeItems.length === 0 ? (
              <Card style={{ padding: spacing.lg, alignItems: 'center' }}>
                <Text variant="caption" tone="secondary">No quick items from this store yet</Text>
              </Card>
            ) : (
              storeItems.map((item) => (
                <Pressable key={item.id} onPress={() => router.push(`/(delivery)/item/${item.id}`)}>
                  <Card style={styles.itemRow}>
                    <HStack gap="md" style={{ alignItems: 'center' }}>
                      <View style={styles.itemEmoji}>
                        <Text style={{ fontSize: 24 }}>{item.image}</Text>
                      </View>
                      <VStack style={{ flex: 1 }}>
                        <Text variant="body" style={{ fontWeight: '600' }}>{item.name}</Text>
                        <Text variant="caption" tone="secondary">{item.deliveryTime}</Text>
                      </VStack>
                      <Text variant="body" style={{ fontWeight: '700', color: colors.brand[600] }}>
                        ₹{Math.round(item.pricePaise / 100)}
                      </Text>
                    </HStack>
                  </Card>
                </Pressable>
              ))
            )}
          </VStack>

          <Button
            label="Order now"
            onPress={handleOrderNow}
            loading={submitting}
            disabled={!store.isOpen}
            fullWidth
          />
        </VStack>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: {
    padding: spacing.lg,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  closedBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  offerRow: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  itemEmoji: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemRow: {
    padding: spacing.md,
  },
});
