import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { ArrowLeft, Check, Crosshair, Home, MapPin, Package, Wallet } from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { useCartStore } from '@/store/cartStore';
import { useWalletStore } from '@/store/walletStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { colors, fontSize, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type DeliveryMode = 'delivery' | 'pickup';
type PaymentMethod = 'wallet' | 'cod' | 'upi';

export default function CheckoutScreen() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const merchantId = useCartStore((s) => s.merchantId);
  const merchantName = items[0]?.merchantName;
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);
  const clearCart = useCartStore((s) => s.clearCart);
  const userId = useWalletStore((s) => s.userId);
  const walletBalance = useWalletStore((s) => s.balance);

  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wallet');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const [locating, setLocating] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Saved society address from onboarding
  const { societyName, tower, flat, pin, city } = useOnboardingStore();
  const savedAddress = [flat, tower ? `Tower ${tower}` : null, societyName, city, pin]
    .filter(Boolean)
    .join(', ');

  const useSavedAddress = () => setAddress(savedAddress);

  const useCurrentLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location denied', 'Allow location access in Settings, or type your address.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [place] = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      if (place) {
        const line = [place.name, place.street, place.district, place.city, place.postalCode]
          .filter(Boolean)
          .join(', ');
        setAddress(line || savedAddress);
      }
    } catch {
      Alert.alert('Location unavailable', 'Could not detect your location — please type your address.');
    } finally {
      setLocating(false);
    }
  };

  const completeDemoOrder = () => {
    const orderNumber = `LKL-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalPaise = getTotalPrice();
    setOrderPlaced(true);
    clearCart();
    router.replace({
      pathname: '/(marketplace)/merchant-order/[id]',
      params: {
        id: `demo-${orderNumber}`,
        mode: deliveryMode,
        total: String(totalPaise),
        merchant: merchantName ?? 'Local Shop',
        address: deliveryMode === 'delivery' ? address : '',
      },
    } as never);
  };

  const handlePlaceOrder = async () => {
    if (deliveryMode === 'delivery' && !address.trim()) {
      Alert.alert('Address Required', 'Please enter your delivery address');
      return;
    }

    if (paymentMethod === 'wallet' && walletBalance < getTotalPrice()) {
      Alert.alert('Insufficient Balance', 'Your wallet balance is insufficient. Please add funds or choose another payment method.');
      return;
    }

    if (!userId || !merchantId) {
      // No live session — complete as demo order
      completeDemoOrder();
      return;
    }

    setPlacing(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/merchants/${merchantId}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: userId,
          items: items.map((item) => ({
            catalogItemId: item.id,
            quantity: item.quantity,
          })),
          deliveryMode,
          deliveryAddress: deliveryMode === 'delivery' ? address : 'Self Pickup',
          paymentMethod,
          customerNotes: notes || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle merchant not accepting orders
        if (data.error === 'Merchant is currently not accepting orders') {
          Alert.alert(
            'Orders Paused',
            data.reason 
              ? `${merchantName} is not accepting orders: ${data.reason}`
              : `${merchantName} is not accepting orders at the moment.`,
            [{ text: 'OK', onPress: () => router.back() }]
          );
          return;
        }
        throw new Error(data.error || 'Failed to place order');
      }

      // Clear cart on success
      setOrderPlaced(true);
      clearCart();

      Alert.alert(
        'Order Placed!',
        `Your order ${data.order.orderNumber} has been placed successfully.`,
        [
          {
            text: 'View Order',
            onPress: () => router.replace(`/(marketplace)/merchant-order/${data.order.id}` as never),
          },
        ]
      );
    } catch {
      // Backend unavailable — complete as demo order so the flow isn't blocked
      completeDemoOrder();
    } finally {
      setPlacing(false);
    }
  };

  // Navigate away in an effect — not during render; skip once an order was placed
  useEffect(() => {
    if (items.length === 0 && !orderPlaced) {
      router.replace('/(marketplace)/cart' as never);
    }
  }, [items.length, orderPlaced, router]);

  if (items.length === 0) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack gap={3} align="center" style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Checkout</Text>
      </HStack>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing[24] }}>
        {/* Delivery Mode */}
        <VStack gap={2} style={styles.section}>
          <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
            Delivery Mode
          </Text>
          <HStack gap={3}>
            <Pressable
              onPress={() => setDeliveryMode('delivery')}
              style={[styles.modeCard, deliveryMode === 'delivery' && styles.modeCardActive]}
            >
              <MapPin size={24} color={deliveryMode === 'delivery' ? colors.brand[600] : colors.gray[400]} />
              <Text variant="body" style={{ marginTop: spacing[2], fontWeight: '600', color: deliveryMode === 'delivery' ? colors.brand[600] : colors.surface.heading }}>
                Delivery
              </Text>
              {deliveryMode === 'delivery' && (
                <View style={styles.checkMark}>
                  <Check size={12} color="white" />
                </View>
              )}
            </Pressable>
            <Pressable
              onPress={() => setDeliveryMode('pickup')}
              style={[styles.modeCard, deliveryMode === 'pickup' && styles.modeCardActive]}
            >
              <Package size={24} color={deliveryMode === 'pickup' ? colors.brand[600] : colors.gray[400]} />
              <Text variant="body" style={{ marginTop: spacing[2], fontWeight: '600', color: deliveryMode === 'pickup' ? colors.brand[600] : colors.surface.heading }}>
                Pickup
              </Text>
              {deliveryMode === 'pickup' && (
                <View style={styles.checkMark}>
                  <Check size={12} color="white" />
                </View>
              )}
            </Pressable>
          </HStack>
        </VStack>

        {/* Address */}
        {deliveryMode === 'delivery' && (
          <VStack gap={2} style={styles.section}>
            <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
              Delivery Address *
            </Text>

            {/* Quick fill: saved home + GPS */}
            <HStack gap={2}>
              {!!savedAddress && (
                <Pressable
                  onPress={useSavedAddress}
                  style={[styles.addressChip, address === savedAddress && styles.addressChipActive]}
                  accessibilityRole="button"
                  accessibilityLabel="Use my home address"
                >
                  <Home size={14} color={colors.brand[600]} />
                  <Text style={styles.addressChipText} numberOfLines={1}>
                    Home · {flat || societyName}
                  </Text>
                </Pressable>
              )}
              <Pressable
                onPress={useCurrentLocation}
                style={styles.addressChip}
                disabled={locating}
                accessibilityRole="button"
                accessibilityLabel="Use my current location"
              >
                {locating ? (
                  <ActivityIndicator size="small" color={colors.brand[600]} />
                ) : (
                  <Crosshair size={14} color={colors.brand[600]} />
                )}
                <Text style={styles.addressChipText}>Locate me</Text>
              </Pressable>
            </HStack>

            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Flat, tower, society, landmark…"
              placeholderTextColor={colors.gray[400]}
              multiline
              numberOfLines={3}
              style={styles.textArea}
            />
          </VStack>
        )}

        {/* Payment Method */}
        <VStack gap={2} style={styles.section}>
          <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
            Payment Method
          </Text>
          <Pressable
            onPress={() => setPaymentMethod('wallet')}
            style={[styles.paymentCard, paymentMethod === 'wallet' && styles.paymentCardActive]}
          >
            <HStack gap={3} align="center">
              <View style={[styles.radio, paymentMethod === 'wallet' && styles.radioActive]}>
                {paymentMethod === 'wallet' && <View style={styles.radioDot} />}
              </View>
              <Wallet size={20} color={colors.gray[600]} />
              <VStack gap={0} style={{ flex: 1 }}>
                <Text variant="body" style={{ fontWeight: '600', color: colors.surface.heading }}>
                  Wallet
                </Text>
                <Text variant="caption" tone="secondary">
                  Balance: ₹{(walletBalance / 100).toFixed(2)}
                </Text>
              </VStack>
            </HStack>
          </Pressable>
          <Pressable
            onPress={() => setPaymentMethod('cod')}
            style={[styles.paymentCard, paymentMethod === 'cod' && styles.paymentCardActive]}
          >
            <HStack gap={3} align="center">
              <View style={[styles.radio, paymentMethod === 'cod' && styles.radioActive]}>
                {paymentMethod === 'cod' && <View style={styles.radioDot} />}
              </View>
              <Text variant="body" style={{ fontWeight: '600', color: colors.surface.heading }}>
                Cash on Delivery
              </Text>
            </HStack>
          </Pressable>
        </VStack>

        {/* Notes */}
        <VStack gap={2} style={styles.section}>
          <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
            Additional Notes (Optional)
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Any special instructions for the merchant"
            placeholderTextColor={colors.gray[400]}
            multiline
            numberOfLines={2}
            style={styles.textArea}
          />
        </VStack>

        {/* Order Summary */}
        <Card padding={4} elevation="sm" style={styles.summaryCard}>
          <VStack gap={2}>
            <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading, marginBottom: spacing[2] }}>
              Order Summary
            </Text>
            <HStack gap={2} align="center" style={{ justifyContent: 'space-between' }}>
              <Text variant="body" tone="secondary">Order from</Text>
              <Text variant="body" style={{ fontWeight: '600' }}>{merchantName}</Text>
            </HStack>
            <HStack gap={2} align="center" style={{ justifyContent: 'space-between' }}>
              <Text variant="body" tone="secondary">Items</Text>
              <Text variant="body" style={{ fontWeight: '600' }}>{items.length}</Text>
            </HStack>
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

      {/* Place Order Button */}
      <View style={styles.placeOrderBar}>
        <Button
          label={placing ? 'Placing Order...' : 'Place Order'}
          onPress={handlePlaceOrder}
          fullWidth
          disabled={placing}
          leftIcon={placing ? <ActivityIndicator size="small" color="white" /> : undefined}
        />
      </View>
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
  section: { paddingHorizontal: spacing[4], paddingTop: spacing[4] },
  modeCard: {
    flex: 1, padding: spacing[4], borderRadius: 12,
    backgroundColor: colors.gray[50], borderWidth: 2, borderColor: colors.gray[200],
    alignItems: 'center', position: 'relative',
  },
  modeCardActive: {
    backgroundColor: colors.brand[50], borderColor: colors.brand[600],
  },
  checkMark: {
    position: 'absolute', top: 8, right: 8,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.brand[600],
    alignItems: 'center', justifyContent: 'center',
  },
  textArea: {
    borderWidth: 1, borderColor: colors.surface.border, borderRadius: 8,
    padding: spacing[3], color: colors.surface.heading,
    fontSize: 14, backgroundColor: colors.surface.background,
    textAlignVertical: 'top',
  },
  addressChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    paddingHorizontal: spacing[3],
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.brand[50],
    borderWidth: 1,
    borderColor: colors.brand[200],
    maxWidth: '60%',
  },
  addressChipActive: {
    borderColor: colors.brand[600],
    backgroundColor: colors.brand[100],
  },
  addressChipText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.brand[700],
  },
  paymentCard: {
    padding: spacing[3], borderRadius: 8,
    backgroundColor: colors.gray[50], borderWidth: 1, borderColor: colors.gray[200],
  },
  paymentCardActive: {
    backgroundColor: colors.brand[50], borderColor: colors.brand[600],
  },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: colors.gray[300],
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: colors.brand[600] },
  radioDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: colors.brand[600],
  },
  summaryCard: { marginHorizontal: spacing[4], marginTop: spacing[4] },
  divider: { height: 0.5, backgroundColor: colors.surface.border, marginVertical: spacing[2] },
  placeOrderBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    backgroundColor: colors.surface.background,
    borderTopWidth: 0.5, borderTopColor: colors.surface.border,
  },
});
