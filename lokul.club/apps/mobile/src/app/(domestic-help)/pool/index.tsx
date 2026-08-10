import { useState, useMemo, useCallback, useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Search,
  Filter,
  Star,
  ShieldCheck,
  MapPin,
  Clock,
  Users,
  X,
} from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack, Avatar } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { useOnboardingStore } from '@/store/onboardingStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type Helper = {
  id: string;
  name: string;
  photo: string | null;
  roleId: string | null;
  role: string;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  rating: number;
  reviews: number;
  recommendedBy: number;
  availability: string | null;
  areas: string[];
  workingHours: string;
  monthlyRateMinPaise: number | null;
  monthlyRateMaxPaise: number | null;
  monthlyPayPaise: number;
  owner: { id: string; name: string };
};

const HELPER_ROLES = [
  { id: 'all', label: 'All Roles', icon: '👥' },
  { id: 'maid', label: 'Maid', icon: '🧹' },
  { id: 'cook', label: 'Cook', icon: '👨‍🍳' },
  { id: 'driver', label: 'Driver', icon: '🚗' },
  { id: 'nanny', label: 'Nanny', icon: '👶' },
  { id: 'caretaker', label: 'Caretaker', icon: '👴' },
  { id: 'gardener', label: 'Gardener', icon: '🌱' },
  { id: 'security', label: 'Security', icon: '🛡️' },
];

function HelperPoolCard({ helper, onPress }: { helper: Helper; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.helperCard}>
        <HStack style={styles.helperHeader}>
          <Avatar size="lg" name={helper.name} source={helper.photo ? { uri: helper.photo } : undefined} />
          <VStack style={styles.helperInfo}>
            <HStack style={styles.nameRow}>
              <Text variant="bodyLg" style={{ fontWeight: '600' }}>{helper.name}</Text>
              {helper.verificationStatus === 'verified' && <ShieldCheck size={16} color={colors.success} />}
            </HStack>
            <Text variant="body" tone="secondary">{helper.role}</Text>
            <HStack gap={spacing.sm} style={styles.statsRow}>
              <HStack gap={spacing.xs}>
                <Star size={14} color={colors.warning} fill={colors.warning} />
                <Text variant="caption" style={{ fontWeight: '600' }}>{helper.rating}</Text>
              </HStack>
              <Text variant="caption" tone="secondary">•</Text>
              <Text variant="caption" tone="secondary">{helper.reviews} reviews</Text>
              <Text variant="caption" tone="secondary">•</Text>
              <HStack gap={spacing.xs}>
                <Users size={12} color={colors.brand[600]} />
                <Text variant="caption" style={{ color: colors.brand[600] }}>{helper.recommendedBy ?? 0} recommend</Text>
              </HStack>
            </HStack>
          </VStack>
        </HStack>

        <View style={styles.divider} />

        <VStack gap={spacing.sm}>
          <HStack gap={spacing.sm}>
            <Clock size={14} color={colors.textSecondary} />
            <Text variant="caption" tone="secondary">{helper.availability ?? helper.workingHours}</Text>
          </HStack>
          <HStack gap={spacing.sm}>
            <MapPin size={14} color={colors.textSecondary} />
            <Text variant="caption" tone="secondary">{(helper.areas ?? []).join(', ') || '—'}</Text>
          </HStack>
        </VStack>

        <View style={styles.divider} />

        <HStack style={styles.cardFooter}>
          <VStack>
            <Text variant="caption" tone="secondary">Monthly Rate</Text>
            <Text variant="body" style={{ fontWeight: '600', color: colors.brand[600] }}>
              {helper.monthlyRateMinPaise != null && helper.monthlyRateMaxPaise != null
                ? `₹${Math.round(helper.monthlyRateMinPaise / 100).toLocaleString()} - ₹${Math.round(helper.monthlyRateMaxPaise / 100).toLocaleString()}`
                : `₹${Math.round(helper.monthlyPayPaise / 100).toLocaleString()}`}
            </Text>
          </VStack>
          <Button
            label="Contact"
            size="sm"
            onPress={onPress}
          />
        </HStack>
      </Card>
    </Pressable>
  );
}

export default function HelperPoolScreen() {
  const router = useRouter();
  const { role: initialRole } = useLocalSearchParams<{ role?: string }>();
  const pinCode = useOnboardingStore((s) => s.pin);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState(initialRole || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [poolHelpers, setPoolHelpers] = useState<Helper[]>([]);

  const load = useCallback(async () => {
    if (!pinCode) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/domestic-help/helpers?pinCode=${pinCode}&pool=true`);
      const data = await res.json();
      setPoolHelpers(res.ok ? data.helpers : []);
    } catch {
      setPoolHelpers([]);
    } finally {
      setLoading(false);
    }
  }, [pinCode]);

  useEffect(() => { load(); }, [load]);

  const filteredHelpers = useMemo(() => {
    return poolHelpers.filter((helper) => {
      const matchesRole = selectedRole === 'all' || helper.roleId === selectedRole;
      const matchesSearch = helper.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        helper.role.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [poolHelpers, selectedRole, searchQuery]);

  const roleCount = useMemo(() => {
    const counts: Record<string, number> = { all: poolHelpers.length };
    poolHelpers.forEach(h => {
      if (h.roleId) counts[h.roleId] = (counts[h.roleId] || 0) + 1;
    });
    return counts;
  }, [poolHelpers]);

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
          <Text variant="h3" style={{ fontWeight: '700' }}>Community Helper Pool</Text>
          <Text variant="caption" tone="secondary">
            {filteredHelpers.length} verified helpers available
          </Text>
        </VStack>
        <Pressable onPress={() => setShowFilters(!showFilters)}>
          <Filter size={20} color={showFilters ? colors.brand[600] : colors.foreground} />
        </Pressable>
      </HStack>

      {/* Search */}
      <View style={styles.searchContainer}>
        <HStack style={styles.searchBar}>
          <Search size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search helpers..."
            placeholderTextColor={colors.textSecondary}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <X size={18} color={colors.textSecondary} />
            </Pressable>
          )}
        </HStack>
      </View>

      {/* Role Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterPillsScroll}
        contentContainerStyle={styles.filterPills}
      >
        {HELPER_ROLES.map((role) => (
          <Pressable
            key={role.id}
            onPress={() => setSelectedRole(role.id)}
            style={[
              styles.filterPill,
              selectedRole === role.id && styles.filterPillActive,
            ]}
          >
            <Text style={styles.filterEmoji}>{role.icon}</Text>
            <Text
              variant="body"
              style={{ fontWeight: selectedRole === role.id ? '600' : '400', color: selectedRole === role.id ? '#ffffff' : colors.foreground }}
            >
              {role.label}
            </Text>
            {roleCount[role.id] ? (
              <View style={[
                styles.countBadge,
                selectedRole === role.id && styles.countBadgeActive,
              ]}>
                <Text
                  variant="caption"
                  style={{ fontWeight: '600', color: selectedRole === role.id ? colors.brand[600] : colors.textSecondary }}
                >
                  {roleCount[role.id]}
                </Text>
              </View>
            ) : null}
          </Pressable>
        ))}
      </ScrollView>

      {/* Helper List */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <Card style={styles.infoBanner}>
          <HStack gap={spacing.md}>
            <ShieldCheck size={24} color={colors.success} />
            <VStack style={{ flex: 1 }}>
              <Text variant="body" style={{ fontWeight: '600' }}>All helpers are verified</Text>
              <Text variant="caption" tone="secondary">
                Background checks completed by your neighbors
              </Text>
            </VStack>
          </HStack>
        </Card>

        <VStack gap={spacing.md} style={styles.listSection}>
          {filteredHelpers.length > 0 ? (
            filteredHelpers.map((helper) => (
              <HelperPoolCard
                key={helper.id}
                helper={helper}
                onPress={() => router.push(`/(domestic-help)/pool/${helper.id}`)}
              />
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Search size={48} color={colors.textSecondary} />
              <Text variant="bodyLg" style={[styles.emptyText, { fontWeight: '500' }]}>
                No helpers found
              </Text>
              <Text variant="body" tone="secondary" style={styles.emptySubtext}>
                Try adjusting your search or filters
              </Text>
            </Card>
          )}
        </VStack>

        {/* CTA */}
        <Card style={styles.ctaCard}>
          <VStack gap={spacing.sm}>
            <Text variant="bodyLg" style={{ fontWeight: '600' }}>Know a good helper?</Text>
            <Text variant="body" tone="secondary">
              Refer them to the community pool and earn ₹100 when they get verified
            </Text>
            <Button
              label="Refer a Helper"
              variant="secondary"
              onPress={() => router.push('/(domestic-help)/refer')}
              style={styles.ctaButton}
            />
          </VStack>
        </Card>

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
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  searchBar: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    height: 40,
    gap: spacing.sm,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.foreground,
    padding: 0,
  },
  filterPillsScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  filterPills: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: {
    backgroundColor: colors.brand[600],
    borderColor: colors.brand[600],
  },
  filterEmoji: { fontSize: 16 },
  countBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.full,
    marginLeft: spacing.xs,
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  scroll: { flex: 1 },
  infoBanner: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: '#D1FAE5',
  },
  listSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  helperCard: {
    padding: spacing.md,
  },
  helperHeader: {
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  helperInfo: { flex: 1 },
  nameRow: { alignItems: 'center', gap: spacing.xs },
  statsRow: { alignItems: 'center', marginTop: spacing.xs },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  cardFooter: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyCard: {
    padding: spacing[6],
    alignItems: 'center',
  },
  emptyText: { marginTop: spacing.md },
  emptySubtext: { textAlign: 'center', marginTop: spacing.xs },
  ctaCard: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.brand[50],
  },
  ctaButton: { marginTop: spacing.sm },
  bottomPadding: { height: 100 },
});
