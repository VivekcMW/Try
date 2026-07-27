import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Clock, PackageX } from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { QUICK_ITEMS } from '@/data/delivery-catalog';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export default function ItemDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const pinCode = useOnboardingStore((s) => s.pin);
  const userId = useWalletStore((s) => s.userId);
  const balancePaise = useWalletStore((s) => s.balancePaise);
  const item = QUICK_ITEMS.find((i) => i.id === id);
  const [submitting, setSubmitting] = useState(false);

  async function handlePlaceOrder() {
    if (!item) {
      Alert.alert('Error', 'This item is no longer available.');
      return;
    }
    if (!userId || !pinCode) {
      Alert.alert('Not signed in', 'Please complete onboarding first.');
      return;
    }
    if (item.pricePaise > balancePaise) {
      Alert.alert('Insufficient balance', 'Please top up your Lokul Wallet and try again.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/delivery/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: userId,
          storeId: item.storeId,
          storeName: item.store,
          items: item.name,
          totalPaise: item.pricePaise,
          estimatedTime: item.deliveryTime,
          pinCode,
        }),
      });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      useWalletStore.getState().spend(item.pricePaise, `Order: ${item.store}`);
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
        <Text variant="h3" style={{ fontWeight: '700' }}>Item details</Text>
      </HStack>

      {!item ? (
        <VStack style={styles.emptyState} gap="sm">
          <PackageX size={48} color={colors.textSecondary} />
          <Text variant="body" style={{ fontWeight: '600' }}>Item not found</Text>
          <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
            This item may have been removed.
          </Text>
        </VStack>
      ) : (
        <VStack style={styles.content} gap="md">
          <Card style={{ padding: spacing.lg, alignItems: 'center' }}>
            <View style={styles.imageBox}>
              <Text style={{ fontSize: 56 }}>{item.image}</Text>
            </View>
            <Text variant="h3" style={{ fontWeight: '700', marginTop: spacing.md, textAlign: 'center' }}>
              {item.name}
            </Text>
            <Text variant="body" tone="secondary">{item.store}</Text>
          </Card>

          <Card style={{ padding: spacing.lg }}>
            <VStack gap="sm">
              <HStack style={{ justifyContent: 'space-between' }}>
                <Text variant="body" tone="secondary">Price</Text>
                <HStack gap="xs">
                  <Text variant="body" style={{ fontWeight: '700', color: colors.brand[600] }}>
                    ₹{Math.round(item.pricePaise / 100)}
                  </Text>
                  {item.originalPricePaise && (
                    <Text variant="caption" style={{ textDecorationLine: 'line-through', color: colors.textSecondary }}>
                      ₹{Math.round(item.originalPricePaise / 100)}
                    </Text>
                  )}
                </HStack>
              </HStack>
              <HStack style={{ justifyContent: 'space-between' }}>
                <Text variant="body" tone="secondary">Delivery time</Text>
                <HStack gap="xs">
                  <Clock size={14} color={colors.success} />
                  <Text variant="body" style={{ color: colors.success }}>{item.deliveryTime}</Text>
                </HStack>
              </HStack>
            </VStack>
          </Card>

          <Button
            label="Place order"
            onPress={handlePlaceOrder}
            loading={submitting}
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
  imageBox: {
    width: 96,
    height: 96,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
