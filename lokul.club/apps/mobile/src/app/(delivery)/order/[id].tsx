import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Bike, Package, PackageX, Timer } from 'lucide-react-native';
import { Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { type Order } from '../index';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const STATUS_CONFIG = {
  preparing: { label: 'Preparing', color: colors.warning, icon: Timer },
  picked: { label: 'Picked Up', color: colors.info, icon: Package },
  delivering: { label: 'On the way', color: colors.brand[600], icon: Bike },
  delivered: { label: 'Delivered', color: colors.success, icon: Package },
  cancelled: { label: 'Cancelled', color: colors.danger, icon: PackageX },
};

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/delivery/orders/${id}`);
      const data = await res.json();
      setOrder(res.ok ? data.order : null);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack style={styles.header} gap="md">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>Order details</Text>
      </HStack>

      {!order ? (
        <VStack style={styles.emptyState} gap="sm">
          <PackageX size={48} color={colors.textSecondary} />
          <Text variant="body" style={{ fontWeight: '600' }}>Order not found</Text>
          <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
            This order may have been removed or the link is invalid.
          </Text>
        </VStack>
      ) : (
        <VStack style={styles.content} gap="md">
          {(() => {
            const status = STATUS_CONFIG[order.status];
            const StatusIcon = status.icon;
            return (
              <Card style={{ padding: spacing.lg }}>
                <HStack gap="md" style={{ alignItems: 'center' }}>
                  <View style={[styles.statusIcon, { backgroundColor: `${status.color}20` }]}>
                    <StatusIcon size={24} color={status.color} />
                  </View>
                  <VStack style={{ flex: 1 }}>
                    <Text variant="body" style={{ fontWeight: '700', color: status.color }}>
                      {status.label}
                    </Text>
                    {order.estimatedTime && order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <Text variant="caption" tone="secondary">
                        Arriving in {order.estimatedTime}
                      </Text>
                    )}
                  </VStack>
                </HStack>
              </Card>
            );
          })()}

          <Card style={{ padding: spacing.lg }}>
            <VStack gap="sm">
              <Text variant="label" tone="secondary">Store</Text>
              <Text variant="body" style={{ fontWeight: '600' }}>{order.storeName}</Text>

              <Text variant="label" tone="secondary" style={{ marginTop: spacing.sm }}>Items</Text>
              <Text variant="body">{order.items}</Text>

              <Text variant="label" tone="secondary" style={{ marginTop: spacing.sm }}>Ordered</Text>
              <Text variant="body">
                {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </Text>

              {order.deliveryPartner && (
                <>
                  <Text variant="label" tone="secondary" style={{ marginTop: spacing.sm }}>Delivery partner</Text>
                  <Text variant="body">{order.deliveryPartner}</Text>
                </>
              )}
            </VStack>
          </Card>

          <Card style={{ padding: spacing.lg }}>
            <HStack style={{ justifyContent: 'space-between' }}>
              <Text variant="body" style={{ fontWeight: '600' }}>Total</Text>
              <Text variant="h3" style={{ fontWeight: '700', color: colors.brand[600] }}>
                ₹{Math.round(order.totalPaise / 100)}
              </Text>
            </HStack>
          </Card>
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
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
