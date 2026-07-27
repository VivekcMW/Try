import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Star, CheckCircle } from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { PLANS } from '@/data/insurance-catalog';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { colors, spacing, radius } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export default function PlanDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const plan = PLANS.find((p) => p.id === id);
  const pinCode = useOnboardingStore((s) => s.pin);
  const userId = useWalletStore((s) => s.userId);
  const balancePaise = useWalletStore((s) => s.balancePaise);
  const [buying, setBuying] = useState(false);

  if (!plan) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.notFound}>
          <Text variant="body" tone="secondary">Plan not found.</Text>
          <Button label="Go back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  async function handleBuy() {
    const premiumPaise = Math.round(plan!.premium * 100);
    if (balancePaise < premiumPaise) {
      Alert.alert('Insufficient balance', 'Please top up your Lokul Wallet and try again.');
      return;
    }
    if (!userId || !pinCode) {
      Alert.alert('Not signed in', 'Please complete onboarding first.');
      return;
    }
    setBuying(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/insurance/policies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: userId,
          provider: plan!.provider,
          planName: plan!.name,
          category: plan!.category,
          coverAmountPaise: plan!.coverAmount * 100,
          premiumPaise,
          pinCode,
        }),
      });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      useWalletStore.getState().spend(premiumPaise, `Insurance: ${plan!.name}`);
      Alert.alert('Plan purchased!', `${plan!.name} is now active.`, [
        { text: 'View Policy', onPress: () => router.replace(`/(insurance)/policy/${data.policy.id}`) },
      ]);
    } catch {
      Alert.alert('Error', 'Could not complete the purchase — please try again.');
    } finally {
      setBuying(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <VStack style={styles.headerTitle}>
          <Text variant="h3" style={{ fontWeight: '700' }}>{plan.name}</Text>
          <Text variant="caption" tone="secondary">{plan.provider}</Text>
        </VStack>
        <View style={{ width: 24 }} />
      </HStack>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.heroCard}>
          <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <VStack>
              <Text variant="caption" tone="secondary">Cover Amount</Text>
              <Text variant="h2" style={{ fontWeight: '700' }}>₹{(plan.coverAmount / 100000).toFixed(0)}L</Text>
            </VStack>
            <HStack gap={spacing.xs}>
              <Star size={16} color={colors.warning} fill={colors.warning} />
              <Text variant="body" style={{ fontWeight: '600' }}>{plan.rating}</Text>
              <Text variant="caption" tone="secondary">({plan.reviews})</Text>
            </HStack>
          </HStack>
          <View style={styles.divider} />
          <HStack style={{ justifyContent: 'space-between' }}>
            <Text variant="body" tone="secondary">Premium</Text>
            <Text variant="body" tone="brand" style={{ fontWeight: '700' }}>
              ₹{plan.premium}/{plan.premiumFrequency === 'monthly' ? 'mo' : 'yr'}
            </Text>
          </HStack>
        </Card>

        <VStack gap={spacing.md} style={styles.section}>
          <Text variant="bodyLg" style={{ fontWeight: '600' }}>What's covered</Text>
          <Card style={styles.featuresCard}>
            <VStack gap={spacing.sm}>
              {plan.features.map((feature, i) => (
                <HStack key={i} gap={spacing.sm} align="center">
                  <CheckCircle size={16} color={colors.success} />
                  <Text variant="body" style={{ flex: 1 }}>{feature}</Text>
                </HStack>
              ))}
            </VStack>
          </Card>
        </VStack>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={buying ? 'Processing…' : `Buy now — ₹${plan.premium}/${plan.premiumFrequency === 'monthly' ? 'mo' : 'yr'}`}
          onPress={handleBuy}
          disabled={buying}
          fullWidth
        />
      </View>
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
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  section: { marginTop: spacing.lg },
  featuresCard: { padding: spacing.md },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
