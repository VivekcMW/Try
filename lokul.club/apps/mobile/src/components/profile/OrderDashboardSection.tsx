// Profile Order Dashboard — KPI strip + Upcoming + Scheduled horizontal lists
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  IndianRupee,
  PackageCheck,
  ShoppingBag,
  Zap,
} from 'lucide-react-native';
import { Badge, Card, HStack, Text, VStack } from '@/components/ui';
import { useWalletStore } from '@/store/walletStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

// ── Types ────────────────────────────────────────────────────────────────────

type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'disputed';

type Order = {
  id: string;
  status: OrderStatus;
  pricePaise: number;
  scheduledAt: string | null;
  createdAt: string;
  title: string;
  listing: { id: string; title: string; category: string } | null;
  seller: { id: string; name: string; avatarUrl: string | null };
  buyer: { id: string; name: string; avatarUrl: string | null };
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  disputed: 'Disputed',
};

const STATUS_TONE: Record<
  OrderStatus,
  'neutral' | 'success' | 'warning' | 'danger'
> = {
  pending: 'neutral',
  confirmed: 'warning',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'danger',
  disputed: 'danger',
};

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

function fmtRupee(paise: number) {
  const val = paise / 100;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
  return `₹${val.toFixed(0)}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiTile({
  icon,
  label,
  value,
  accent,
}: Readonly<{
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}>) {
  return (
    <View style={[styles.kpiTile, accent && styles.kpiTileAccent]}>
      <View style={[styles.kpiIcon, accent && styles.kpiIconAccent]}>
        {icon}
      </View>
      <Text
        variant="h2"
        style={[
          styles.kpiValue,
          { color: accent ? colors.brand[700] : colors.surface.heading },
        ]}
      >
        {value}
      </Text>
      <Text variant="caption" tone="secondary" style={styles.kpiLabel}>
        {label}
      </Text>
    </View>
  );
}

function OrderCard({ order, onPress }: Readonly<{ order: Order; onPress: () => void }>) {
  const displayTitle = order.title ?? order.listing?.title ?? 'Order';
  const dateStr = fmtDate(order.scheduledAt ?? order.createdAt);

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Card padding={3} elevation="xs" bordered style={styles.orderCard}>
        <VStack gap={2}>
          {/* Title + badge */}
          <HStack justify="between" align="center">
            <Text
              variant="body"
              style={styles.orderTitle}
              numberOfLines={1}
            >
              {displayTitle}
            </Text>
            <Badge
              label={STATUS_LABEL[order.status]}
              tone={STATUS_TONE[order.status]}
              size="sm"
            />
          </HStack>

          {/* Provider name */}
          <Text variant="caption" tone="secondary" numberOfLines={1}>
            {order.seller.name}
          </Text>

          {/* Date + Price */}
          <HStack justify="between" align="center">
            <HStack gap={1} align="center">
              <Clock size={11} color={colors.surface.textSecondary} />
              <Text variant="caption" tone="secondary">
                {dateStr}
              </Text>
            </HStack>
            <Text
              variant="caption"
              style={{ fontWeight: '700', color: colors.brand[700] }}
            >
              {fmtRupee(order.pricePaise)}
            </Text>
          </HStack>
        </VStack>
      </Card>
    </Pressable>
  );
}

function SectionLabel({
  icon,
  label,
}: Readonly<{
  icon: React.ReactNode;
  label: string;
}>) {
  return (
    <HStack gap={2} align="center" style={{ marginBottom: spacing[2] }}>
      {icon}
      <Text
        variant="label"
        style={{ textTransform: 'uppercase', color: colors.surface.textSecondary }}
      >
        {label}
      </Text>
    </HStack>
  );
}

function SkeletonStrip() {
  return (
    <HStack gap={3} style={{ paddingBottom: spacing[1] }}>
      {[1, 2].map((k) => (
        <View key={k} style={styles.skeletonCard} />
      ))}
    </HStack>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function OrderDashboardSection() {
  const router = useRouter();
  const userId = useWalletStore((s) => s.userId);
  const earningsPaise = useWalletStore((s) => s.earningsPaise);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE}/api/mobile/orders?userId=${userId}&role=buyer&limit=50`
      );
      const data = await res.json();
      setOrders(data.items ?? []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  // ── KPI derivations ─────────────────────────────────────────────────────────
  const now = Date.now();

  const active = orders.filter((o) =>
    ['pending', 'confirmed', 'in_progress'].includes(o.status)
  );

  type ScheduledOrder = Order & { scheduledAt: string };
  const scheduled = orders.filter((o): o is ScheduledOrder =>
    o.scheduledAt !== null &&
    new Date(o.scheduledAt).getTime() > now &&
    ['pending', 'confirmed', 'in_progress'].includes(o.status)
  );

  const completed = orders.filter((o) => o.status === 'completed');

  // ── Strip lists ─────────────────────────────────────────────────────────────
  const upcomingOrders = [...active]
    .sort(
      (a, b) =>
        new Date(a.scheduledAt ?? a.createdAt).getTime() -
        new Date(b.scheduledAt ?? b.createdAt).getTime()
    )
    .slice(0, 5);

  const scheduledOrders = [...scheduled]
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() -
        new Date(b.scheduledAt).getTime()
    )
    .slice(0, 5);

  const navigate = (orderId: string) =>
    router.push(`/(marketplace)/order/${orderId}` as never);

  return (
    <Card padding={4} elevation="sm" style={styles.root}>
      {/* Header */}
      <HStack justify="between" align="center" style={{ marginBottom: spacing[4] }}>
        <HStack gap={2} align="center">
          <ShoppingBag size={18} color={colors.brand[700]} />
          <Text
            variant="body"
            style={{ fontWeight: '700', color: colors.surface.heading }}
          >
            My Orders
          </Text>
        </HStack>
        <Pressable
          onPress={() => router.push('/(marketplace)/orders' as never)}
          style={styles.seeAll}
          accessibilityRole="button"
        >
          <Text variant="caption" style={{ color: colors.brand[700], fontWeight: '600' }}>
            See All
          </Text>
          <ChevronRight size={14} color={colors.brand[700]} />
        </Pressable>
      </HStack>

      {/* ── KPI Strip ─────────────────────────────────────────────────────── */}
      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={colors.brand[600]} />
        </View>
      ) : (
        <View style={styles.kpiRow}>
          <KpiTile
            icon={<Zap size={16} color={colors.brand[700]} />}
            label="Active"
            value={String(active.length)}
            accent
          />
          <KpiTile
            icon={<Calendar size={16} color={colors.surface.textSecondary} />}
            label="Scheduled"
            value={String(scheduled.length)}
          />
          <KpiTile
            icon={<CheckCircle size={16} color={colors.semantic.success} />}
            label="Done"
            value={String(completed.length)}
          />
          <KpiTile
            icon={<IndianRupee size={16} color={colors.semantic.success} />}
            label="Earned"
            value={fmtRupee(earningsPaise)}
          />
        </View>
      )}

      {/* ── Upcoming ──────────────────────────────────────────────────────── */}
      {!loading && upcomingOrders.length > 0 && (
        <View style={{ marginTop: spacing[4] }}>
          <SectionLabel
            icon={<Zap size={13} color={colors.surface.textSecondary} />}
            label="Upcoming"
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hScroll}
          >
            {upcomingOrders.map((o) => (
              <OrderCard key={o.id} order={o} onPress={() => navigate(o.id)} />
            ))}
          </ScrollView>
        </View>
      )}

      {loading && upcomingOrders.length === 0 && (
        <View style={{ marginTop: spacing[4] }}>
          <SectionLabel
            icon={<Zap size={13} color={colors.surface.textSecondary} />}
            label="Upcoming"
          />
          <SkeletonStrip />
        </View>
      )}

      {!loading && upcomingOrders.length === 0 && (
        <View style={styles.emptyState}>
          <PackageCheck size={28} color={colors.surface.textSecondary} />
          <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
            No active orders right now.{'\n'}Browse services to get started!
          </Text>
        </View>
      )}

      {/* ── Scheduled ─────────────────────────────────────────────────────── */}
      {!loading && scheduledOrders.length > 0 && (
        <View style={{ marginTop: spacing[4] }}>
          <SectionLabel
            icon={<Calendar size={13} color={colors.surface.textSecondary} />}
            label="Scheduled"
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hScroll}
          >
            {scheduledOrders.map((o) => (
              <OrderCard key={o.id} order={o} onPress={() => navigate(o.id)} />
            ))}
          </ScrollView>
        </View>
      )}
    </Card>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { gap: 0 },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 2 },

  // KPI
  kpiRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  kpiTile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[1],
    borderRadius: radius.md,
    backgroundColor: colors.gray[50],
    gap: spacing[1],
  },
  kpiTileAccent: {
    backgroundColor: colors.brand[50],
  },
  kpiIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiIconAccent: {
    backgroundColor: colors.brand[100],
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  kpiLabel: {
    textAlign: 'center',
    fontSize: 10,
  },

  // Order cards
  orderCard: {
    width: 172,
  },
  orderTitle: {
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
    marginRight: spacing[2],
  },

  // Horizontal scroll
  hScroll: {
    gap: spacing[3],
    paddingBottom: spacing[1],
  },

  // Empty / loading
  emptyState: {
    marginTop: spacing[4],
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[4],
  },
  loadingRow: {
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonCard: {
    width: 172,
    height: 96,
    borderRadius: radius.md,
    backgroundColor: colors.gray[100],
  },
});
