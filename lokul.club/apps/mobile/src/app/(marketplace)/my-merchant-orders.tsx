import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Package, ShoppingBag } from 'lucide-react-native';
import { Badge, Card, HStack, Text, VStack } from '@/components/ui';
import { useWalletStore } from '@/store/walletStore';
import { colors, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type MerchantOrder = {
  id: string;
  orderNumber: string;
  status: string;
  totalPaise: number;
  createdAt: string;
  merchant: {
    id: string;
    name: string;
    category: string;
  };
  orderItems: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
};

const STATUS_COLORS: Record<string, string> = {
  pending: colors.gray[500],
  confirmed: colors.blue[600],
  in_progress: colors.yellow[600],
  completed: colors.green[600],
  cancelled: colors.red[600],
  disputed: colors.red[600],
};

export default function MyMerchantOrdersScreen() {
  const router = useRouter();
  const userId = useWalletStore((s) => s.userId);
  const [orders, setOrders] = useState<MerchantOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${BASE}/api/mobile/merchant-orders?customerId=${userId}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = () => {
    setRefreshing(true);
    load();
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

  const getItemsSummary = (items: MerchantOrder['orderItems']) => {
    if (items.length === 0) return 'No items';
    if (items.length === 1) return items[0].name;
    return `${items[0].name} +${items.length - 1} more`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack gap={3} align="center" style={styles.topBar}>
        <ShoppingBag size={24} color={colors.surface.heading} />
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>
          My Orders
        </Text>
      </HStack>

      {orders.length === 0 ? (
        <View style={styles.emptyState}>
          <Package size={64} color={colors.gray[300]} />
          <Text variant="h3" style={{ color: colors.surface.heading, marginTop: spacing[4] }}>
            No orders yet
          </Text>
          <Text variant="body" tone="secondary" style={{ textAlign: 'center', marginTop: spacing[2] }}>
            Start shopping and your orders will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={{ padding: spacing[4] }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/(marketplace)/merchant-order/${item.id}` as never)}
              style={{ marginBottom: spacing[3] }}
            >
              <Card padding={3} elevation="sm">
                <VStack gap={2}>
                  <HStack gap={2} align="center" style={{ justifyContent: 'space-between' }}>
                    <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
                      {item.orderNumber}
                    </Text>
                    <Badge
                      label={item.status.replace('_', ' ').toUpperCase()}
                      tone="neutral"
                      style={{ backgroundColor: STATUS_COLORS[item.status] || colors.gray[500] }}
                    />
                  </HStack>
                  <VStack gap={0}>
                    <Text variant="body" style={{ fontWeight: '600', color: colors.surface.heading }}>
                      {item.merchant.name}
                    </Text>
                    <Text variant="caption" tone="secondary">{item.merchant.category}</Text>
                  </VStack>
                  <Text variant="caption" tone="secondary" numberOfLines={1}>
                    {getItemsSummary(item.orderItems)}
                  </Text>
                  <HStack gap={2} align="center" style={{ justifyContent: 'space-between', marginTop: spacing[1] }}>
                    <Text variant="caption" tone="secondary">{formatDate(item.createdAt)}</Text>
                    <Text variant="body" style={{ fontWeight: '700', color: colors.brand[600] }}>
                      ₹{(item.totalPaise / 100).toFixed(2)}
                    </Text>
                  </HStack>
                </VStack>
              </Card>
            </Pressable>
          )}
        />
      )}
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
});
