import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { useCartStore } from '@/store/cartStore';
import { colors, spacing } from '@lokul/ui-tokens';

export default function CartScreen() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);
  const merchantName = items[0]?.merchantName;

  const handleCheckout = () => {
    if (items.length === 0) return;
    router.push('/(marketplace)/checkout' as never);
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearCart },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack gap={3} align="center" style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Shopping Cart</Text>
        {items.length > 0 && (
          <Pressable onPress={handleClearCart} style={styles.clearBtn} accessibilityRole="button">
            <Trash2 size={18} color={colors.semantic.danger} />
          </Pressable>
        )}
      </HStack>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <ShoppingCart size={64} color={colors.gray[300]} />
          <Text variant="h3" style={{ color: colors.surface.heading, marginTop: spacing[4] }}>
            Your cart is empty
          </Text>
          <Text variant="body" tone="secondary" style={{ textAlign: 'center', marginTop: spacing[2] }}>
            Browse products and add items to your cart
          </Text>
          <Button
            label="Browse Products"
            onPress={() => router.push('/(marketplace)' as never)}
            style={{ marginTop: spacing[6] }}
          />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={{ paddingBottom: spacing[24] }}>
            {/* Merchant Name */}
            <View style={styles.merchantHeader}>
              <Text variant="body" tone="secondary">Order from</Text>
              <Text variant="h3" style={{ color: colors.surface.heading, marginTop: spacing[1] }}>
                {merchantName}
              </Text>
            </View>

            {/* Cart Items */}
            <VStack gap={3} style={styles.itemsSection}>
              {items.map((item) => (
                <Card key={item.id} padding={3} elevation="sm">
                  <HStack gap={3}>
                    <View style={styles.itemImage}>
                      <View style={[styles.itemImagePlaceholder, { backgroundColor: colors.brand[50] }]}>
                        <Text variant="h3" style={{ color: colors.brand[600] }}>
                          {item.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <VStack gap={1} style={{ flex: 1 }}>
                      <HStack gap={2} align="center" style={{ justifyContent: 'space-between' }}>
                        <Text variant="body" style={{ fontWeight: '600', color: colors.surface.heading, flex: 1 }}>
                          {item.name}
                        </Text>
                        <Pressable onPress={() => removeItem(item.id)} style={styles.removeBtn}>
                          <Trash2 size={16} color={colors.semantic.danger} />
                        </Pressable>
                      </HStack>
                      <Text variant="caption" tone="secondary">
                        ₹{(item.pricePaise / 100).toFixed(2)}
                        {item.unit && ` per ${item.unit}`}
                      </Text>
                      <HStack gap={3} align="center" style={{ marginTop: spacing[2], justifyContent: 'space-between' }}>
                        <HStack gap={2} align="center">
                          <Pressable
                            onPress={() => updateQuantity(item.id, item.quantity - 1)}
                            style={styles.qtyBtn}
                          >
                            <Minus size={16} color={colors.surface.heading} />
                          </Pressable>
                          <Text variant="body" style={{ fontWeight: '600', minWidth: 30, textAlign: 'center' }}>
                            {item.quantity}
                          </Text>
                          <Pressable
                            onPress={() => updateQuantity(item.id, item.quantity + 1)}
                            style={styles.qtyBtn}
                          >
                            <Plus size={16} color={colors.surface.heading} />
                          </Pressable>
                        </HStack>
                        <Text variant="body" style={{ fontWeight: '700', color: colors.brand[600] }}>
                          ₹{((item.pricePaise * item.quantity) / 100).toFixed(2)}
                        </Text>
                      </HStack>
                    </VStack>
                  </HStack>
                </Card>
              ))}
            </VStack>

            {/* Bill Summary */}
            <Card padding={4} elevation="sm" style={styles.billCard}>
              <VStack gap={2}>
                <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading, marginBottom: spacing[2] }}>
                  Bill Summary
                </Text>
                <HStack gap={2} align="center" style={{ justifyContent: 'space-between' }}>
                  <Text variant="body" tone="secondary">Subtotal</Text>
                  <Text variant="body" style={{ fontWeight: '600' }}>
                    ₹{(getTotalPrice() / 100).toFixed(2)}
                  </Text>
                </HStack>
                <HStack gap={2} align="center" style={{ justifyContent: 'space-between' }}>
                  <Text variant="body" tone="secondary">Delivery Fee</Text>
                  <Text variant="body" style={{ fontWeight: '600' }}>₹0.00</Text>
                </HStack>
                <View style={styles.divider} />
                <HStack gap={2} align="center" style={{ justifyContent: 'space-between' }}>
                  <Text variant="h3" style={{ color: colors.surface.heading }}>Total</Text>
                  <Text variant="h3" style={{ color: colors.brand[600] }}>
                    ₹{(getTotalPrice() / 100).toFixed(2)}
                  </Text>
                </HStack>
              </VStack>
            </Card>
          </ScrollView>

          {/* Checkout Button */}
          <View style={styles.checkoutBar}>
            <Button
              label={`Proceed to Checkout (₹${(getTotalPrice() / 100).toFixed(2)})`}
              onPress={handleCheckout}
              fullWidth
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.background },
  topBar: {
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    borderBottomWidth: 0.5, borderBottomColor: colors.surface.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center',
  },
  clearBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.semantic.dangerBg, alignItems: 'center', justifyContent: 'center',
  },
  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  merchantHeader: {
    paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[3],
    borderBottomWidth: 0.5, borderBottomColor: colors.surface.border,
  },
  itemsSection: { paddingHorizontal: spacing[4], paddingTop: spacing[4] },
  itemImage: { width: 64, height: 64, borderRadius: 8, overflow: 'hidden' },
  itemImagePlaceholder: {
    width: '100%', height: '100%', backgroundColor: colors.gray[100],
    alignItems: 'center', justifyContent: 'center',
  },
  removeBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.semantic.dangerBg, alignItems: 'center', justifyContent: 'center',
  },
  qtyBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center',
  },
  billCard: { marginHorizontal: spacing[4], marginTop: spacing[4] },
  divider: { height: 0.5, backgroundColor: colors.surface.border, marginVertical: spacing[2] },
  checkoutBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    backgroundColor: colors.surface.background,
    borderTopWidth: 0.5, borderTopColor: colors.surface.border,
  },
});
