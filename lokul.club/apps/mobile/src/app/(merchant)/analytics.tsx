/**
 * Merchant Analytics Dashboard
 * PRD 06 — Local Business Hub / SaaS tools for merchants
 *
 * Gated: PlusGate feature="merchant_dashboard" (Business tier)
 * Route: /(merchant)/analytics
 */
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  Eye,
  Filter,
  ShoppingBag,
  Star,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react-native';
import { HStack, Text, VStack } from '@/components/ui';
import { PlusGate } from '@/components/PlusGate';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

interface AnalyticsSummary {
  pageViews:         number;
  weeklyBookings:    number;
  monthlyBookings:   number;
  revenueThisMonth:  number;  // paise
  avgRating:         number;
  totalReviews:      number;
  newCustomers:      number;
  repeatCustomers:   number;
  topProduct:        string;
}

interface WeeklyBar {
  day: string;   // Mon, Tue…
  bookings: number;
  revenue: number; // paise
}

interface MonthlyBar {
  month: string;
  bookings: number;
  revenue: number; // paise
}

interface FunnelStep {
  label: string;
  value: number;
  pct: number;
}

// ── Seed / demo data ──────────────────────────────────────────────────────────
const SEED_SUMMARY: AnalyticsSummary = {
  pageViews:         1_248,
  weeklyBookings:    34,
  monthlyBookings:   127,
  revenueThisMonth:  48_500_00,  // ₹48,500
  avgRating:         4.7,
  totalReviews:      89,
  newCustomers:      22,
  repeatCustomers:   105,
  topProduct:        'Pest Control (4hr)',
};

const SEED_WEEKLY: WeeklyBar[] = [
  { day: 'Mon', bookings: 4,  revenue: 6_000_00 },
  { day: 'Tue', bookings: 6,  revenue: 9_200_00 },
  { day: 'Wed', bookings: 5,  revenue: 7_800_00 },
  { day: 'Thu', bookings: 8,  revenue: 12_000_00 },
  { day: 'Fri', bookings: 7,  revenue: 10_500_00 },
  { day: 'Sat', bookings: 10, revenue: 15_000_00 },
  { day: 'Sun', bookings: 3,  revenue: 4_200_00 },
];

const SEED_MONTHLY: MonthlyBar[] = [
  { month: 'Jul', bookings: 82,  revenue: 28_000_00 },
  { month: 'Aug', bookings: 94,  revenue: 31_000_00 },
  { month: 'Sep', bookings: 88,  revenue: 29_500_00 },
  { month: 'Oct', bookings: 101, revenue: 34_000_00 },
  { month: 'Nov', bookings: 112, revenue: 37_500_00 },
  { month: 'Dec', bookings: 126, revenue: 42_000_00 },
  { month: 'Jan', bookings: 117, revenue: 39_000_00 },
  { month: 'Feb', bookings: 122, revenue: 41_000_00 },
  { month: 'Mar', bookings: 135, revenue: 45_000_00 },
  { month: 'Apr', bookings: 129, revenue: 43_000_00 },
  { month: 'May', bookings: 140, revenue: 47_000_00 },
  { month: 'Jun', bookings: 127, revenue: 48_500_00 },
];

const SEED_FUNNEL: FunnelStep[] = [
  { label: 'Page Views',     value: 1248, pct: 100 },
  { label: 'Profile Clicks', value: 436,  pct: 35  },
  { label: 'Enquiries',      value: 189,  pct: 15  },
  { label: 'Bookings',       value: 127,  pct: 10  },
  { label: 'Completed',      value: 112,  pct: 9   },
  { label: 'Repeat Orders',  value: 47,   pct: 4   },
];

// ── Mini bar chart (weekly) ────────────────────────────────────────────────────
function BarChartMini({ data, field }: { readonly data: WeeklyBar[]; readonly field: 'bookings' | 'revenue' }) {
  const values = data.map((d) => d[field]);
  const max    = Math.max(...values) || 1;
  const BAR_H  = 80;

  return (
    <HStack gap={1.5} align="end" style={{ height: BAR_H + 20 }}>
      {data.map((d) => {
        const pct = values[data.indexOf(d)] / max;
        return (
          <VStack key={d.day} gap={0} align="center" style={{ flex: 1 }}>
            <View style={[styles.bar, { height: Math.max(pct * BAR_H, 4) }]} />
            <Text style={styles.barLabel}>{d.day}</Text>
          </VStack>
        );
      })}
    </HStack>
  );
}

// ── Monthly bar chart (12 months) ─────────────────────────────────────────────
function MonthlyChart({ data, field }: { readonly data: MonthlyBar[]; readonly field: 'bookings' | 'revenue' }) {
  const values = data.map((d) => d[field]);
  const max    = Math.max(...values) || 1;
  const BAR_H  = 90;

  return (
    <HStack gap={1} style={{ height: BAR_H + 20, alignItems: 'flex-end' }}>
      {data.map((d, i) => {
        const isLast = i === data.length - 1;
        const pct = values[i] / max;
        return (
          <VStack key={d.month} gap={0} align="center" style={{ flex: 1 }}>
            <View style={[styles.bar, { height: Math.max(pct * BAR_H, 4), backgroundColor: isLast ? colors.brand[600] : colors.brand[300] }]} />
            <Text style={styles.barLabel}>{d.month.slice(0, 1)}</Text>
          </VStack>
        );
      })}
    </HStack>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon, label, value, sub, color = colors.brand[600],
}: {
  readonly icon: typeof Eye;
  readonly label: string;
  readonly value: string;
  readonly sub?: string;
  readonly color?: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
        <Icon size={18} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function MerchantAnalyticsScreen() {
  const router  = useRouter();
  const userId  = useWalletStore((s) => s.userId);
  const society = useOnboardingStore((s) => s.societyName) ?? 'your locality';

  const [summary,  setSummary]  = useState<AnalyticsSummary | null>(null);
  const [weekly,   setWeekly]   = useState<WeeklyBar[]>([]);
  const [monthly,  setMonthly]  = useState<MonthlyBar[]>([]);
  const [funnel,   setFunnel]   = useState<FunnelStep[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState<'overview' | 'bookings' | 'revenue' | 'funnel'>('overview');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/merchants/analytics?userId=${userId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSummary(data.summary ?? SEED_SUMMARY);
      setWeekly(data.weekly   ?? SEED_WEEKLY);
      setMonthly(data.monthly ?? SEED_MONTHLY);
      setFunnel(data.funnel   ?? SEED_FUNNEL);
    } catch {
      setSummary(SEED_SUMMARY);
      setWeekly(SEED_WEEKLY);
      setMonthly(SEED_MONTHLY);
      setFunnel(SEED_FUNNEL);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const s = summary ?? SEED_SUMMARY;
  const revStr = `₹${(s.revenueThisMonth / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  return (
    <PlusGate feature="merchant_dashboard">
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <HStack gap={3} align="center" style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back">
            <ArrowLeft size={22} color={colors.surface.heading} />
          </Pressable>
          <VStack gap={0} style={{ flex: 1 }}>
            <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>Business Analytics</Text>
            <Text variant="caption" tone="secondary">{society}</Text>
          </VStack>
          <Pressable onPress={load} hitSlop={10} accessibilityRole="button" accessibilityLabel="Refresh">
            <BarChart3 size={20} color={colors.brand[600]} />
          </Pressable>
        </HStack>

        {/* Tab bar */}
        <HStack gap={0} style={styles.tabs}>
          {(['overview', 'bookings', 'revenue', 'funnel'] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tab, tab === t && styles.tabActive]}
              accessibilityRole="tab"
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </Pressable>
          ))}
        </HStack>

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator color={colors.brand[600]} />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

            {/* ── Overview ── */}
            {tab === 'overview' && (
              <>
                {/* Hero stats grid */}
                <View style={styles.statsGrid}>
                  <StatCard icon={Eye}        label="Page Views"        value={s.pageViews.toLocaleString('en-IN')} sub="This month" />
                  <StatCard icon={Wallet}     label="Revenue"           value={revStr}                              sub="This month" color="#059669" />
                  <StatCard icon={Star}       label="Avg Rating"        value={`${s.avgRating}★`}                  sub={`${s.totalReviews} reviews`} color="#F59E0B" />
                  <StatCard icon={Users}      label="New Customers"     value={s.newCustomers.toString()}           sub="This month" />
                  <StatCard icon={ShoppingBag} label="Repeat Customers" value={s.repeatCustomers.toString()}       color={colors.brand[500]} />
                  <StatCard icon={TrendingUp} label="Top Service"       value="" sub={s.topProduct} />
                </View>

                {/* Weekly bookings chart */}
                <View style={styles.chartCard}>
                  <HStack gap={2} align="center" style={{ marginBottom: spacing[3] }}>
                    <CalendarDays size={16} color={colors.brand[600]} />
                    <Text style={styles.chartTitle}>This Week — Bookings</Text>
                  </HStack>
                  <BarChartMini data={SEED_WEEKLY} field="bookings" />
                  <Text style={styles.chartSub}>Total: {s.weeklyBookings} bookings · ₹{(SEED_WEEKLY.reduce((a, d) => a + d.revenue, 0) / 100).toLocaleString('en-IN')} revenue</Text>
                </View>
              </>
            )}

            {/* ── Bookings ── */}
            {tab === 'bookings' && (
              <>
                <View style={styles.chartCard}>
                  <Text style={styles.chartTitle}>Daily Bookings — This Week</Text>
                  <BarChartMini data={weekly} field="bookings" />
                </View>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryBox}>
                    <Text style={styles.summaryVal}>{s.weeklyBookings}</Text>
                    <Text style={styles.summaryLabel}>This Week</Text>
                  </View>
                  <View style={styles.summaryBox}>
                    <Text style={styles.summaryVal}>{s.monthlyBookings}</Text>
                    <Text style={styles.summaryLabel}>This Month</Text>
                  </View>
                  <View style={styles.summaryBox}>
                    <Text style={[styles.summaryVal, { color: '#059669' }]}>+12%</Text>
                    <Text style={styles.summaryLabel}>vs Last Month</Text>
                  </View>
                </View>
              </>
            )}

            {/* ── Revenue ── */}
            {tab === 'revenue' && (
              <>
                <View style={styles.chartCard}>
                  <Text style={styles.chartTitle}>Daily Revenue — This Week</Text>
                  <BarChartMini data={weekly} field="revenue" />
                  <Text style={styles.chartSub}>Values in ₹</Text>
                </View>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryBox}>
                    <Text style={styles.summaryVal}>{revStr}</Text>
                    <Text style={styles.summaryLabel}>This Month</Text>
                  </View>
                  <View style={styles.summaryBox}>
                    <Text style={[styles.summaryVal, { color: '#059669' }]}>+18%</Text>
                    <Text style={styles.summaryLabel}>vs Last Month</Text>
                  </View>
                </View>
              </>
            )}

            {/* ── Funnel ── */}
            {tab === 'funnel' && (
              <>
                {/* Conversion funnel */}
                <View style={styles.chartCard}>
                  <HStack gap={2} align="center" style={{ marginBottom: spacing[3] }}>
                    <Filter size={16} color={colors.brand[600]} />
                    <Text style={styles.chartTitle}>Customer Journey Funnel</Text>
                  </HStack>
                  {funnel.map((step, i) => (
                    <View key={step.label} style={{ marginBottom: spacing[2] }}>
                      <HStack gap={2} align="center" style={{ marginBottom: 4 }}>
                        <Text style={styles.funnelLabel}>{step.label}</Text>
                        <Text style={styles.funnelPct}>{step.pct}%</Text>
                        <Text style={[styles.funnelVal, { marginLeft: 'auto' }]}>{step.value.toLocaleString('en-IN')}</Text>
                      </HStack>
                      <View style={styles.funnelTrack}>
                        <View style={[
                          styles.funnelBar,
                          { width: `${step.pct}%` as any, backgroundColor: i === 0 ? colors.brand[600] : i < 3 ? colors.brand[400] : colors.brand[300] },
                        ]} />
                      </View>
                    </View>
                  ))}
                  <Text style={styles.chartSub}>
                    Conversion: {((funnel[3]?.value ?? 0) / (funnel[0]?.value || 1) * 100).toFixed(1)}% of views become bookings
                  </Text>
                </View>

                {/* 12-month revenue trend */}
                <View style={styles.chartCard}>
                  <HStack gap={2} align="center" style={{ marginBottom: spacing[3] }}>
                    <TrendingUp size={16} color="#059669" />
                    <Text style={styles.chartTitle}>Revenue Trend — 12 Months</Text>
                  </HStack>
                  <MonthlyChart data={monthly} field="revenue" />
                  <Text style={styles.chartSub}>
                    Peak: ₹{Math.max(...monthly.map((m) => m.revenue / 100)).toLocaleString('en-IN')} · Growth: +{(((monthly[11]?.revenue ?? 0) / (monthly[0]?.revenue || 1) - 1) * 100).toFixed(0)}% YoY
                  </Text>
                </View>

                {/* New vs repeat cohort */}
                <View style={styles.chartCard}>
                  <HStack gap={2} align="center" style={{ marginBottom: spacing[3] }}>
                    <Users size={16} color={colors.brand[600]} />
                    <Text style={styles.chartTitle}>Customer Retention</Text>
                  </HStack>
                  {[
                    { label: 'Repeat customers', value: 105, pct: Math.round(105 / (105 + 22) * 100), color: colors.brand[500] },
                    { label: 'New customers',    value: 22,  pct: Math.round(22  / (105 + 22) * 100), color: colors.brand[200] },
                  ].map((row) => (
                    <View key={row.label} style={{ marginBottom: spacing[2] }}>
                      <HStack gap={2} align="center" style={{ marginBottom: 4 }}>
                        <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: row.color }} />
                        <Text style={styles.funnelLabel}>{row.label}</Text>
                        <Text style={[styles.funnelVal, { marginLeft: 'auto' }]}>{row.value} ({row.pct}%)</Text>
                      </HStack>
                      <View style={styles.funnelTrack}>
                        <View style={[styles.funnelBar, { width: `${row.pct}%` as any, backgroundColor: row.color }]} />
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}

          </ScrollView>
        )}
      </SafeAreaView>
    </PlusGate>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.surface.background },
  header: { paddingHorizontal: spacing[4], paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.surface.border },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: spacing[4], gap: spacing[4], paddingBottom: spacing[12] },

  // Tabs
  tabs:         { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.surface.border },
  tab:          { flex: 1, paddingVertical: spacing[3], alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive:    { borderBottomColor: colors.brand[600] },
  tabText:      { fontSize: 13, fontWeight: '600', color: colors.surface.textSecondary },
  tabTextActive: { color: colors.brand[600] },

  // Stats grid
  statsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  statCard:   { width: '47%', backgroundColor: colors.surface.surfaceMuted, borderRadius: radius.lg, padding: spacing[3], gap: spacing[1.5] },
  statIcon:   { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  statValue:  { fontSize: 20, fontWeight: '800', color: colors.surface.heading },
  statLabel:  { fontSize: 11, fontWeight: '600', color: colors.surface.textSecondary },
  statSub:    { fontSize: 11, color: colors.surface.textSecondary },

  // Chart
  chartCard:  { backgroundColor: colors.surface.surfaceMuted, borderRadius: radius.lg, padding: spacing[4] },
  chartTitle: { fontSize: 13, fontWeight: '700', color: colors.surface.heading },
  chartSub:   { fontSize: 11, color: colors.surface.textSecondary, marginTop: spacing[2] },

  // Bar chart
  bar:      { width: '100%', backgroundColor: colors.brand[500], borderRadius: 3 },
  barLabel: { fontSize: 10, color: colors.surface.textSecondary, marginTop: spacing[1] },

  // Summary
  summaryRow: { flexDirection: 'row', gap: spacing[3] },
  summaryBox: { flex: 1, backgroundColor: colors.surface.surfaceMuted, borderRadius: radius.lg, padding: spacing[3], alignItems: 'center', gap: spacing[1] },
  summaryVal: { fontSize: 18, fontWeight: '800', color: colors.surface.heading },
  summaryLabel: { fontSize: 11, color: colors.surface.textSecondary, fontWeight: '600' },

  // Funnel
  funnelLabel: { fontSize: 12, fontWeight: '600', color: colors.surface.heading, flex: 1 },
  funnelPct:   { fontSize: 11, color: colors.surface.textSecondary, minWidth: 30 },
  funnelVal:   { fontSize: 12, fontWeight: '700', color: colors.surface.heading },
  funnelTrack: { height: 8, backgroundColor: colors.gray[100], borderRadius: 4, overflow: 'hidden' },
  funnelBar:   { height: 8, borderRadius: 4 },
});
