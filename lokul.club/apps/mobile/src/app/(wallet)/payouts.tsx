// PRD §07 — Payouts
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Banknote, Building2, Clock } from 'lucide-react-native';
import { Badge, Button, Card, HStack, Text, VStack } from '@/components/ui';
import { VerificationGate } from '@/components/VerificationGate';
import { useWalletStore, rupees } from '@/store/walletStore';
import { useVerificationStore } from '@/store/verificationStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

export default function Payouts() {
  const router = useRouter();
  const { userId, token, balancePaise, payout } = useWalletStore();
  const tier = useVerificationStore((s) => s.tier);
  const [gateVisible, setGateVisible] = useState(false);
  const [amount, setAmount] = useState('500');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const paise = Math.max(0, Math.round(Number(amount) || 0) * 100);
  const valid = paise > 0 && paise <= balancePaise;

  const submit = async () => {
    if (!valid) return;
    if (tier === 'bronze') { setGateVisible(true); return; }
    if (!userId || !token) {
      setApiError('Please sign in again to request a payout');
      return;
    }
    setApiError(null);
    setLoading(true);
    try {
      const base = process.env.EXPO_PUBLIC_API_BASE ?? '';
      const res = await fetch(`${base}/api/mobile/wallet/payout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amountPaise: paise, accountLabel: 'HDFC Bank •••• 4521' }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setApiError(body.error ?? 'Payout failed');
        return;
      }
    } catch {
      setApiError('Network error — please try again');
      return;
    } finally {
      setLoading(false);
    }
    payout(paise);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>Payout to bank</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <VStack gap={4}>
          <Card padding={4} elevation="xs" bordered>
            <Text variant="caption" tone="secondary">Available balance</Text>
            <Text variant="h2" style={{ fontWeight: '800', color: colors.brand[700], marginTop: 4 }}>{rupees(balancePaise)}</Text>
          </Card>

          <VStack gap={1.5}>
            <Text variant="caption" style={{ fontWeight: '700' }}>Amount (₹)</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="500"
              placeholderTextColor={colors.surface.textSecondary}
              style={styles.input}
            />
            {!valid && amount.length > 0 && (
              <Text variant="caption" style={{ color: colors.semantic.danger }}>
                {paise > balancePaise ? 'Exceeds available balance' : 'Enter a valid amount'}
              </Text>
            )}
            {apiError ? (
              <Text variant="caption" style={{ color: colors.semantic.danger }}>{apiError}</Text>
            ) : null}
          </VStack>

          <Card padding={4} elevation="xs" bordered>
            <Text variant="caption" style={{ fontWeight: '700', textTransform: 'uppercase', color: colors.surface.textSecondary, letterSpacing: 0.6 }}>
              Linked bank account
            </Text>
            <HStack gap={3} align="center" style={{ marginTop: spacing[2.5] }}>
              <View style={styles.bankIcon}>
                <Building2 size={20} color={colors.brand[700]} />
              </View>
              <VStack gap={0.5} style={{ flex: 1 }}>
                <Text variant="body" style={{ fontWeight: '700' }}>HDFC Bank •••• 4521</Text>
                <Text variant="caption" tone="secondary">Vivek Choudhari · Savings</Text>
              </VStack>
              <Badge label="VERIFIED" tone="success" />
            </HStack>
          </Card>

          <HStack gap={2} align="center">
            <Clock size={14} color={colors.surface.textSecondary} />
            <Text variant="caption" tone="secondary">Funds land in 2–4 bank working hours · IMPS</Text>
          </HStack>
        </VStack>
      </ScrollView>

      <View style={styles.footer}>
        <View style={{ flex: 1 }}>
          <Button label={`Payout ${rupees(paise)}`} leftIcon={<Banknote size={16} color="#fff" />} onPress={submit} disabled={!valid || loading} loading={loading} fullWidth />
        </View>
      </View>

      <VerificationGate
        visible={gateVisible}
        onClose={() => setGateVisible(false)}
        action="withdraw funds to your bank"
      />
    </SafeAreaView>
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
  scroll: { padding: spacing[5], paddingBottom: spacing[10] },
  input: {
    borderWidth: 1, borderColor: colors.surface.border, borderRadius: radius.md,
    paddingHorizontal: spacing[3], paddingVertical: spacing[3],
    fontSize: 24, fontWeight: '700', color: colors.surface.foreground, backgroundColor: colors.surface.background,
  },
  bankIcon: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.brand[50], alignItems: 'center', justifyContent: 'center' },
  footer: {
    padding: spacing[4], paddingBottom: spacing[6], flexDirection: 'row',
    backgroundColor: colors.surface.background,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.surface.border,
  },
});
