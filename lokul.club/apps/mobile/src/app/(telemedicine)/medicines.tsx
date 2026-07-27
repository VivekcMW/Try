/**
 * Order Medicines
 * Route: /(telemedicine)/medicines
 */
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Minus, Pill, Plus } from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { MEDICINE_CATALOG } from '@/data/telemedicine-catalog';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export default function MedicinesScreen() {
  const router = useRouter();
  const userId = useWalletStore((s) => s.userId);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [placing, setPlacing] = useState(false);

  const setQty = (id: string, qty: number) => {
    setCart((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  };

  const items = useMemo(
    () =>
      Object.entries(cart).map(([catalogId, qty]) => {
        const med = MEDICINE_CATALOG.find((m) => m.id === catalogId)!;
        return { catalogId, name: med.name, qty, pricePaise: med.price * 100 };
      }),
    [cart],
  );
  const total = items.reduce((sum, i) => sum + (i.pricePaise / 100) * i.qty, 0);

  const handlePlaceOrder = async () => {
    if (items.length === 0 || !userId) return;
    setPlacing(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/telemedicine/medicine-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error('failed');
      Alert.alert('Order placed', `Your order of ${items.length} item(s) for ₹${Math.round(data.order.totalPaise / 100)} has been placed.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Failed to place order', 'Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <HStack gap={spacing.md} style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>Order Medicines</Text>
      </HStack>

      <ScrollView contentContainerStyle={styles.content}>
        <VStack gap={spacing.md}>
          {MEDICINE_CATALOG.map((med) => {
            const qty = cart[med.id] ?? 0;
            return (
              <Card key={med.id} style={styles.medCard}>
                <HStack gap={spacing.md} style={{ alignItems: 'center' }}>
                  <View style={styles.medIcon}>
                    <Pill size={20} color={colors.brand[600]} />
                  </View>
                  <VStack style={{ flex: 1 }}>
                    <Text variant="body" style={{ fontWeight: '600' }}>{med.name}</Text>
                    <Text variant="caption" tone="secondary">
                      {med.form}{med.requiresPrescription ? ' · Rx required' : ''}
                    </Text>
                    <Text variant="caption" style={{ color: colors.brand[600], fontWeight: '600' }}>₹{med.price}</Text>
                  </VStack>
                  <HStack gap={spacing.sm} style={{ alignItems: 'center' }}>
                    <Pressable
                      onPress={() => setQty(med.id, qty - 1)}
                      style={[styles.stepBtn, qty === 0 && { opacity: 0.4 }]}
                      disabled={qty === 0}
                    >
                      <Minus size={14} color={colors.foreground} />
                    </Pressable>
                    <Text variant="body" style={{ minWidth: 18, textAlign: 'center' }}>{qty}</Text>
                    <Pressable onPress={() => setQty(med.id, qty + 1)} style={styles.stepBtn}>
                      <Plus size={14} color={colors.foreground} />
                    </Pressable>
                  </HStack>
                </HStack>
              </Card>
            );
          })}
        </VStack>
      </ScrollView>

      <View style={styles.footer}>
        <HStack style={{ justifyContent: 'space-between', marginBottom: spacing.md }}>
          <Text variant="body" tone="secondary">Total ({items.length} item{items.length === 1 ? '' : 's'})</Text>
          <Text variant="body" style={{ fontWeight: '700' }}>₹{total}</Text>
        </HStack>
        <Button
          label={placing ? 'Placing order…' : 'Place Order'}
          fullWidth
          size="lg"
          disabled={items.length === 0 || placing}
          loading={placing}
          onPress={handlePlaceOrder}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.background },
  header: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: { padding: spacing.lg, paddingBottom: spacing[10] },
  medCard: { padding: spacing.md },
  medIcon: {
    width: 44, height: 44, borderRadius: radius.lg,
    backgroundColor: colors.brand[50], alignItems: 'center', justifyContent: 'center',
  },
  stepBtn: {
    width: 28, height: 28, borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center',
  },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
});
