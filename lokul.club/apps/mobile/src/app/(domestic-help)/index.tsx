import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Star,
  ChevronRight,
  BadgeCheck,
  AlertTriangle,
  User,
} from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack, Avatar } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export type Helper = {
  id: string;
  name: string;
  phone: string | null;
  photo: string | null;
  roleId: string | null;
  role: string;
  verificationStatus: VerificationStatus;
  rating: number;
  reviews: number;
  workingHours: string;
  monthlyPayPaise: number;
};

/* ════════════════════════════════════════════════════════════════════════
   ROLE META
   ═══════════════════════════════════════════════════════════════════════ */

const HELPER_ROLES = [
  { id: 'maid', label: 'Maid / Domestic Help', icon: '🧹' },
  { id: 'cook', label: 'Cook', icon: '👨‍🍳' },
  { id: 'driver', label: 'Driver', icon: '🚗' },
  { id: 'nanny', label: 'Nanny / Babysitter', icon: '👶' },
  { id: 'caretaker', label: 'Elderly Caretaker', icon: '👴' },
  { id: 'gardener', label: 'Gardener', icon: '🌱' },
  { id: 'security', label: 'Security Guard', icon: '🛡️' },
  { id: 'watchman', label: 'Watchman', icon: '👁️' },
];

/* ════════════════════════════════════════════════════════════════════════ */

const STATUS_CONFIG: Record<VerificationStatus, { color: string; bg: string; icon: typeof Shield; label: string }> = {
  unverified: { color: colors.textSecondary, bg: colors.surfaceMuted, icon: Shield, label: 'Not Verified' },
  pending: { color: colors.warning, bg: '#FEF3C7', icon: Clock, label: 'Verification Pending' },
  verified: { color: colors.success, bg: '#D1FAE5', icon: ShieldCheck, label: 'Verified' },
  rejected: { color: colors.danger, bg: '#FEE2E2', icon: ShieldAlert, label: 'Verification Failed' },
};

function HelperCard({ helper, onPress }: { helper: Helper; onPress: () => void }) {
  const status = STATUS_CONFIG[helper.verificationStatus];
  const StatusIcon = status.icon;

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.helperCard}>
        <HStack style={styles.helperHeader}>
          <Avatar
            size="lg"
            name={helper.name}
            source={helper.photo ? { uri: helper.photo } : undefined}
          />
          <VStack style={styles.helperInfo}>
            <HStack style={styles.nameRow}>
              <Text variant="bodyLg" style={{ fontWeight: '600' }}>{helper.name}</Text>
              {helper.verificationStatus === 'verified' && (
                <BadgeCheck size={18} color={colors.success} />
              )}
            </HStack>
            <Text variant="body" tone="secondary">{helper.role}</Text>
            <HStack gap={spacing.sm} style={styles.ratingRow}>
              {helper.reviews > 0 ? (
                <>
                  <Star size={14} color={colors.warning} fill={colors.warning} />
                  <Text variant="body" style={{ fontWeight: '500' }}>{helper.rating}</Text>
                  <Text variant="body" tone="secondary">({helper.reviews} reviews)</Text>
                </>
              ) : (
                <Text variant="body" tone="secondary">No reviews yet</Text>
              )}
            </HStack>
          </VStack>
          <ChevronRight size={20} color={colors.textSecondary} />
        </HStack>

        <View style={styles.divider} />

        <HStack style={styles.helperMeta}>
          <VStack style={styles.metaItem}>
            <Text variant="caption" tone="secondary">Working Hours</Text>
            <Text variant="body" style={{ fontWeight: '500' }}>{helper.workingHours}</Text>
          </VStack>
          <VStack style={styles.metaItem}>
            <Text variant="caption" tone="secondary">Monthly Pay</Text>
            <Text variant="body" style={{ fontWeight: '500' }}>₹{Math.round(helper.monthlyPayPaise / 100).toLocaleString()}</Text>
          </VStack>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <StatusIcon size={14} color={status.color} />
            <Text variant="caption" style={{ color: status.color, marginLeft: 4 }}>{status.label}</Text>
          </View>
        </HStack>
      </Card>
    </Pressable>
  );
}

export default function DomesticHelpIndexScreen() {
  const router = useRouter();
  const pinCode = useOnboardingStore((s) => s.pin);
  const userId = useWalletStore((s) => s.userId);
  const [filter, setFilter] = useState<VerificationStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [helpersRes, countsRes] = await Promise.all([
        fetch(`${BASE}/api/mobile/domestic-help/helpers?ownerId=${userId}`),
        pinCode
          ? fetch(`${BASE}/api/mobile/domestic-help/helpers?pinCode=${pinCode}&countsByRole=true`)
          : Promise.resolve(null),
      ]);
      const helpersData = await helpersRes.json();
      setHelpers(helpersRes.ok ? helpersData.helpers : []);
      if (countsRes) {
        const countsData = await countsRes.json();
        setRoleCounts(countsRes.ok ? countsData.counts : {});
      }
    } catch {
      setHelpers([]);
    } finally {
      setLoading(false);
    }
  }, [userId, pinCode]);

  useEffect(() => { load(); }, [load]);

  const filteredHelpers = helpers.filter((h) => {
    const matchesFilter = filter === 'all' || h.verificationStatus === filter;
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: helpers.length,
    verified: helpers.filter(h => h.verificationStatus === 'verified').length,
    pending: helpers.filter(h => h.verificationStatus === 'pending').length,
    unverified: helpers.filter(h => h.verificationStatus === 'unverified').length,
  };

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
          <Text variant="h3" style={{ fontWeight: '700' }}>Domestic Help</Text>
          <Text variant="caption" tone="secondary">Manage & verify your helpers</Text>
        </VStack>
        <Pressable
          onPress={() => router.push('/(domestic-help)/add')}
          style={styles.addButton}
        >
          <Plus size={20} color="#ffffff" />
        </Pressable>
      </HStack>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsRow}
        >
          <Pressable onPress={() => setFilter('all')}>
            <Card style={[styles.statCard, filter === 'all' && styles.statCardActive]}>
              <Text variant="h2" style={{ fontWeight: '700', color: colors.brand[600] }}>{stats.total}</Text>
              <Text variant="caption" tone="secondary">Total</Text>
            </Card>
          </Pressable>
          <Pressable onPress={() => setFilter('verified')}>
            <Card style={[styles.statCard, filter === 'verified' && styles.statCardActive]}>
              <Text variant="h2" style={{ fontWeight: '700', color: colors.success }}>{stats.verified}</Text>
              <Text variant="caption" tone="secondary">Verified</Text>
            </Card>
          </Pressable>
          <Pressable onPress={() => setFilter('pending')}>
            <Card style={[styles.statCard, filter === 'pending' && styles.statCardActive]}>
              <Text variant="h2" style={{ fontWeight: '700', color: colors.warning }}>{stats.pending}</Text>
              <Text variant="caption" tone="secondary">Pending</Text>
            </Card>
          </Pressable>
          <Pressable onPress={() => setFilter('unverified')}>
            <Card style={[styles.statCard, filter === 'unverified' && styles.statCardActive]}>
              <Text variant="h2" style={{ fontWeight: '700', color: colors.textSecondary }}>{stats.unverified}</Text>
              <Text variant="caption" tone="secondary">Unverified</Text>
            </Card>
          </Pressable>
        </ScrollView>

        {/* Verification CTA */}
        {stats.unverified > 0 && (
          <Card style={styles.ctaCard}>
            <HStack style={styles.ctaContent}>
              <View style={styles.ctaIcon}>
                <AlertTriangle size={24} color={colors.warning} />
              </View>
              <VStack style={styles.ctaText}>
                <Text variant="bodyLg" style={{ fontWeight: '600' }}>
                  {stats.unverified} helper{stats.unverified > 1 ? 's' : ''} need verification
                </Text>
                <Text variant="body" tone="secondary">
                  Background checks ensure your family's safety
                </Text>
              </VStack>
            </HStack>
            <Button
              label="Verify Now • ₹199/person"
              onPress={() => router.push('/(domestic-help)/verify')}
              style={styles.ctaButton}
            />
          </Card>
        )}

        {/* Helper List */}
        <VStack gap={spacing.md} style={styles.listSection}>
          <Text variant="bodyLg" style={{ fontWeight: '600' }}>
            {filter === 'all' ? 'All Helpers' : `${STATUS_CONFIG[filter as VerificationStatus].label} Helpers`}
          </Text>

          {filteredHelpers.length > 0 ? (
            filteredHelpers.map((helper) => (
              <HelperCard
                key={helper.id}
                helper={helper}
                onPress={() => router.push(`/(domestic-help)/profile/${helper.id}`)}
              />
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <User size={48} color={colors.textSecondary} />
              <Text variant="bodyLg" style={[styles.emptyText, { fontWeight: '500' }]}>
                No helpers found
              </Text>
              <Text variant="body" tone="secondary" style={styles.emptySubtext}>
                {filter === 'all'
                  ? 'Add your first domestic helper'
                  : 'No helpers in this category'
                }
              </Text>
              {filter === 'all' && (
                <Button
                  label="Add Helper"
                  onPress={() => router.push('/(domestic-help)/add')}
                  style={styles.emptyButton}
                />
              )}
            </Card>
          )}
        </VStack>

        {/* Community Pool */}
        <VStack gap={spacing.md} style={styles.poolSection}>
          <HStack style={styles.sectionHeader}>
            <VStack>
              <Text variant="bodyLg" style={{ fontWeight: '600' }}>Community Helper Pool</Text>
              <Text variant="caption" tone="secondary">Verified helpers recommended by neighbors</Text>
            </VStack>
            <Pressable onPress={() => router.push('/(domestic-help)/pool')}>
              <Text variant="body" style={{ fontWeight: '600', color: colors.brand[600] }}>
                View All
              </Text>
            </Pressable>
          </HStack>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <HStack gap={spacing.md}>
              {HELPER_ROLES.slice(0, 4).map((role) => (
                <Pressable
                  key={role.id}
                  onPress={() => router.push(`/(domestic-help)/pool?role=${role.id}`)}
                >
                  <Card style={styles.roleCard}>
                    <Text style={styles.roleEmoji}>{role.icon}</Text>
                    <Text variant="body" style={{ fontWeight: '500' }} numberOfLines={1}>
                      {role.label.split('/')[0].trim()}
                    </Text>
                    <Text variant="caption" tone="secondary">{roleCounts[role.id] ?? 0} available</Text>
                  </Card>
                </Pressable>
              ))}
            </HStack>
          </ScrollView>
        </VStack>

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
  addButton: {
    backgroundColor: colors.brand[600],
    padding: spacing.sm,
    borderRadius: radius.full,
  },
  scroll: { flex: 1 },
  statsRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    padding: spacing.md,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statCardActive: {
    borderColor: colors.brand[600],
    backgroundColor: colors.brand[50],
  },
  ctaCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    backgroundColor: '#FEF9E7',
    borderColor: colors.warning,
    borderWidth: 1,
  },
  ctaContent: { marginBottom: spacing.md, gap: spacing.md },
  ctaIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { flex: 1 },
  ctaButton: { backgroundColor: colors.warning },
  listSection: { paddingHorizontal: spacing.lg },
  helperCard: { padding: spacing.md },
  helperHeader: { alignItems: 'flex-start', gap: spacing.md },
  helperInfo: { flex: 1 },
  nameRow: { alignItems: 'center', gap: spacing.xs },
  ratingRow: { alignItems: 'center', marginTop: spacing.xs },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  helperMeta: { justifyContent: 'space-between', alignItems: 'flex-end' },
  metaItem: { flex: 1 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  emptyCard: {
    padding: spacing[6],
    alignItems: 'center',
  },
  emptyText: { marginTop: spacing.md },
  emptySubtext: { textAlign: 'center', marginTop: spacing.xs },
  emptyButton: { marginTop: spacing.md },
  poolSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing[6],
  },
  sectionHeader: { justifyContent: 'space-between', alignItems: 'center' },
  roleCard: {
    padding: spacing.md,
    width: 100,
    alignItems: 'center',
  },
  roleEmoji: { fontSize: 32, marginBottom: spacing.xs },
  bottomPadding: { height: 100 },
});
