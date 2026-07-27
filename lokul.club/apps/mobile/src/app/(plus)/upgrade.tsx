/**
 * Lokul Plus paywall screen
 * Shown when a user tries to access a Plus-gated feature.
 * Route: /(plus)/upgrade  — passes `feature` param to personalise messaging.
 */
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  Bot,
  Check,
  Globe,
  Megaphone,
  Shield,
  Sparkles,
  Star,
  X,
  Zap,
} from 'lucide-react-native';
import { Badge, HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { useSubscriptionStore, type SubscriptionTier } from '@/store/subscriptionStore';
import { useOnboardingStore } from '@/store/onboardingStore';
// RazorpayCheckout is lazy-required at call-time so it doesn't crash in Expo Go
// (native module only available in a development build)

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

// ── Plan definitions ──────────────────────────────────────────────────────────
const PLANS: {
  tier: SubscriptionTier;
  name: string;
  badge: string | null;
  monthlyPaise: number;
  yearlyPaise: number;
  color: string;
  features: string[];
}[] = [
  {
    tier: 'free',
    name: 'Free',
    badge: null,
    monthlyPaise: 0,
    yearlyPaise: 0,
    color: colors.gray[400],
    features: [
      'Community feed & posts',
      'Basic safety alerts',
      'Neighbour classifieds',
      '5 service listings / month',
    ],
  },
  {
    tier: 'plus',
    name: 'Lokul Plus',
    badge: 'POPULAR',
    monthlyPaise: 4900,   // ₹49 / mo
    yearlyPaise: 39900,   // ₹399 / yr
    color: colors.brand[600],
    features: [
      'AI assistant in all 22 languages',
      'Unlimited AI digest summaries',
      'Ad-free experience',
      'Priority feed placement',
      'Guardian live map',
      'Custom discovery radius',
      'Extended story duration (48 h)',
      'Group buy creation',
    ],
  },
  {
    tier: 'business',
    name: 'Lokul Business',
    badge: 'FOR MERCHANTS',
    monthlyPaise: 14900,  // ₹149 / mo
    yearlyPaise: 119900,  // ₹1,199 / yr
    color: colors.semantic?.warning ?? '#D97706',
    features: [
      'Everything in Plus',
      'Merchant analytics dashboard',
      'Sponsored post placement',
      'Booking management suite',
      'Customer insights & funnel',
      'Bulk SMS broadcast (500 / mo)',
      'Invoice generator',
      'Priority support',
    ],
  },
];

// Feature-specific upsell copy
const FEATURE_COPY: Record<string, { title: string; subtitle: string }> = {
  ai_assistant:         { title: 'AI Assistant needs Lokul Plus', subtitle: 'Get voice-first AI help in your language, powered by Bharat LLM.' },
  business_analytics:   { title: 'Analytics is a Business feature', subtitle: 'Unlock customer insights, booking funnels and revenue reports.' },
  guardian_live_map:    { title: 'Live map needs Lokul Plus', subtitle: 'Share a real-time safety journey with your guardian.' },
  ad_free:              { title: 'Go ad-free with Lokul Plus', subtitle: 'Remove all ads and enjoy an uninterrupted feed.' },
  default:              { title: 'Unlock Lokul Plus', subtitle: 'Upgrade to access premium neighbourhood features.' },
};

export default function UpgradeScreen() {
  const router  = useRouter();
  const { feature } = useLocalSearchParams<{ feature?: string }>();
  const [yearly,   setYearly]   = useState(false);
  const [loading,  setLoading]  = useState<SubscriptionTier | null>(null);
  const activate = useSubscriptionStore((s) => s.activate);
  const currentTier = useSubscriptionStore((s) => s.subscription.tier);
  const userId = useOnboardingStore((s) => s.phone);

  const copy = FEATURE_COPY[feature ?? ''] ?? FEATURE_COPY.default;

  const handleSubscribe = async (tier: SubscriptionTier) => {
    if (tier === 'free') { router.back(); return; }
    if (!userId) return;
    const plan = PLANS.find((p) => p.tier === tier)!;
    const pricePaise = yearly ? plan.yearlyPaise : plan.monthlyPaise;
    const months = yearly ? 12 : 1;

    setLoading(tier);
    try {
      // Step 1 — Create Razorpay order
      const res = await fetch(`${BASE}/api/mobile/wallet/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, tier, months }),
      });
      const data = await res.json() as {
        ok: boolean; orderId?: string; keyId?: string; amountPaise?: number; isStub?: boolean;
      };
      if (!res.ok) throw new Error('Subscription order failed');

      // Step 2 — Open Razorpay checkout (stub-safe)
      if (data.isStub || !data.orderId) {
        activate(tier, months, `txn_dev_${Date.now()}`, pricePaise);
        Alert.alert('Welcome to ' + plan.name + '!', 'Your subscription is now active.', [
          { text: 'Start exploring', onPress: () => router.back() },
        ]);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const RazorpayCheckout = (require('react-native-razorpay') as { default: { open: (opts: Record<string, unknown>) => Promise<unknown> } }).default;
      const paymentData = await RazorpayCheckout.open({
        key: data.keyId,
        amount: data.amountPaise,
        currency: 'INR',
        order_id: data.orderId,
        name: 'Lokul',
        description: `${plan.name} subscription`,
        theme: { color: '#208AEF' },
      }) as { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };

      // Step 3 — Verify payment server-side
      const verifyRes = await fetch(`${BASE}/api/mobile/wallet/payment/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpayOrderId: paymentData.razorpay_order_id,
          razorpayPaymentId: paymentData.razorpay_payment_id,
          razorpaySignature: paymentData.razorpay_signature,
        }),
      });
      if (!verifyRes.ok) throw new Error('Payment verification failed');

      // Step 4 — Activate subscription
      activate(tier, months, paymentData.razorpay_payment_id, pricePaise);
      Alert.alert('Welcome to ' + plan.name + '!', 'Your subscription is now active.', [
        { text: 'Start exploring', onPress: () => router.back() },
      ]);
    } catch (err: unknown) {
      const isUserCancelled = typeof err === 'object' && err !== null && (err as { code?: string }).code === 'PAYMENT_CANCELLED';
      if (!isUserCancelled) {
        Alert.alert('Payment failed', 'Please try again or contact support.');
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <HStack gap={3} align="center" style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back">
          <ArrowLeft size={22} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading, fontWeight: '700' }}>
          Upgrade
        </Text>
      </HStack>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Sparkles size={32} color={colors.brand[600]} />
          </View>
          <Text variant="h2" style={{ textAlign: 'center', fontWeight: '800', color: colors.surface.heading }}>
            {copy.title}
          </Text>
          <Text variant="body" tone="secondary" style={{ textAlign: 'center', marginTop: spacing[2] }}>
            {copy.subtitle}
          </Text>
        </View>

        {/* Billing toggle */}
        <View style={styles.toggleWrap}>
          <Pressable
            onPress={() => setYearly(false)}
            style={[styles.toggleBtn, !yearly && styles.toggleBtnActive]}
          >
            <Text variant="caption" style={{ fontWeight: '700', color: !yearly ? '#fff' : colors.surface.textSecondary }}>
              Monthly
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setYearly(true)}
            style={[styles.toggleBtn, yearly && styles.toggleBtnActive]}
          >
            <Text variant="caption" style={{ fontWeight: '700', color: yearly ? '#fff' : colors.surface.textSecondary }}>
              Yearly
            </Text>
            <View style={styles.savePill}>
              <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>SAVE 30%</Text>
            </View>
          </Pressable>
        </View>

        {/* Plan cards */}
        {PLANS.filter((p) => p.tier !== 'free').map((plan) => {
          const price = yearly ? plan.yearlyPaise : plan.monthlyPaise;
          const perMonth = yearly ? Math.round(plan.yearlyPaise / 12) : plan.monthlyPaise;
          const isCurrent = currentTier === plan.tier;

          return (
            <View
              key={plan.tier}
              style={[
                styles.planCard,
                plan.tier === 'plus' && styles.planCardHighlight,
              ]}
            >
              {/* Card header */}
              <HStack gap={2} align="center" style={{ marginBottom: spacing[3] }}>
                <View style={[styles.planDot, { backgroundColor: plan.color }]} />
                <Text variant="body" style={{ flex: 1, fontWeight: '800', color: colors.surface.heading }}>
                  {plan.name}
                </Text>
                {plan.badge && (
                  <View style={[styles.badge, { backgroundColor: plan.color }]}>
                    <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>{plan.badge}</Text>
                  </View>
                )}
              </HStack>

              {/* Price */}
              <HStack gap={1} align="end" style={{ marginBottom: spacing[4] }}>
                <Text style={{ fontSize: 32, fontWeight: '800', color: colors.surface.heading, lineHeight: 36 }}>
                  ₹{Math.round(perMonth / 100)}
                </Text>
                <Text variant="caption" tone="secondary" style={{ marginBottom: 4 }}>
                  / mo{yearly ? ' (billed yearly)' : ''}
                </Text>
              </HStack>

              {/* Feature list */}
              <VStack gap={2.5} style={{ marginBottom: spacing[4] }}>
                {plan.features.map((f) => (
                  <HStack key={f} gap={2} align="center">
                    <View style={[styles.checkCircle, { backgroundColor: `${plan.color}20` }]}>
                      <Check size={11} color={plan.color} strokeWidth={3} />
                    </View>
                    <Text variant="caption" style={{ flex: 1, color: colors.surface.heading }}>
                      {f}
                    </Text>
                  </HStack>
                ))}
              </VStack>

              {/* CTA */}
              <Pressable
                onPress={() => handleSubscribe(plan.tier)}
                disabled={!!loading || isCurrent}
                style={({ pressed }) => [
                  styles.cta,
                  { backgroundColor: plan.color },
                  (pressed || loading === plan.tier) && { opacity: 0.8 },
                  isCurrent && { backgroundColor: colors.gray[200] },
                ]}
                accessibilityRole="button"
              >
                <Text style={{ color: isCurrent ? colors.gray[500] : '#fff', fontWeight: '800', fontSize: 15 }}>
                  {isCurrent ? 'Current plan' : loading === plan.tier ? 'Processing…' : `Get ${plan.name}`}
                </Text>
              </Pressable>
            </View>
          );
        })}

        {/* Free plan summary */}
        <View style={styles.freeCard}>
          <Text variant="caption" style={{ fontWeight: '700', color: colors.gray[500], marginBottom: spacing[2] }}>
            FREE PLAN INCLUDES
          </Text>
          <HStack gap={2} wrap>
            {PLANS[0].features.map((f) => (
              <HStack key={f} gap={1} align="center" style={styles.freeItem}>
                <Check size={10} color={colors.gray[400]} strokeWidth={3} />
                <Text variant="caption" tone="secondary">{f}</Text>
              </HStack>
            ))}
          </HStack>
        </View>

        {/* Icon grid of key Plus features */}
        <View style={styles.featGrid}>
          {[
            { Icon: Bot,        label: 'AI in 22 languages' },
            { Icon: Shield,     label: 'Guardian live map' },
            { Icon: Globe,      label: 'Custom radius' },
            { Icon: X,          label: 'Ad-free feed' },
            { Icon: BarChart3,  label: 'Merchant analytics' },
            { Icon: Megaphone,  label: 'Sponsored posts' },
            { Icon: Star,       label: 'Priority placement' },
            { Icon: Zap,        label: 'Bulk broadcast' },
          ].map(({ Icon, label }) => (
            <View key={label} style={styles.featItem}>
              <View style={styles.featIcon}>
                <Icon size={20} color={colors.brand[600]} />
              </View>
              <Text style={{ fontSize: 10, textAlign: 'center', color: colors.surface.heading, fontWeight: '600', marginTop: spacing[1] }}>
                {label}
              </Text>
            </View>
          ))}
        </View>

        <Text variant="caption" tone="secondary" style={{ textAlign: 'center', paddingBottom: spacing[8] }}>
          Cancel any time · 7-day money-back guarantee · UPI / card accepted
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.surface.background },
  header: { paddingHorizontal: spacing[4], paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.surface.border },
  scroll: { padding: spacing[4], gap: spacing[4] },
  hero:   { alignItems: 'center', paddingVertical: spacing[4] },
  heroIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: `${colors.brand[600]}15`,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing[3],
  },
  toggleWrap: {
    flexDirection: 'row',
    backgroundColor: colors.surface.surfaceMuted,
    borderRadius: radius.full,
    padding: 3,
    alignSelf: 'center',
    gap: 2,
  },
  toggleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[1],
    paddingHorizontal: spacing[4], paddingVertical: spacing[2],
    borderRadius: radius.full,
  },
  toggleBtnActive: { backgroundColor: colors.brand[600] },
  savePill: {
    backgroundColor: colors.semantic?.success ?? '#059669',
    paddingHorizontal: 4, paddingVertical: 1,
    borderRadius: radius.sm,
  },
  planCard: {
    backgroundColor: colors.surface.surfaceMuted,
    borderRadius: radius.xl,
    padding: spacing[5],
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  planCardHighlight: {
    backgroundColor: colors.surface.background,
    borderColor: colors.brand[400],
    borderWidth: 2,
    shadowColor: colors.brand[600],
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  planDot: { width: 10, height: 10, borderRadius: 5 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm },
  checkCircle: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  cta: {
    borderRadius: radius.lg,
    paddingVertical: spacing[3] + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  freeCard: {
    backgroundColor: colors.surface.surfaceMuted,
    borderRadius: radius.lg,
    padding: spacing[4],
  },
  freeItem: { marginBottom: spacing[1] },
  featGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    justifyContent: 'center',
    paddingVertical: spacing[2],
  },
  featItem: { width: 80, alignItems: 'center' },
  featIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: `${colors.brand[600]}12`,
    alignItems: 'center', justifyContent: 'center',
  },
});
