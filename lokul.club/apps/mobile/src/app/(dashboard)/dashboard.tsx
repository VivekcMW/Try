// PRD §13 — User Dashboard (Earnings, Spend, Orders, Roles, Activity)
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Calendar,
  ChevronRight,
  Clock,
  ShieldCheck,
  Star,
  TrendingUp,
  Wallet,
} from 'lucide-react-native';
import { Avatar, Badge, Card, HStack, Text, VStack } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useProfileStore } from '@/store/profileStore';
import { useWalletStore, rupees, type LedgerEntry } from '@/store/walletStore';
import { usePeerStore, ROLE_META, type PeerRole } from '@/store/peerRoleStore';
import { tierLabel, tierTone, useVerificationStore } from '@/store/verificationStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

// ─── Types ───────────────────────────────────────────────────────────────────

type OrderStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

type Order = {
  id: string;
  status: OrderStatus;
  title: string;
  pricePaise: number;
  quantity: number;
  scheduledAt: string | null;
  createdAt: string;
  buyer:  { id: string; name: string };
  seller: { id: string; name: string };
  listing: { category: string } | null;
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_TONE: Record<OrderStatus, 'neutral' | 'warning' | 'info' | 'success' | 'danger'> = {
  pending: 'warning',
  confirmed: 'info',
  in_progress: 'info',
  completed: 'success',
  cancelled: 'danger',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function startOfMonth() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function greetingFor(name: string) {
  const h = new Date().getHours();
  const prefix = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return `${prefix}, ${name || 'there'} 👋`;
}

// ─── Section header component ─────────────────────────────────────────────────

function SectionHeader({
  title,
  linkLabel,
  onLink,
}: {
  title: string;
  linkLabel?: string;
  onLink?: () => void;
}) {
  return (
    <HStack align="center" style={{ marginBottom: spacing[3] }}>
      <Text variant="label" style={styles.sectionTitle}>{title}</Text>
      {linkLabel && onLink ? (
        <Pressable onPress={onLink} hitSlop={8}>
          <HStack gap={1} align="center">
            <Text variant="caption" style={{ color: colors.brand[600], fontWeight: '600' }}>
              {linkLabel}
            </Text>
            <ChevronRight size={14} color={colors.brand[600]} />
          </HStack>
        </Pressable>
      ) : null}
    </HStack>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  color,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  color: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}) {
  return (
    <Card padding={4} elevation="sm" style={styles.kpiCard}>
      <View style={[styles.kpiIconWrap, { backgroundColor: color + '20' }]}>
        <Icon size={18} color={color} />
      </View>
      <Text style={{ fontSize: 18, fontWeight: '700', color: colors.surface.heading, marginTop: spacing[2], letterSpacing: -0.3 }}>
        {value}
      </Text>
      <Text variant="caption" tone="secondary">{label}</Text>
      {sub ? (
        <Text variant="caption" style={{ color, fontWeight: '600', marginTop: spacing[0.5] }}>
          {sub}
        </Text>
      ) : null}
    </Card>
  );
}

// ─── Ledger row ───────────────────────────────────────────────────────────────

function LedgerRow({ entry }: { entry: LedgerEntry }) {
  const isCredit = entry.amountPaise > 0;
  const color = isCredit ? '#059669' : entry.type === 'hold' ? '#D97706' : '#DC2626';
  const Icon = isCredit ? ArrowDownLeft : ArrowUpRight;
  const sign = isCredit ? '+' : '';

  return (
    <HStack gap={3} align="center" style={styles.ledgerRow}>
      <View style={[styles.ledgerIcon, { backgroundColor: color + '15' }]}>
        <Icon size={16} color={color} />
      </View>
      <VStack gap={0.5} style={{ flex: 1 }}>
        <Text variant="body" style={{ color: colors.surface.heading, fontWeight: '500' }} numberOfLines={1}>
          {entry.description}
        </Text>
        {entry.party ? (
          <Text variant="caption" tone="secondary">{entry.party}</Text>
        ) : null}
      </VStack>
      <VStack gap={0.5} style={{ alignItems: 'flex-end' }}>
        <Text variant="body" style={{ color, fontWeight: '700' }}>
          {sign}{rupees(Math.abs(entry.amountPaise))}
        </Text>
        <Text variant="caption" tone="secondary">
          {new Date(entry.ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </Text>
      </VStack>
    </HStack>
  );
}

// ─── Order row ────────────────────────────────────────────────────────────────

function OrderRow({ order, userId, onPress }: { order: Order; userId: string | null; onPress: () => void }) {
  const isSellerView = order.seller.id === userId;
  const counterparty = isSellerView ? order.buyer.name : order.seller.name;
  const role = isSellerView ? 'Seller' : 'Buyer';
  const category = order.listing?.category;
  const total = (order.pricePaise * order.quantity) / 100;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.orderRow, pressed && { backgroundColor: colors.gray[50] }]}
    >
      <HStack gap={3} align="center">
        <View style={styles.orderIconWrap}>
          <Calendar size={18} color={colors.brand[700]} />
        </View>
        <VStack gap={0.5} style={{ flex: 1 }}>
          <Text variant="body" style={{ color: colors.surface.heading, fontWeight: '600' }} numberOfLines={1}>
            {order.title}
          </Text>
          <Text variant="caption" tone="secondary">
            {role} · {counterparty}{category ? ` · ${category}` : ''}
          </Text>
        </VStack>
        <VStack gap={0.5} style={{ alignItems: 'flex-end' }}>
          <Badge label={STATUS_LABEL[order.status]} tone={STATUS_TONE[order.status]} />
          <Text variant="caption" style={{ color: colors.surface.heading, fontWeight: '600' }}>
            ₹{total.toLocaleString('en-IN')}
          </Text>
        </VStack>
      </HStack>
    </Pressable>
  );
}

// ─── Role row ─────────────────────────────────────────────────────────────────

function RoleRow({ role, state }: { role: PeerRole; state: { active: boolean; earningsPaise: number; completedOrders: number; rating: number } }) {
  const stars = state.rating > 0 ? state.rating.toFixed(1) : '—';
  return (
    <HStack gap={3} align="center" style={styles.roleRow}>
      <View style={styles.roleIconWrap}>
        <BadgeCheck size={18} color={state.active ? colors.brand[700] : colors.gray[400]} />
      </View>
      <VStack gap={0.5} style={{ flex: 1 }}>
        <HStack gap={2} align="center">
          <Text variant="body" style={{ color: colors.surface.heading, fontWeight: '600' }}>
            {ROLE_META[role].label}
          </Text>
          {state.active ? (
            <Badge label="Live" tone="success" />
          ) : null}
        </HStack>
        <Text variant="caption" tone="secondary">
          {state.completedOrders} orders · {rupees(state.earningsPaise)} earned
        </Text>
      </VStack>
      <HStack gap={1} align="center">
        <Star size={13} color="#F59E0B" fill="#F59E0B" />
        <Text variant="caption" style={{ fontWeight: '700', color: colors.surface.heading }}>{stars}</Text>
      </HStack>
    </HStack>
  );
}

// ─── Spend breakdown bar ──────────────────────────────────────────────────────

function SpendBar({ label, paise, maxPaise, color }: { label: string; paise: number; maxPaise: number; color: string }) {
  const pct = maxPaise > 0 ? Math.max(4, (paise / maxPaise) * 100) : 4;
  return (
    <VStack gap={1}>
      <HStack align="center">
        <Text variant="caption" tone="secondary" style={{ flex: 1 }}>{label}</Text>
        <Text variant="caption" style={{ fontWeight: '700', color: colors.surface.heading }}>{rupees(paise)}</Text>
      </HStack>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
    </VStack>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const router = useRouter();

  // Stores
  const profile    = useProfileStore((s) => s.profile);
  const { userId, balancePaise, heldPaise, earningsPaise, ledger } = useWalletStore();
  const { roles }  = usePeerStore();
  const tier       = useVerificationStore((s) => s.tier);
  const name       = useOnboardingStore((s) => s.name);

  // Live orders
  const [orders, setOrders]       = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!userId) return;
    setLoadingOrders(true);
    try {
      const [buyerRes, sellerRes] = await Promise.allSettled([
        fetch(`${BASE}/api/mobile/orders?buyerId=${userId}&limit=20`),
        fetch(`${BASE}/api/mobile/orders?sellerId=${userId}&limit=20`),
      ]);
      const buyerOrders: Order[]  = buyerRes.status  === 'fulfilled' && buyerRes.value.ok  ? await buyerRes.value.json()  : [];
      const sellerOrders: Order[] = sellerRes.status === 'fulfilled' && sellerRes.value.ok ? await sellerRes.value.json() : [];

      // Merge & deduplicate
      const seen = new Set<string>();
      const merged: Order[] = [];
      for (const o of [...buyerOrders, ...sellerOrders]) {
        if (!seen.has(o.id)) { seen.add(o.id); merged.push(o); }
      }
      // Sort newest first
      merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(merged);
    } catch { /* noop */ } finally {
      setLoadingOrders(false);
    }
  }, [userId]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, [fetchOrders]);

  // ── Derived: this-month stats ──────────────────────────────────────────────
  const monthStart = useMemo(() => startOfMonth(), []);

  const monthStats = useMemo(() => {
    let spent = 0, earned = 0, buyerOrders = 0, sellerOrders = 0;
    for (const e of ledger) {
      if (e.ts < monthStart) continue;
      if (e.type === 'spend') spent += Math.abs(e.amountPaise);
      if (e.type === 'earn')  earned += e.amountPaise;
    }
    for (const o of orders) {
      if (new Date(o.createdAt).getTime() < monthStart) continue;
      if (o.buyer.id === userId)  buyerOrders++;
      if (o.seller.id === userId) sellerOrders++;
    }
    return { spent, earned, buyerOrders, sellerOrders };
  }, [ledger, orders, monthStart, userId]);

  // ── Derived: upcoming orders ───────────────────────────────────────────────
  const upcomingOrders = useMemo(
    () => orders.filter((o) => ['pending', 'confirmed', 'in_progress'].includes(o.status)).slice(0, 5),
    [orders]
  );

  // ── Derived: active/earner roles ───────────────────────────────────────────
  const activeRoles = useMemo(
    () => (Object.entries(roles) as [PeerRole, typeof roles[PeerRole]][])
      .filter(([, s]) => s.active || s.completedOrders > 0)
      .sort((a, b) => b[1].earningsPaise - a[1].earningsPaise),
    [roles]
  );

  // ── Derived: avg rating across all roles ──────────────────────────────────
  const avgRating = useMemo(() => {
    let totalWeight = 0, weightedSum = 0;
    for (const [, s] of activeRoles) {
      if (s.completedOrders > 0 && s.rating > 0) {
        weightedSum  += s.rating * s.completedOrders;
        totalWeight  += s.completedOrders;
      }
    }
    return totalWeight > 0 ? weightedSum / totalWeight : null;
  }, [activeRoles]);

  // ── Derived: spend breakdown ───────────────────────────────────────────────
  const spendBreakdown = useMemo(() => {
    const cats: Record<string, number> = { Services: 0, 'Group Buy': 0, Topup: 0, Other: 0 };
    for (const e of ledger) {
      if (e.type === 'spend') {
        const abs = Math.abs(e.amountPaise);
        const d = e.description.toLowerCase();
        if (d.includes('cook') || d.includes('tutor') || d.includes('order') || d.includes('booking')) cats['Services'] += abs;
        else if (d.includes('group') || d.includes('buy') || d.includes('mango')) cats['Group Buy'] += abs;
        else cats['Other'] += abs;
      }
      if (e.type === 'topup') cats['Topup'] += e.amountPaise;
    }
    return cats;
  }, [ledger]);

  const maxSpend = Math.max(...Object.values(spendBreakdown), 1);

  const recentLedger = useMemo(() => ledger.slice(0, 5), [ledger]);

  // ── Pending payout amount ──────────────────────────────────────────────────
  const pendingPayoutPaise = useMemo(
    () => ledger
      .filter((e) => e.type === 'payout' && e.status === 'pending')
      .reduce((s, e) => s + Math.abs(e.amountPaise), 0),
    [ledger]
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <HStack gap={3} align="center" style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <VStack gap={0} style={{ flex: 1 }}>
          <Text variant="h3" style={{ color: colors.surface.heading }}>{greetingFor(profile.name || name)}</Text>
          <HStack gap={1.5} align="center">
            <ShieldCheck size={12} color={colors.brand[600]} />
            <Text variant="caption" tone="secondary">
              {tierLabel(tier)} Member
              {profile.societyName ? ` · ${profile.societyName}` : ''}
            </Text>
          </HStack>
        </VStack>
        <Avatar name={profile.name || name} source={profile.photoUri ? { uri: profile.photoUri } : undefined} size="md" />
      </HStack>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand[600]} />}
      >

        {/* ── Financial KPIs ── */}
        <View>
          <SectionHeader title="WALLET & EARNINGS" />
          <View style={styles.kpiGrid}>
            <KpiCard
              label="Available Balance"
              value={rupees(balancePaise)}
              color={colors.brand[600]}
              icon={Wallet}
              sub={heldPaise > 0 ? `${rupees(heldPaise)} on hold` : undefined}
            />
            <KpiCard
              label="Lifetime Earnings"
              value={rupees(earningsPaise)}
              color="#059669"
              icon={TrendingUp}
              sub={monthStats.earned > 0 ? `+${rupees(monthStats.earned)} this month` : undefined}
            />
            <KpiCard
              label="Spent This Month"
              value={rupees(monthStats.spent)}
              color="#DC2626"
              icon={ArrowUpRight}
              sub={`${monthStats.buyerOrders} order${monthStats.buyerOrders !== 1 ? 's' : ''}`}
            />
            <KpiCard
              label="Pending Payout"
              value={rupees(pendingPayoutPaise)}
              color="#D97706"
              icon={Clock}
              sub={pendingPayoutPaise > 0 ? 'Processing' : 'None pending'}
            />
          </View>
        </View>

        {/* ── This month summary bar ── */}
        <Card padding={4} elevation="sm">
          <SectionHeader title="THIS MONTH" />
          <View style={styles.monthGrid}>
            <View style={[styles.monthCell, styles.monthCellRight, styles.monthCellBottom]}>
              <Text style={[styles.monthVal, { color: '#059669' }]}>{rupees(monthStats.earned)}</Text>
              <Text variant="caption" tone="secondary">Earned</Text>
            </View>
            <View style={[styles.monthCell, styles.monthCellBottom]}>
              <Text style={[styles.monthVal, { color: '#DC2626' }]}>{rupees(monthStats.spent)}</Text>
              <Text variant="caption" tone="secondary">Spent</Text>
            </View>
            <View style={[styles.monthCell, styles.monthCellRight]}>
              <Text style={[styles.monthVal, { color: colors.brand[600] }]}>{monthStats.buyerOrders}</Text>
              <Text variant="caption" tone="secondary">Orders as Buyer</Text>
            </View>
            <View style={styles.monthCell}>
              <Text style={[styles.monthVal, { color: '#0D9488' }]}>{monthStats.sellerOrders}</Text>
              <Text variant="caption" tone="secondary">Orders as Seller</Text>
            </View>
          </View>
        </Card>

        {/* ── Upcoming Orders ── */}
        <View>
          <SectionHeader
            title="UPCOMING ORDERS"
            linkLabel="See all"
            onLink={() => router.push('/(marketplace)/orders' as any)}
          />
          <Card padding={0} elevation="sm">
            {loadingOrders ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="small" color={colors.brand[600]} />
              </View>
            ) : upcomingOrders.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Calendar size={32} color={colors.gray[300]} />
                <Text variant="caption" tone="secondary" style={{ marginTop: spacing[2], textAlign: 'center' }}>
                  No upcoming orders right now
                </Text>
              </View>
            ) : (
              upcomingOrders.map((o, i) => (
                <View key={o.id}>
                  {i > 0 && <View style={styles.divider} />}
                  <OrderRow
                    order={o}
                    userId={userId}
                    onPress={() => router.push(`/(marketplace)/order/${o.id}` as any)}
                  />
                </View>
              ))
            )}
          </Card>
        </View>

        {/* ── Active Roles ── */}
        {activeRoles.length > 0 ? (
          <View>
            <SectionHeader
              title="YOUR ROLES"
              linkLabel="Manage"
              onLink={() => router.push('/(marketplace)/my-listings' as any)}
            />
            <Card padding={0} elevation="sm">
              {activeRoles.map(([role, state], i) => (
                <View key={role}>
                  {i > 0 && <View style={styles.divider} />}
                  <RoleRow role={role} state={state} />
                </View>
              ))}
            </Card>
          </View>
        ) : null}

        {/* ── Spend Breakdown ── */}
        <Card padding={4} elevation="sm">
          <SectionHeader title="SPEND BREAKDOWN" />
          <VStack gap={3}>
            {Object.entries(spendBreakdown).map(([cat, paise]) =>
              paise > 0 ? (
                <SpendBar
                  key={cat}
                  label={cat}
                  paise={paise}
                  maxPaise={maxSpend}
                  color={
                    cat === 'Services'  ? colors.brand[500]  :
                    cat === 'Group Buy' ? '#0D9488'          :
                    cat === 'Topup'     ? '#059669'          : colors.gray[400]
                  }
                />
              ) : null
            )}
          </VStack>
        </Card>

        {/* ── Recent Activity ── */}
        <View>
          <SectionHeader
            title="RECENT ACTIVITY"
            linkLabel="Full ledger"
            onLink={() => router.push('/(wallet)/ledger' as any)}
          />
          <Card padding={0} elevation="sm">
            {recentLedger.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text variant="caption" tone="secondary">No transactions yet</Text>
              </View>
            ) : (
              recentLedger.map((e, i) => (
                <View key={e.id}>
                  {i > 0 && <View style={styles.divider} />}
                  <LedgerRow entry={e} />
                </View>
              ))
            )}
          </Card>
        </View>

        {/* ── Trust & Reputation ── */}
        <Card padding={4} elevation="sm">
          <SectionHeader title="TRUST & REPUTATION" />
          <HStack gap={4} style={styles.reputationRow}>
            <VStack gap={0.5} style={styles.repCell}>
              <HStack gap={1} align="center">
                <Star size={16} color="#F59E0B" fill="#F59E0B" />
                <Text variant="h3" style={{ color: colors.surface.heading }}>
                  {avgRating != null ? avgRating.toFixed(1) : '—'}
                </Text>
              </HStack>
              <Text variant="caption" tone="secondary">Avg Rating</Text>
            </VStack>
            <View style={styles.repDivider} />
            <VStack gap={0.5} style={styles.repCell}>
              <Text variant="h3" style={{ color: colors.surface.heading }}>
                {activeRoles.reduce((s, [, r]) => s + r.completedOrders, 0)}
              </Text>
              <Text variant="caption" tone="secondary">Orders Done</Text>
            </VStack>
            <View style={styles.repDivider} />
            <VStack gap={0.5} style={styles.repCell}>
              <HStack gap={1} align="center">
                <BadgeCheck size={16} color={colors.brand[600]} />
                <Text variant="h3" style={{ color: colors.surface.heading }}>
                  {tierLabel(tier)}
                </Text>
              </HStack>
              <Text variant="caption" tone="secondary">KYC Tier</Text>
            </VStack>
          </HStack>

          {tier !== 'gold' ? (
            <Pressable
              onPress={() => router.push(tier === 'bronze' ? '/(verification)/silver-proof' : '/(verification)/gold-consent' as any)}
              style={styles.upgradeCta}
            >
              <HStack gap={2} align="center">
                <ShieldCheck size={16} color={colors.brand[700]} />
                <Text variant="caption" style={{ color: colors.brand[700], fontWeight: '700', flex: 1 }}>
                  {tier === 'bronze' ? 'Verify to unlock selling & payouts →' : 'Upgrade to Gold for higher limits →'}
                </Text>
                <ChevronRight size={14} color={colors.brand[700]} />
              </HStack>
            </Pressable>
          ) : null}
        </Card>

        {/* ── Summary stats ── */}
        <Card padding={4} elevation="sm" style={styles.summaryCard}>
          <HStack gap={2} align="center" style={{ marginBottom: spacing[3] }}>
            <BarChart3 size={16} color={colors.brand[600]} />
            <Text variant="label" style={styles.sectionTitle}>ALL-TIME SUMMARY</Text>
          </HStack>
          <VStack gap={2}>
            {([
              { label: 'Total Earned',       val: rupees(earningsPaise),                                             color: '#059669' },
              { label: 'Roles Active',       val: `${activeRoles.filter(([, s]) => s.active).length} of ${activeRoles.length}`, color: colors.brand[600] },
              { label: 'Orders Completed',   val: `${orders.filter((o) => o.status === 'completed').length}`,        color: '#0D9488' },
              { label: 'Orders as Buyer',    val: `${orders.filter((o) => o.buyer.id === userId).length}`,           color: '#6B7280' },
              { label: 'Orders as Seller',   val: `${orders.filter((o) => o.seller.id === userId).length}`,          color: '#6B7280' },
            ] as const).map((row) => (
              <HStack key={row.label} align="center">
                <Text variant="caption" tone="secondary" style={{ flex: 1 }}>{row.label}</Text>
                <Text variant="body" style={{ color: row.color, fontWeight: '700' }}>{row.val}</Text>
              </HStack>
            ))}
          </VStack>
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  header: {
    paddingHorizontal: spacing[5],
    paddingVertical:   spacing[4],
    backgroundColor:   colors.surface.background,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.surface.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.gray[100],
    alignItems: 'center', justifyContent: 'center',
  },
  content:     { padding: spacing[5], gap: spacing[5], paddingBottom: spacing[16] },
  sectionTitle: {
    flex: 1,
    color: colors.surface.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.6,
    fontSize: 11,
    textTransform: 'uppercase',
  },

  // KPI grid — 2 columns
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  kpiCard: { flex: 1, minWidth: '45%' },
  kpiIconWrap: {
    width: 36, height: 36, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },

  // Month grid — 2×2
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  monthCell: { width: '50%', alignItems: 'center', paddingVertical: spacing[3] },
  monthCellRight:  { borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: '#E5E7EB' },
  monthCellBottom: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB' },
  monthVal: { fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },

  // Ledger / order rows
  ledgerRow:   { paddingHorizontal: spacing[4], paddingVertical: spacing[3] },
  ledgerIcon:  { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  orderRow:    { paddingHorizontal: spacing[4], paddingVertical: spacing[3.5] },
  orderIconWrap: {
    width: 36, height: 36, borderRadius: radius.sm,
    backgroundColor: colors.brand[50],
    alignItems: 'center', justifyContent: 'center',
  },

  // Role row
  roleRow:     { paddingHorizontal: spacing[4], paddingVertical: spacing[3.5] },
  roleIconWrap: {
    width: 36, height: 36, borderRadius: radius.sm,
    backgroundColor: colors.brand[50],
    alignItems: 'center', justifyContent: 'center',
  },

  // Spend bar
  barTrack: { height: 6, borderRadius: 3, backgroundColor: colors.gray[100], overflow: 'hidden' },
  barFill:  { height: 6, borderRadius: 3 },

  // Trust section
  reputationRow: { justifyContent: 'space-around', marginBottom: spacing[3] },
  repCell:  { flex: 1, alignItems: 'center' },
  repDivider: { width: 1, backgroundColor: colors.surface.border, alignSelf: 'stretch' },
  upgradeCta: {
    backgroundColor: colors.brand[50],
    borderWidth: 1,
    borderColor: colors.brand[100],
    borderRadius: radius.md,
    paddingHorizontal: spacing[4],
    paddingVertical:   spacing[3],
  },

  // Summary card
  summaryCard: { borderWidth: 1, borderColor: colors.surface.border },

  // Shared
  divider:    { height: 1, backgroundColor: colors.surface.border, marginLeft: spacing[4] },
  loadingWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing[8] },
  emptyWrap:  { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing[8], gap: spacing[1] },
});
