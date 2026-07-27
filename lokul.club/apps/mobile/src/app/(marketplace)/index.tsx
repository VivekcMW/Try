import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, ShoppingBag, Store } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { SERVICE_CATEGORIES, ServiceCategory } from '@/data/community-seed';
import { colors, spacing } from '@lokul/ui-tokens';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

const CATEGORY_COLORS: Record<ServiceCategory, string> = {
  // Home Help
  maid:                '#8B5CF6',
  cook:                '#F97316',
  tiffin:              '#EF4444',
  driver:              '#64748B',
  // Home & Trades
  plumber:             '#3B82F6',
  electrician:         '#F59E0B',
  carpenter:           '#92400E',
  ac_repair:           '#06B6D4',
  painter:             '#F43F5E',
  mason:               '#78716C',
  pest_control:        '#84CC16',
  appliance_repair:    '#0EA5E9',
  water_purifier:      '#38BDF8',
  cctv_security:       '#475569',
  packers_movers:      '#FB923C',
  car_wash:            '#A855F7',
  laundry:             '#6366F1',
  gardener:            '#22C55E',
  // Personal Care
  salon:               '#EC4899',
  barber:              '#1D4ED8',
  mehendi:             '#D97706',
  fitness:             '#10B981',
  yoga:                '#7C3AED',
  massage:             '#DB2777',
  physiotherapy:       '#059669',
  dietitian:           '#65A30D',
  nurse:               '#E11D48',
  lab_test:            '#0D9488',
  pet_care:            '#CA8A04',
  // Professional
  photographer:        '#6366F1',
  ca_accountant:       '#2563EB',
  lawyer:              '#1E3A5F',
  interior_designer:   '#C084FC',
  event_planner:       '#F472B6',
  catering:            '#FBBF24',
  tutor_academic:      '#4F46E5',
  career_counsellor:   '#0369A1',
  insurance_advisor:   '#475569',
  // Society
  society_maintenance: '#DC2626',
  elderly_care:        '#9333EA',
  childcare:           '#0891B2',
  other:               '#94A3B8',
};

export default function MarketplaceIndexScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { isEnabled, loading } = useFeatureFlags();

  // Redirect if services feature is not enabled
  useEffect(() => {
    if (!loading && !isEnabled('services')) {
      console.log('[Marketplace] Services feature not enabled, redirecting to explore');
      router.replace('/(tabs)/explore');
    }
  }, [loading, isEnabled, router]);

  // Show nothing while checking feature flag
  if (loading || !isEnabled('services')) {
    return null;
  }

  const filtered = SERVICE_CATEGORIES.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  const sections = useMemo(() => {
    const map = new Map<string, typeof SERVICE_CATEGORIES>();
    filtered.forEach((cat) => {
      const list = map.get(cat.group) ?? [];
      list.push(cat);
      map.set(cat.group, list);
    });
    return Array.from(map.entries()).map(([title, items]) => ({ title, items }));
  }, [filtered]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <HStack gap={3} align="center" style={styles.topBar}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/explore')} style={styles.backBtn} accessibilityRole="button">
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <VStack gap={0} style={{ flex: 1 }}>
          <Text variant="h3" style={{ color: colors.surface.heading }}>Services</Text>
          <Text variant="body" tone="secondary">Book trusted local services</Text>
        </VStack>
        <Pressable
          onPress={() => router.push('/(marketplace)/orders' as any)}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="My Orders"
        >
          <ShoppingBag size={20} color={colors.brand[600]} />
        </Pressable>
      </HStack>

      {/* Search */}
      <View style={styles.searchRow}>
        <Search size={16} color={colors.surface.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search services…"
          placeholderTextColor={colors.surface.textSecondary}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {/* Grouped category grid */}
      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {sections.map(({ title, items }) => (
          <VStack key={title} gap={2}>
            <Text variant="caption" style={styles.sectionHeader}>{title.toUpperCase()}</Text>
            <View style={styles.row}>
              {items.map((item) => {
                const Icon = item.Icon;
                return (
                  <Pressable
                    key={item.id}
                    style={styles.tile}
                    onPress={() => router.push(`/(marketplace)/category/${item.id}` as any)}
                    accessibilityRole="button"
                  >
                    <View style={[styles.iconWrap, { backgroundColor: CATEGORY_COLORS[item.id] + '18' }]}>
                      <Icon size={26} color={CATEGORY_COLORS[item.id]} />
                    </View>
                    <Text
                      variant="caption"
                      style={{ fontWeight: '700', color: colors.surface.foreground, textAlign: 'center' }}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </VStack>
        ))}

        {/* Provider registration CTA */}
        <Card
          padding={4}
          elevation="sm"
          style={{
            backgroundColor: colors.brand[50],
            borderWidth: 1,
            borderColor: colors.brand[200],
            marginTop: spacing[2],
          }}
        >
          <VStack gap={3}>
            <HStack gap={3} align="center">
              <View style={styles.ctaIconWrap}>
                <Store size={22} color={colors.brand[600]} />
              </View>
              <VStack gap={0.5} style={{ flex: 1 }}>
                <Text variant="body" style={{ fontWeight: '700', color: colors.brand[700] }}>
                  Are you a service provider?
                </Text>
                <Text variant="caption" tone="secondary">
                  Register your business and start getting bookings from neighbours.
                </Text>
              </VStack>
            </HStack>
            <Button
              label="Register as Provider"
              variant="secondary"
              onPress={() => router.push('/(business)/onboard' as never)}
              fullWidth
            />
          </VStack>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.background },
  topBar: {
    paddingHorizontal: spacing[4], paddingTop: spacing[5], paddingBottom: spacing[3],
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center',
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.brand[50], alignItems: 'center', justifyContent: 'center',
  },
  searchRow: {
    paddingHorizontal: spacing[4], paddingBottom: spacing[3], position: 'relative',
  },
  searchIcon: { position: 'absolute', left: spacing[7], top: '50%', transform: [{ translateY: -8 }], zIndex: 1 },
  searchInput: {
    backgroundColor: colors.gray[100], borderRadius: 20,
    paddingHorizontal: spacing[10], paddingVertical: spacing[3],
    fontSize: 14, color: colors.surface.heading,
  },
  grid: { paddingHorizontal: spacing[4], paddingBottom: spacing[16], gap: spacing[5] },
  sectionHeader: {
    fontWeight: '700', color: colors.surface.textSecondary, letterSpacing: 0.8,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  tile: {
    width: '30%', borderRadius: 14, backgroundColor: colors.surface.background,
    paddingVertical: spacing[4], alignItems: 'center', gap: spacing[2],
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  iconWrap: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  ctaIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.brand[100],
    alignItems: 'center', justifyContent: 'center',
  },
});
