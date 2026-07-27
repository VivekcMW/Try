import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Shield,
  ChevronRight,
  Star,
  CheckCircle,
  HelpCircle,
  Phone,
  FileText,
  AlertCircle,
} from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import {
  INSURANCE_ICON_MAP,
  CATEGORIES,
  PLANS,
  AGENTS,
  type InsuranceCategory,
  type Plan,
  type Agent,
} from '@/data/insurance-catalog';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export type ApiPolicy = {
  id: string;
  provider: string;
  planName: string;
  category: string;
  categoryIcon: string;
  policyNumber: string;
  coverAmountPaise: number;
  premiumPaise: number;
  nextDueAt: string;
  status: 'active' | 'expired' | 'pending';
};

/* ════════════════════════════════════════════════════════════════════════ */

const STATUS_CONFIG = {
  active: { color: colors.success, bg: '#D1FAE5', label: 'Active' },
  expired: { color: colors.danger, bg: '#FEE2E2', label: 'Expired' },
  pending: { color: colors.warning, bg: '#FEF3C7', label: 'Pending' },
};

function formatDueDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function callPhone(phone: string) {
  Linking.openURL('tel:' + phone.replace(/\s/g, ''));
}

function CategoryCard({ category, onPress }: { category: InsuranceCategory; onPress: () => void }) {
  const Icon = INSURANCE_ICON_MAP[category.icon];

  return (
    <Pressable style={styles.categoryCard} onPress={onPress}>
      <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
        <Icon size={28} color={category.color} />
      </View>
      <Text variant="body" style={{ fontWeight: '600' }}>{category.name}</Text>
      <Text variant="caption" tone="secondary" numberOfLines={1}>{category.description}</Text>
      <Text variant="caption" tone="brand">From ₹{category.startingPrice}/mo</Text>
    </Pressable>
  );
}

function PlanCard({ plan, onPress }: { plan: Plan; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card style={StyleSheet.flatten([styles.planCard, plan.popular && styles.planCardPopular])}>
        {plan.popular && (
          <View style={styles.popularBadge}>
            <Text variant="caption" tone="inverse" style={{ fontWeight: '700' }}>Popular</Text>
          </View>
        )}

        <HStack style={styles.planHeader}>
          <VStack style={{ flex: 1 }}>
            <Text variant="caption" tone="secondary">{plan.provider}</Text>
            <Text variant="bodyLg" style={{ fontWeight: '600' }}>{plan.name}</Text>
          </VStack>
          <HStack gap={spacing.xs}>
            <Star size={14} color={colors.warning} fill={colors.warning} />
            <Text variant="caption" style={{ fontWeight: '500' }}>{plan.rating}</Text>
          </HStack>
        </HStack>

        <HStack style={styles.planStats}>
          <VStack style={{ flex: 1 }}>
            <Text variant="caption" tone="secondary">Cover</Text>
            <Text variant="body" style={{ fontWeight: '700' }}>₹{(plan.coverAmount / 100000).toFixed(0)}L</Text>
          </VStack>
          <VStack style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text variant="caption" tone="secondary">Premium</Text>
            <Text variant="body" tone="brand" style={{ fontWeight: '700' }}>
              ₹{plan.premium}/{plan.premiumFrequency === 'monthly' ? 'mo' : 'yr'}
            </Text>
          </VStack>
        </HStack>

        <HStack style={styles.planFeatures}>
          {plan.features.slice(0, 2).map((feature, i) => (
            <HStack key={i} gap={spacing.xs} style={{ flex: 1 }}>
              <CheckCircle size={12} color={colors.success} />
              <Text variant="caption" numberOfLines={1}>{feature}</Text>
            </HStack>
          ))}
        </HStack>

        <Button label="View Details" variant="secondary" size="sm" onPress={onPress} />
      </Card>
    </Pressable>
  );
}

function PolicyCard({ policy, onPress }: { policy: ApiPolicy; onPress: () => void }) {
  const Icon = INSURANCE_ICON_MAP[policy.categoryIcon as keyof typeof INSURANCE_ICON_MAP] ?? Shield;
  const status = STATUS_CONFIG[policy.status];

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.policyCard}>
        <HStack gap={spacing.md}>
          <View style={styles.policyIcon}>
            <Icon size={24} color={colors.brand[600]} />
          </View>
          <VStack style={{ flex: 1 }}>
            <HStack style={styles.policyHeader}>
              <Text variant="body" style={{ fontWeight: '600' }}>{policy.planName}</Text>
              <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                <Text variant="caption" style={{ color: status.color, fontWeight: '600' }}>{status.label}</Text>
              </View>
            </HStack>
            <Text variant="caption" tone="secondary">{policy.provider} • {policy.policyNumber}</Text>
            <HStack gap={spacing.lg} style={{ marginTop: spacing.sm }}>
              <VStack>
                <Text variant="caption" tone="secondary">Cover</Text>
                <Text variant="body" style={{ fontWeight: '500' }}>₹{(policy.coverAmountPaise / 100 / 100000).toFixed(0)}L</Text>
              </VStack>
              <VStack>
                <Text variant="caption" tone="secondary">Next Due</Text>
                <Text variant="body" style={{ fontWeight: '500' }}>{formatDueDate(policy.nextDueAt)}</Text>
              </VStack>
            </HStack>
          </VStack>
          <ChevronRight size={20} color={colors.textSecondary} />
        </HStack>
      </Card>
    </Pressable>
  );
}

export default function InsuranceIndexScreen() {
  const router = useRouter();
  const userId = useWalletStore((s) => s.userId);
  const balancePaise = useWalletStore((s) => s.balancePaise);
  const [activeTab, setActiveTab] = useState<'explore' | 'policies'>('explore');
  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState<ApiPolicy[]>([]);

  const categories = CATEGORIES;
  const plans = PLANS;
  const agents = AGENTS;

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/insurance/policies?ownerId=${userId}`);
      const data = await res.json();
      setPolicies(res.ok ? data.policies : []);
    } catch {
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  function handleCallAgent(agent: Agent) {
    callPhone(agent.phone);
  }

  function handleCallNow() {
    const primary = agents[0];
    if (!primary) {
      Alert.alert('No agent available', 'Please check back later.');
      return;
    }
    callPhone(primary.phone);
  }

  async function handleRenew(policy: ApiPolicy) {
    if (!userId) return;
    if (balancePaise < policy.premiumPaise) {
      Alert.alert('Insufficient balance', 'Please top up your Lokul Wallet and try again.');
      return;
    }
    try {
      const res = await fetch(`${BASE}/api/mobile/insurance/policies/${policy.id}/renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error('failed');
      useWalletStore.getState().spend(policy.premiumPaise, `Insurance renewal: ${policy.planName}`);
      await load();
      Alert.alert('Renewed!', `${policy.planName} has been renewed successfully.`);
    } catch {
      Alert.alert('Error', 'Could not process renewal — please try again.');
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <HStack style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <VStack style={styles.headerTitle}>
          <Text variant="h3" style={{ fontWeight: '700' }}>Insurance</Text>
          <Text variant="caption" tone="secondary">Protect what matters most</Text>
        </VStack>
        <Pressable onPress={() => router.push('/(insurance)/claims')}>
          <FileText size={20} color={colors.foreground} />
        </Pressable>
      </HStack>

      {/* Tabs */}
      <HStack style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === 'explore' && styles.tabActive]}
          onPress={() => setActiveTab('explore')}
        >
          <Text
            variant="body"
            style={{
              fontWeight: activeTab === 'explore' ? '600' : '400',
              color: activeTab === 'explore' ? colors.brand[600] : colors.textSecondary,
            }}
          >
            Explore Plans
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'policies' && styles.tabActive]}
          onPress={() => setActiveTab('policies')}
        >
          <Text
            variant="body"
            style={{
              fontWeight: activeTab === 'policies' ? '600' : '400',
              color: activeTab === 'policies' ? colors.brand[600] : colors.textSecondary,
            }}
          >
            My Policies
          </Text>
          {policies.length > 0 && (
            <View style={styles.tabBadge}>
              <Text variant="caption" tone="inverse" style={{ fontWeight: '700' }}>{policies.length}</Text>
            </View>
          )}
        </Pressable>
      </HStack>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeTab === 'explore' ? (
          <>
            {/* Categories Grid */}
            <VStack gap={spacing.sm} style={styles.section}>
              <Text variant="bodyLg" style={{ fontWeight: '600' }}>Insurance Categories</Text>
              <View style={styles.categoriesGrid}>
                {categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onPress={() => router.push(`/(insurance)/category/${category.id}`)}
                  />
                ))}
              </View>
            </VStack>

            {/* Featured Plans */}
            <VStack gap={spacing.md} style={styles.section}>
              <HStack style={styles.sectionHeader}>
                <Text variant="bodyLg" style={{ fontWeight: '600' }}>Featured Plans</Text>
                <Pressable onPress={() => router.push('/(insurance)/category/all')}>
                  <Text variant="caption" tone="brand">View All</Text>
                </Pressable>
              </HStack>

              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onPress={() => router.push(`/(insurance)/plan/${plan.id}`)}
                />
              ))}
            </VStack>

            {/* Community Agents */}
            <VStack gap={spacing.md} style={styles.section}>
              <HStack style={styles.sectionHeader}>
                <VStack>
                  <Text variant="bodyLg" style={{ fontWeight: '600' }}>Local Insurance Agents</Text>
                  <Text variant="caption" tone="secondary">Trusted agents from your community</Text>
                </VStack>
              </HStack>

              {agents.map((agent) => (
                <Card key={agent.id} style={styles.agentCard}>
                  <HStack gap={spacing.md}>
                    <View style={styles.agentAvatar}>
                      <Text variant="bodyLg" tone="brand" style={{ fontWeight: '700' }}>
                        {agent.name.split(' ').map((n) => n[0]).join('')}
                      </Text>
                    </View>
                    <VStack style={{ flex: 1 }}>
                      <Text variant="body" style={{ fontWeight: '600' }}>{agent.name}</Text>
                      <Text variant="caption" tone="secondary">
                        {agent.expertise.join(', ')} • {agent.experience} yrs exp
                      </Text>
                      <HStack gap={spacing.xs}>
                        <Star size={12} color={colors.warning} fill={colors.warning} />
                        <Text variant="caption" style={{ fontWeight: '500' }}>{agent.rating}</Text>
                      </HStack>
                    </VStack>
                    <Pressable style={styles.contactButton} onPress={() => handleCallAgent(agent)}>
                      <Phone size={18} color={colors.brand[600]} />
                    </Pressable>
                  </HStack>
                </Card>
              ))}
            </VStack>

            {/* Help Banner */}
            <Card style={styles.helpCard}>
              <HStack gap={spacing.md}>
                <View style={styles.helpIcon}>
                  <HelpCircle size={24} color={colors.brand[600]} />
                </View>
                <VStack style={{ flex: 1 }}>
                  <Text variant="body" style={{ fontWeight: '600' }}>Need Help Choosing?</Text>
                  <Text variant="caption" tone="secondary">
                    Talk to our experts for personalized recommendations
                  </Text>
                </VStack>
                <Button label="Call Now" size="sm" onPress={handleCallNow} />
              </HStack>
            </Card>
          </>
        ) : (
          <VStack gap={spacing.md} style={styles.section}>
            {policies.length > 0 ? (
              <>
                <Text variant="bodyLg" style={{ fontWeight: '600' }}>Your Policies</Text>
                {policies.map((policy) => (
                  <PolicyCard
                    key={policy.id}
                    policy={policy}
                    onPress={() => router.push(`/(insurance)/policy/${policy.id}`)}
                  />
                ))}

                {/* Renewal Reminder */}
                <Card style={styles.reminderCard}>
                  <HStack gap={spacing.md}>
                    <AlertCircle size={24} color={colors.warning} />
                    <VStack style={{ flex: 1 }}>
                      <Text variant="body" style={{ fontWeight: '500' }}>Renewal Due Soon</Text>
                      <Text variant="caption" tone="secondary">
                        Your {policies[0].planName} is due for renewal on {formatDueDate(policies[0].nextDueAt)}
                      </Text>
                    </VStack>
                  </HStack>
                  <View style={{ marginTop: spacing.md }}>
                    <Button
                      label="Renew Now"
                      variant="secondary"
                      size="sm"
                      onPress={() => handleRenew(policies[0])}
                    />
                  </View>
                </Card>
              </>
            ) : (
              <Card style={styles.emptyCard}>
                <Shield size={48} color={colors.textSecondary} />
                <Text variant="bodyLg" style={[{ fontWeight: '500' }, styles.emptyText]}>
                  No policies yet
                </Text>
                <Text variant="body" tone="secondary" style={styles.emptySubtext}>
                  Protect yourself and your family with the right insurance
                </Text>
                <View style={styles.emptyButton}>
                  <Button label="Explore Plans" onPress={() => setActiveTab('explore')} fullWidth />
                </View>
              </Card>
            )}
          </VStack>
        )}

        <View style={styles.bottomPadding} />
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
  tabs: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.brand[600],
  },
  tabBadge: {
    backgroundColor: colors.brand[600],
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  scroll: { flex: 1 },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryCard: {
    width: '31%',
    padding: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  planCard: {
    padding: spacing.md,
    position: 'relative',
  },
  planCardPopular: {
    borderColor: colors.brand[600],
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -1,
    right: spacing.md,
    backgroundColor: colors.brand[600],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderBottomLeftRadius: radius.sm,
    borderBottomRightRadius: radius.sm,
  },
  planHeader: {
    marginBottom: spacing.sm,
  },
  planStats: {
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  planFeatures: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  policyCard: {
    padding: spacing.md,
  },
  policyIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  policyHeader: {
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  agentCard: {
    padding: spacing.md,
  },
  agentAvatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.brand[50],
  },
  helpIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderCard: {
    padding: spacing.md,
    backgroundColor: '#FEF3C7',
    borderColor: colors.warning,
    borderWidth: 1,
  },
  emptyCard: {
    padding: spacing[6],
    alignItems: 'center',
  },
  emptyText: { marginTop: spacing.md },
  emptySubtext: { textAlign: 'center', marginTop: spacing.xs },
  emptyButton: { marginTop: spacing.md, width: '100%' },
  bottomPadding: { height: 100 },
});
