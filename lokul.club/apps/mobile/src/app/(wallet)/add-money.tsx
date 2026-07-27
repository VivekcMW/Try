// PRD §07 — Add money
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, CreditCard, Smartphone, Wallet } from 'lucide-react-native';
import { Badge, Button, Card, HStack, Text, VStack } from '@/components/ui';
import { VerificationGate } from '@/components/VerificationGate';
import { useWalletStore } from '@/store/walletStore';
import { useVerificationStore } from '@/store/verificationStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';
// RazorpayCheckout is lazy-required at call-time so it doesn't crash in Expo Go

const QUICK = [200, 500, 1000, 2000, 5000];

export default function AddMoney() {
  const router = useRouter();
  const { userId, addMoney, setBalance } = useWalletStore();
  const tier = useVerificationStore((s) => s.tier);
  const [gateVisible, setGateVisible] = useState(false);
  const [amount, setAmount] = useState(500);
  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (tier === 'bronze') { setGateVisible(true); return; }
    if (!userId) return;
    const paise = amount * 100;
    const base = process.env.EXPO_PUBLIC_API_BASE ?? '';
    setLoading(true);
    try {
      // Step 1 — Create Razorpay order
      const createRes = await fetch(`${base}/api/mobile/wallet/payment/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amountPaise: paise, purpose: 'wallet_topup' }),
      });
      const order = await createRes.json() as {
        orderId: string; amountPaise: number; currency: string; keyId: string; isStub?: boolean;
      };
      if (!createRes.ok) throw new Error('Failed to create order');

      // Step 2 — Open Razorpay checkout (stub-safe)
      if (order.isStub) {
        // Dev / E2E path — credit directly
        addMoney(paise);
        router.back();
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const RazorpayCheckout = (require('react-native-razorpay') as { default: { open: (opts: Record<string, unknown>) => Promise<unknown> } }).default;
      const paymentData = await RazorpayCheckout.open({
        key: order.keyId,
        amount: order.amountPaise,
        currency: order.currency ?? 'INR',
        order_id: order.orderId,
        name: 'Lokul',
        description: 'Wallet top-up',
        prefill: { method },
        theme: { color: '#208AEF' },
      }) as { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };

      // Step 3 — Verify payment server-side
      const verifyRes = await fetch(`${base}/api/mobile/wallet/payment/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpayOrderId: paymentData.razorpay_order_id,
          razorpayPaymentId: paymentData.razorpay_payment_id,
          razorpaySignature: paymentData.razorpay_signature,
        }),
      });
      const verifyData = await verifyRes.json() as { ok: boolean; newBalancePaise?: number };
      if (verifyRes.ok && verifyData.ok) {
        if (verifyData.newBalancePaise !== undefined && typeof setBalance === 'function') {
          setBalance(verifyData.newBalancePaise);
        } else {
          addMoney(paise);
        }
        router.back();
      } else {
        Alert.alert('Payment verification failed', 'Your payment may still be processing. Please check your wallet balance.');
      }
    } catch (err: unknown) {
      const isUserCancelled = typeof err === 'object' && err !== null && (err as { code?: string }).code === 'PAYMENT_CANCELLED';
      if (!isUserCancelled) {
        Alert.alert('Payment failed', 'Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>Add money</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <VStack gap={4}>
          <Card padding={5} elevation="xs" bordered>
            <Text variant="caption" tone="secondary">Amount</Text>
            <Text style={{ fontSize: 42, fontWeight: '800', color: colors.brand[700], marginTop: 4 }}>₹{amount.toLocaleString('en-IN')}</Text>
            <HStack gap={2} align="center" style={{ marginTop: spacing[3], flexWrap: 'wrap' }}>
              {QUICK.map((q) => (
                <Pressable key={q} onPress={() => setAmount(q)} style={[styles.chip, amount === q && styles.chipActive]}>
                  <Text variant="caption" style={{ fontWeight: '700', color: amount === q ? colors.brand[700] : colors.surface.foreground }}>+₹{q}</Text>
                </Pressable>
              ))}
            </HStack>
          </Card>

          <VStack gap={2}>
            <Text variant="caption" style={{ fontWeight: '700', textTransform: 'uppercase', color: colors.surface.textSecondary, letterSpacing: 0.6 }}>
              Payment method
            </Text>
            <Method Icon={Smartphone} title="UPI" desc="Pay via PhonePe / GPay / Paytm" v="upi" current={method} onChange={setMethod} />
            <Method Icon={CreditCard} title="Credit / Debit Card" desc="Visa, Mastercard, Rupay" v="card" current={method} onChange={setMethod} />
            <Method Icon={Wallet} title="Netbanking" desc="All major banks" v="netbanking" current={method} onChange={setMethod} />
          </VStack>
        </VStack>
      </ScrollView>

      <View style={styles.footer}>
        <View style={{ flex: 1 }}>
          <Button label={`Add ₹${amount.toLocaleString('en-IN')}`} onPress={submit} loading={loading} disabled={loading} fullWidth />
        </View>
      </View>

      <VerificationGate
        visible={gateVisible}
        onClose={() => setGateVisible(false)}
        action="add money to your wallet"
      />
    </SafeAreaView>
  );
}

function Method({ Icon, title, desc, v, current, onChange }: { readonly Icon: any; readonly title: string; readonly desc: string; readonly v: 'upi' | 'card' | 'netbanking'; readonly current: string; readonly onChange: (x: any) => void }) {
  const active = current === v;
  return (
    <Pressable onPress={() => onChange(v)}>
      <Card padding={3.5} elevation="none" bordered style={active ? { borderColor: colors.brand[600], borderWidth: 2, backgroundColor: colors.brand[50] } : undefined}>
        <HStack gap={3} align="center">
          <Icon size={20} color={active ? colors.brand[700] : colors.surface.textSecondary} />
          <VStack gap={0.5} style={{ flex: 1 }}>
            <Text variant="body" style={{ fontWeight: '700' }}>{title}</Text>
            <Text variant="caption" tone="secondary">{desc}</Text>
          </VStack>
          {v === 'upi' && <Badge label="INSTANT" tone="success" />}
        </HStack>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    backgroundColor: colors.surface.background,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.surface.border,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing[4], paddingBottom: spacing[10] },
  chip: { paddingHorizontal: spacing[3], paddingVertical: spacing[2], backgroundColor: colors.gray[100], borderRadius: radius.full },
  chipActive: { backgroundColor: colors.brand[50], borderWidth: 1, borderColor: colors.brand[400] },
  footer: {
    padding: spacing[4], paddingBottom: spacing[6], flexDirection: 'row',
    backgroundColor: colors.surface.background,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.surface.border,
  },
});
