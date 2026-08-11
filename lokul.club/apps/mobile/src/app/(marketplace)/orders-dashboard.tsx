// My Orders Dashboard — 2×2 KPI grid + tabbed order list
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  IndianRupee,
  PackageCheck,
  ShoppingBag,
  Zap,
} from 'lucide-react-native';
import { Badge, HStack, Text, VStack } from '@/components/ui';
import { useWalletStore } from '@/store/walletStore';
import { useBookingStore, type BookingStatus } from '@/store/bookingStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

// ── Types ─────────────────────────────────────────────────────────────────────

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

type Tab = 'upcoming' | 'scheduled' | 'completed' | 'all';

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

const TABS: { key: Tab; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'completed', label: 'Done' },
  { key: 'all', label: 'All' },
];

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

// ── Helpers ───────────────────────────────────────────────────────────────────

function Separator() {
  return <View style={s.separator} />;
}

function emptyMessage(t: Tab): string {
  if (t === 'upcoming') return 'No active orders right now.';
  if (t === 'scheduled') return 'No scheduled orders.';
  if (t === 'completed') return 'No completed orders yet.';
  return 'No orders yet.';
}

function fmtDate(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  });
}

function fmtRupee(paise: number) {
  const val = paise / 100;
  if (val >= 1000) return `\u20B9${(val / 1000).toFixed(1)}k`;
  return `\u20B9${val.toFixed(0)}`;
}

// ── KPI tile ──────────────────────────────────────────────────────────────────

function KpiTile(props: Readonly<{
  icon: React.ReactNode;
  label: string;
  value: string;
  subLabel?: string;
  accent?: boolean;
}>) {
  const { icon, label, value, subLabel, accent } = props;
  return (
    <View style={[s.kpiTile, accent && s.kpiTileAccent]}>
      <View style={[s.kpiIconBox, accent && s.kpiIconAccent]}>
        {icon}
      </View>
      <VStack gap={0.5} style={{ flex: 1 }}>
        <Text
          variant="h2"
          style={[s.kpiValue, { color: accent ? colors.brand[700] : colors.surface.heading }]}
        >
          {value}
        </Text>
        <Text variant="caption" tone="secondary">{label}</Text>
        {subLabel ? (
          <Text variant="caption" style={{ color: colors.semantic.success, fontWeight: '600', fontSize: 10 }}>
            {subLabel}
          </Text>
        ) : null}
      </VStack>
    </View>
  );
}

// ── Order list row ────────────────────────────────────────────────────────────

function OrderRow(props: Readonly<{ order: Order; onPress: () => void }>) {
  const { order, onPress } = props;
  const displayTitle = order.title ?? order.listing?.title ?? 'Order';
  const category = order.listing?.category ?? '';
  const dateLabel = order.scheduledAt
    ? `Scheduled: ${fmtDate(order.scheduledAt)}`
    : fmtDate(order.createdAt);

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {({ pressed }) => (
        <View style={[s.orderRow, pressed && { opacity: 0.75 }]}>
          <View style={s.orderIconBox}>
            <ShoppingBag size={18} color={colors.brand[600]} />
          </View>
          <VStack gap={1} style={{ flex: 1 }}>
            <Text variant="body" style={s.orderTitle} numberOfLines={1}>
              {displayTitle}
            </Text>
            <Text variant="caption" tone="secondary" numberOfLines={1}>
              {order.seller.name}{category ? ` \u00B7 ${category}` : ''}
            </Text>
            <HStack gap={1} align="center">
              <Clock size={11} color={colors.surface.textSecondary} />
              <Text variant="caption" tone="secondary">{dateLabel}</Text>
            </HStack>
          </VStack>
          <VStack gap={1.5} align="end">
            <Text variant="body" style={s.price}>{fmtRupee(order.pricePaise)}</Text>
            <Badge
              label={STATUS_LABEL[order.status]}
              tone={STATUS_TONE[order.status]}
              size="sm"
            />
          </VStack>
          <ChevronRight size={16} color={colors.surface.textSecondary} style={{ marginLeft: spacing[1] }} />
        </View>
      )}
    </Pressable>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function OrdersDashboardScreen() {
  const router = useRouter();
  const userId = useWalletStore((s) => s.userId);
  const earningsPaise = useWalletStore((s) => s.earningsPaise);
  const bookings = useBookingStore((s) => s.bookings);

  const BOOKING_LABEL: Partial<Record<BookingStatus, string>> = {
    requested: 'Requested',
    confirmed: 'Confirmed',
    checked_in: 'Checked in',
    accepted: 'Accepted',
    on_the_way: 'On the way',
    arrived: 'Arrived',
    quote_pending: 'Approve quote',
    in_progress: 'In progress',
    work_done: 'Confirm & pay',
    visit_scheduled: 'Visit scheduled',
    visit_done: 'Quote coming',
    quote_shared: 'Quote ready',
    quote_accepted: 'Pay advance',
    scheduled: 'Scheduled',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  const bookingTone = (st: BookingStatus): 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info' => {
    if (st === 'completed') return 'success';
    if (st === 'cancelled') return 'danger';
    if (['quote_pending', 'quote_shared', 'quote_accepted', 'work_done'].includes(st)) return 'warning';
    if (st === 'requested' || st === 'visit_scheduled') return 'neutral';
    return 'brand';
  };
  const activeBookings = bookings.filter((b) => !['completed', 'cancelled'].includes(b.status));

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>('upcoming');

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

  useEffect(() => { load(); }, [load]);

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

  const listData: Order[] = (() => {
    if (tab === 'upcoming') {
      return [...active].sort(
        (a, b) =>
          new Date(a.scheduledAt ?? a.createdAt).getTime() -
          new Date(b.scheduledAt ?? b.createdAt).getTime()
      );
    }
    if (tab === 'scheduled') {
      return [...scheduled].sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      );
    }
    if (tab === 'completed') return completed;
    return [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  })();

  const navigate = (orderId: string) =>
    router.push(`/(marketplace)/order/${orderId}` as never);

  const ListHeader = (
    <View style={s.listHeader}>
      {/* Service bookings — appointments, home visits & projects */}
      {bookings.length > 0 && (
        <View style={s.bookingsSection}>
          <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
            Appointments & Bookings
          </Text>
          {bookings.slice(0, 6).map((b) => (
            <Pressable
              key={b.id}
              style={s.bookingRow}
              onPress={() => router.push({ pathname: '/(marketplace)/booking/[id]', params: { id: b.id } } as never)}
              accessibilityRole="button"
              accessibilityLabel={`Booking with ${b.merchantName}`}
            >
              <VStack gap={0.5} style={{ flex: 1 }}>
                <Text variant="body" style={{ fontWeight: '600', color: colors.surface.heading }} numberOfLines={1}>
                  {b.merchantName}
                </Text>
                <Text variant="caption" tone="secondary" numberOfLines={1}>
                  {b.services[0]?.name}{b.services.length > 1 ? ` +${b.services.length - 1}` : ''} · {b.date} · {b.slotLabel}
                </Text>
              </VStack>
              <Badge label={BOOKING_LABEL[b.status] ?? b.status} tone={bookingTone(b.status)} />
              <ChevronRight size={16} color={colors.surface.textSecondary} />
            </Pressable>
          ))}
        </View>
      )}

      {loading ? (
        <View style={s.loadingBox}>
          <ActivityIndicator size="small" color={colors.brand[600]} />
        </View>
      ) : (
        <View style={s.kpiGrid}>
          <KpiTile
            icon={<Zap size={20} color={colors.brand[700]} />}
            label="Active orders"
            value={String(active.length + activeBookings.length)}
            subLabel={active.length + activeBookings.length > 0 ? 'In progress' : undefined}
            accent
          />
          <KpiTile
            icon={<Calendar size={20} color={colors.brand[500]} />}
            label="Scheduled"
            value={String(scheduled.length)}
          />
          <KpiTile
            icon={<CheckCircle size={20} color={colors.semantic.success} />}
            label="Completed"
            value={String(completed.length)}
          />
          <KpiTile
            icon={<IndianRupee size={20} color={colors.semantic.success} />}
            label="Total earned"
            value={fmtRupee(earningsPaise)}
          />
        </View>
      )}

      <View style={s.tabs}>
        {TABS.map((t) => (
          <Pressable
            key={t.key}
            style={[s.tabBtn, tab === t.key && s.tabBtnActive]}
            onPress={() => setTab(t.key)}
            accessibilityRole="tab"
          >
            <Text
              variant="caption"
              style={[s.tabLabel, tab === t.key && s.tabLabelActive]}
            >
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <HStack gap={3} align="center" style={s.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={s.backBtn}
          accessibilityRole="button"
        >
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <HStack gap={2} align="center" style={{ flex: 1 }}>
          <ShoppingBag size={18} color={colors.brand[700]} />
          <Text variant="h3" style={{ color: colors.surface.heading }}>
            My Orders
          </Text>
        </HStack>
      </HStack>

      <FlatList
        data={listData}
        keyExtractor={(o) => o.id}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={s.flatContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={Separator}
        renderItem={({ item }) => (
          <OrderRow order={item} onPress={() => navigate(item.id)} />
        )}
        ListEmptyComponent={
          loading ? null : (
            <View style={s.emptyState}>
              <PackageCheck size={40} color={colors.surface.textSecondary} />
              <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
                {emptyMessage(tab)}
              </Text>
              <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
                Browse services to place your first order!
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.surfaceMuted },

  topBar: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.surface.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },

  flatContent: { paddingBottom: spacing[16] },
  listHeader: { backgroundColor: colors.surface.surfaceMuted, paddingBottom: spacing[2] },
  bookingsSection: {
    marginHorizontal: spacing[4],
    marginTop: spacing[4],
    padding: spacing[4],
    backgroundColor: colors.surface.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.surface.border,
    gap: spacing[2.5],
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.surface.border,
  },

  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    padding: spacing[4],
  },
  kpiTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    width: '47%',
    backgroundColor: colors.surface.background,
    borderRadius: radius.lg,
    padding: spacing[4],
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  kpiTileAccent: {
    backgroundColor: colors.brand[50],
    borderWidth: 1,
    borderColor: colors.brand[100],
  },
  kpiIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiIconAccent: { backgroundColor: colors.brand[100] },
  kpiValue: { fontSize: 22, fontWeight: '700', lineHeight: 26 },

  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
    gap: spacing[2],
  },
  tabBtn: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: radius.full,
    backgroundColor: colors.gray[100],
  },
  tabBtnActive: { backgroundColor: colors.brand[600] },
  tabLabel: { fontWeight: '600', color: colors.surface.textSecondary },
  tabLabelActive: { color: '#fff' },

  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.surface.background,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
  },
  orderIconBox: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderTitle: { fontWeight: '700', color: colors.surface.heading },
  price: { fontWeight: '700', color: colors.brand[700], fontSize: 15 },
  separator: {
    height: 1,
    backgroundColor: colors.surface.border,
    marginLeft: spacing[4] + 42 + spacing[3],
  },

  emptyState: {
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[12],
    paddingHorizontal: spacing[8],
  },
  loadingBox: { height: 160, alignItems: 'center', justifyContent: 'center' },
});
