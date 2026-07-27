import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, AlertCircle } from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { INSURANCE_ICON_MAP } from '@/data/insurance-catalog';
import { useWalletStore } from '@/store/walletStore';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { type ApiPolicy } from '../index';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const STATUS_CONFIG = {
  active: { color: colors.success, bg: '#D1FAE5', label: 'Active' },
  expired: { color: colors.danger, bg: '#FEE2E2', label: 'Expired' },
  pending: { color: colors.warning, bg: '#FEF3C7', label: 'Pending' },
} as const;

function formatDueDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function PolicyDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = useWalletStore((s) => s.userId);
  const balancePaise = useWalletStore((s) => s.balancePaise);
  const [policy, setPolicy] = useState<ApiPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [renewing, setRenewing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/insurance/policies/${id}`);
      const data = await res.json();
      setPolicy(res.ok ? data.policy : null);
    } catch {
      setPolicy(null);
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

  if (!policy) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.notFound}>
          <Text variant="body" tone="secondary">Policy not found.</Text>
          <Button label="Go back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const Icon = INSURANCE_ICON_MAP[policy.categoryIcon as keyof typeof INSURANCE_ICON_MAP] ?? INSURANCE_ICON_MAP.Shield;
  const status = STATUS_CONFIG[policy.status];

  async function handleRenew() {
    if (!userId) return;
    if (balancePaise < policy!.premiumPaise) {
      Alert.alert('Insufficient balance', 'Please top up your Lokul Wallet and try again.');
      return;
    }
    setRenewing(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/insurance/policies/${policy!.id}/renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error('failed');
      useWalletStore.getState().spend(policy!.premiumPaise, `Insurance renewal: ${policy!.planName}`);
      await load();
      Alert.alert('Renewed!', `${policy!.planName} has been renewed successfully.`);
    } catch {
      Alert.alert('Error', 'Could not process renewal — please try again.');
    } finally {
      setRenewing(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <VStack style={styles.headerTitle}>
          <Text variant="h3" style={{ fontWeight: '700' }}>{policy.planName}</Text>
          <Text variant="caption" tone="secondary">{policy.provider}</Text>
        </VStack>
        <View style={{ width: 24 }} />
      </HStack>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.heroCard}>
          <HStack gap={spacing.md} align="center">
            <View style={styles.icon}>
              <Icon size={28} color={colors.brand[600]} />
            </View>
            <VStack style={{ flex: 1 }}>
              <Text variant="bodyLg" style={{ fontWeight: '600' }}>{policy.planName}</Text>
              <Text variant="caption" tone="secondary">{policy.policyNumber}</Text>
            </VStack>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Text variant="caption" style={{ color: status.color, fontWeight: '600' }}>{status.label}</Text>
            </View>
          </HStack>

          <View style={styles.divider} />

          <HStack style={{ justifyContent: 'space-between' }}>
            <VStack>
              <Text variant="caption" tone="secondary">Cover Amount</Text>
              <Text variant="body" style={{ fontWeight: '700' }}>₹{(policy.coverAmountPaise / 100 / 100000).toFixed(0)}L</Text>
            </VStack>
            <VStack style={{ alignItems: 'flex-end' }}>
              <Text variant="caption" tone="secondary">Premium</Text>
              <Text variant="body" tone="brand" style={{ fontWeight: '700' }}>₹{Math.round(policy.premiumPaise / 100)}</Text>
            </VStack>
          </HStack>

          <View style={styles.divider} />

          <HStack style={{ justifyContent: 'space-between' }}>
            <Text variant="body" tone="secondary">Next Due</Text>
            <Text variant="body" style={{ fontWeight: '600' }}>{formatDueDate(policy.nextDueAt)}</Text>
          </HStack>
        </Card>

        <Card style={styles.reminderCard}>
          <HStack gap={spacing.md}>
            <AlertCircle size={22} color={colors.warning} />
            <VStack style={{ flex: 1 }}>
              <Text variant="body" style={{ fontWeight: '600' }}>Keep your cover active</Text>
              <Text variant="caption" tone="secondary">
                Renew before {formatDueDate(policy.nextDueAt)} to avoid a lapse in coverage.
              </Text>
            </VStack>
          </HStack>
          <View style={{ marginTop: spacing.md }}>
            <Button
              label={renewing ? 'Processing…' : `Renew Now — ₹${Math.round(policy.premiumPaise / 100)}`}
              variant="secondary"
              onPress={handleRenew}
              disabled={renewing}
              fullWidth
            />
          </View>
        </Card>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  heroCard: { padding: spacing.lg },
  icon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  reminderCard: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: '#FEF3C7',
    borderColor: colors.warning,
    borderWidth: 1,
  },
});
