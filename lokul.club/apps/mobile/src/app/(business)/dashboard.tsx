// PRD §06 — Business dashboard (storefront owner view — all merchant types)
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle,
  ChefHat,
  ClipboardList,
  Eye,
  Megaphone,
  Package,
  PenSquare,
  Plus,
  Send,
  Settings,
  ShoppingBag,
  Star,
  Store,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react-native';
import { Badge, Button, Card, HStack, Text, VStack } from '@/components/ui';
import { useBusinessStore, BIZ_CATEGORY_META, type MerchantType } from '@/store/businessStore';
import { useAppointmentStore } from '@/store/appointmentStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';
import { useServiceRequestStore } from '@/store/serviceRequestStore';
import {
  BIZ_ORDERS, BIZ_POSTS, CATALOGUE, FOOD_MENU, FOOD_ORDERS, EDU_BATCHES, STUDENT_FEES,
  type BizOrder, type FoodOrder,
  type EducationBatch, type StudentFee, type BizPost,
} from '@/data/business-seed';
import { colors, radius, spacing } from '@lokul/ui-tokens';

type Tab =
  | 'overview' | 'catalogue' | 'orders' | 'menu' | 'kitchen'
  | 'services' | 'bookings' | 'requests' | 'quotes' | 'batches' | 'fees'
  | 'offers' | 'posts' | 'promote';

const TABS_BY_TYPE: Record<MerchantType, Tab[]> = {
  retail:      ['overview', 'catalogue', 'orders', 'offers', 'posts', 'promote'],
  food:        ['overview', 'menu', 'kitchen', 'offers', 'posts', 'promote'],
  appointment: ['overview', 'services', 'bookings', 'quotes', 'offers', 'posts', 'promote'],
  services:    ['overview', 'services', 'requests', 'quotes', 'offers', 'posts', 'promote'],
  education:   ['overview', 'batches', 'fees', 'offers', 'posts', 'promote'],
};

const TAB_LABELS: Record<Tab, string> = {
  overview: 'Overview', catalogue: 'Catalogue', orders: 'Orders',
  menu: 'Menu', kitchen: 'Kitchen', services: 'Services',
  bookings: 'Bookings', requests: 'Requests', quotes: 'Quotes',
  batches: 'Batches', fees: 'Fees', offers: 'Offers', posts: 'Posts', promote: 'Promote',
};

export default function BusinessDashboard() {
  const router  = useRouter();
  const userId  = useWalletStore((s) => s.userId);
  const pinCode = useOnboardingStore((s) => s.pin);
  // Try API first; fall back to local store if not onboarded yet
  const localBiz = useBusinessStore((s) => s.myBusiness);
  const [apiBiz,   setApiBiz]   = useState<typeof localBiz | null>(null);
  const [loadingBiz, setLoadingBiz] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');

  const loadBiz = useCallback(async () => {
    if (!userId) { setLoadingBiz(false); return; }
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res  = await fetch(`${BASE}/api/mobile/merchants?userId=${userId}`, { signal: ctrl.signal });
      const data = await res.json();
      const list = Array.isArray(data?.merchants) ? data.merchants : [];
      const first = list[0];
      if (first) setApiBiz(first as any);
    } catch {
      Alert.alert('Could not load your business', 'Showing your last saved storefront data instead.');
    } finally { clearTimeout(to); setLoadingBiz(false); }
  }, [userId]);

  useEffect(() => { loadBiz(); }, [loadBiz]);

  const biz = apiBiz ?? localBiz;

  if (!biz) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.empty}>
          <Store size={48} color={colors.brand[600]} />
          <Text variant="h2" style={{ fontWeight: '700', textAlign: 'center' }}>No business yet</Text>
          <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
            Register your kirana, salon, clinic or school in under a minute.
          </Text>
          <View style={{ width: '100%', marginTop: spacing[4] }}>
            <Button label="Register business" onPress={() => router.replace('/(business)/onboard')} fullWidth />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const meta = BIZ_CATEGORY_META[biz.category];
  const merchantType: MerchantType = biz.merchantType ?? 'retail';
  const tabs = TABS_BY_TYPE[merchantType];

  function handleTabChange(t: Tab) {
    setTab(t);
  }

  function handleQuickAction(action: 'post' | 'add' | 'boost' | 'analytics') {
    if (action === 'post') { setTab('posts'); return; }
    if (action === 'boost') { setTab('promote'); return; }
    if (action === 'analytics') { router.push('/(merchant)/analytics' as never); return; }
    const addTab: Record<MerchantType, Tab> = {
      retail: 'catalogue', food: 'menu', appointment: 'services', services: 'services', education: 'batches',
    };
    setTab(addTab[merchantType]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>My Storefront</Text>
        <Pressable onPress={() => router.push('/(business)/edit')} hitSlop={10} style={styles.iconBtn}>
          <Settings size={20} color={colors.surface.heading} />
        </Pressable>
      </View>

      <View style={[styles.banner, { backgroundColor: meta.tint + '15' }]}>
        <HStack gap={3} align="center">
          <View style={[styles.logo, { backgroundColor: meta.tint }]}>
            <Text style={{ fontSize: 28 }}>{meta.emoji}</Text>
          </View>
          <VStack gap={1} style={{ flex: 1 }}>
            <Text variant="h3" style={{ fontWeight: '800' }}>{biz.name}</Text>
            <HStack gap={2} align="center">
              <Text variant="caption" tone="secondary">{meta.label}</Text>
              <Badge
                label={biz.subscriptionTier === 'pro' ? 'PRO' : 'FREE'}
                tone={biz.subscriptionTier === 'pro' ? 'brand' : 'neutral'}
              />
              <Badge label="OPEN" tone="success" />
            </HStack>
            <HStack gap={1} align="center">
              <Star size={12} color="#F59E0B" fill="#F59E0B" />
              <Text variant="caption" style={{ fontWeight: '700' }}>
                {biz.rating > 0 ? biz.rating.toFixed(1) : 'New'}
              </Text>
              <Text variant="caption" tone="secondary">· {biz.reviewCount} reviews</Text>
            </HStack>
          </VStack>
        </HStack>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabs}
        contentContainerStyle={{ paddingHorizontal: spacing[3], gap: spacing[2] }}
      >
        {tabs.map((t) => (
          <Pressable key={t} onPress={() => handleTabChange(t)} style={[styles.tab, tab === t && styles.tabActive]}>
            <Text
              variant="caption"
              style={{
                color: tab === t ? colors.brand[700] : colors.surface.textSecondary,
                fontWeight: '700',
              }}
            >
              {TAB_LABELS[t]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scroll}>
        {tab === 'overview' && <Overview merchantType={merchantType} onQuickAction={handleQuickAction} />}
        {tab === 'catalogue' && <Catalogue merchantId={biz.id ?? ''} />}
        {tab === 'orders' && <Orders />}
        {tab === 'menu' && <FoodMenu merchantId={biz.id ?? ''} />}
        {tab === 'kitchen' && <FoodKitchen />}
        {tab === 'services' && merchantType === 'appointment' && <ApptServices />}
        {tab === 'services' && merchantType === 'services' && <SvcOffered />}
        {tab === 'bookings' && <ApptBookings />}
        {tab === 'requests' && <SvcRequests />}
        {tab === 'quotes' && <ApiQuotes merchantId={biz.id ?? ''} />}
        {tab === 'batches' && <EduBatches />}
        {tab === 'fees' && <EduFees />}
        {tab === 'offers' && <Offers merchantId={biz.id ?? ''} />}
        {tab === 'posts' && <Posts />}
        {tab === 'promote' && (
          <Promote pro={biz.subscriptionTier === 'pro'} bizId={biz.id ?? ''} bizName={biz.name} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Overview (type-aware KPIs) ───────────────────────────────────────────────

function Overview({
  merchantType, onQuickAction,
}: {
  readonly merchantType: MerchantType;
  readonly onQuickAction: (action: 'post' | 'add' | 'boost' | 'analytics') => void;
}) {
  const appointments = useAppointmentStore((s) => s.appointments);
  const apptServices = useAppointmentStore((s) => s.services);
  const requests = useServiceRequestStore((s) => s.requests);
  const offeredSvcs = useServiceRequestStore((s) => s.offeredServices);
  const reach = BIZ_POSTS.reduce((s, p) => s + p.reachViews, 0);

  let kpi1Label = ''; let kpi1Val = 0; let kpi1Icon: any = ShoppingBag; let kpi1Tint = '#F97316';
  let kpi2Label = ''; let kpi2Val = 0; let kpi2Icon: any = TrendingUp; let kpi2Tint = '#10B981';
  let kpi3Label = ''; let kpi3Val = 0; let kpi3Icon: any = Package; let kpi3Tint = '#A855F7';

  if (merchantType === 'retail') {
    kpi1Label = 'New orders'; kpi1Val = BIZ_ORDERS.filter((o) => o.status === 'new').length; kpi1Icon = ShoppingBag; kpi1Tint = '#F97316';
    kpi2Label = 'Today revenue'; kpi2Val = BIZ_ORDERS.reduce((s, o) => s + o.totalRupees, 0); kpi2Icon = TrendingUp; kpi2Tint = '#10B981';
    kpi3Label = 'Catalogue'; kpi3Val = CATALOGUE.length; kpi3Icon = Package; kpi3Tint = '#A855F7';
  } else if (merchantType === 'food') {
    kpi1Label = 'New orders'; kpi1Val = FOOD_ORDERS.filter((o) => o.status === 'new').length; kpi1Icon = ChefHat; kpi1Tint = '#F97316';
    kpi2Label = 'Preparing'; kpi2Val = FOOD_ORDERS.filter((o) => o.status === 'preparing').length; kpi2Icon = TrendingUp; kpi2Tint = '#0EA5E9';
    kpi3Label = 'Menu items'; kpi3Val = FOOD_MENU.length; kpi3Icon = BookOpen; kpi3Tint = '#A855F7';
  } else if (merchantType === 'appointment') {
    const today = new Date().toISOString().slice(0, 10);
    kpi1Label = 'Today'; kpi1Val = appointments.filter((a) => a.date === today).length; kpi1Icon = Calendar; kpi1Tint = '#F97316';
    kpi2Label = 'Upcoming'; kpi2Val = appointments.filter((a) => a.date > today && a.status === 'confirmed').length; kpi2Icon = Users; kpi2Tint = '#10B981';
    kpi3Label = 'Services'; kpi3Val = apptServices.length; kpi3Icon = Package; kpi3Tint = '#A855F7';
  } else if (merchantType === 'services') {
    kpi1Label = 'Pending quotes'; kpi1Val = requests.filter((r) => r.status === 'pending').length; kpi1Icon = ClipboardList; kpi1Tint = '#F97316';
    kpi2Label = 'In progress'; kpi2Val = requests.filter((r) => r.status === 'in_progress').length; kpi2Icon = TrendingUp; kpi2Tint = '#0EA5E9';
    kpi3Label = 'Services'; kpi3Val = offeredSvcs.length; kpi3Icon = Package; kpi3Tint = '#A855F7';
  } else {
    kpi1Label = 'Active batches'; kpi1Val = EDU_BATCHES.filter((b) => b.active).length; kpi1Icon = BookOpen; kpi1Tint = '#F97316';
    kpi2Label = 'Students'; kpi2Val = EDU_BATCHES.reduce((s, b) => s + b.students, 0); kpi2Icon = Users; kpi2Tint = '#10B981';
    kpi3Label = 'Fees due'; kpi3Val = STUDENT_FEES.filter((f) => !f.paid).length; kpi3Icon = ClipboardList; kpi3Tint = '#EF4444';
  }

  return (
    <VStack gap={3}>
      <View style={styles.kpiGrid}>
        <KPI label={kpi1Label} value={kpi1Val} Icon={kpi1Icon} tint={kpi1Tint} />
        <KPI label={kpi2Label} value={kpi2Val} Icon={kpi2Icon} tint={kpi2Tint} />
        <KPI label={kpi3Label} value={kpi3Val} Icon={kpi3Icon} tint={kpi3Tint} />
        <KPI label="Post reach" value={reach} Icon={Eye} tint="#0EA5E9" />
      </View>
      <Card padding={4} elevation="xs" bordered>
        <Text variant="caption" style={{ fontWeight: '700', color: colors.surface.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6 }}>
          Quick actions
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginTop: spacing[2.5] }}>
          <QuickAction Icon={PenSquare} label="Post update" onPress={() => onQuickAction('post')} />
          <QuickAction Icon={Plus} label="Add item" onPress={() => onQuickAction('add')} />
          <QuickAction Icon={Megaphone} label="Boost reach" onPress={() => onQuickAction('boost')} />
          <QuickAction Icon={BarChart3} label="Analytics" onPress={() => onQuickAction('analytics')} />
        </View>
      </Card>
    </VStack>
  );
}

function KPI({ label, value, Icon, tint }: { readonly label: string; readonly value: number; readonly Icon: any; readonly tint: string }) {
  return (
    <View style={[styles.kpi, { borderColor: tint + '33' }]}>
      <HStack gap={2} align="center" style={{ justifyContent: 'space-between' }}>
        <Text variant="caption" tone="secondary">{label}</Text>
        <Icon size={16} color={tint} />
      </HStack>
      <Text variant="h2" style={{ color: tint, fontWeight: '800', marginTop: 4 }}>
        {value.toLocaleString('en-IN')}
      </Text>
    </View>
  );
}

function QuickAction({ Icon, label, onPress }: { readonly Icon: any; readonly label: string; readonly onPress: () => void }) {
  return (
    <Pressable style={styles.qa} onPress={onPress}>
      <View style={styles.qaInner}>
        <Icon size={16} color={colors.brand[700]} />
        <Text variant="caption" style={{ fontWeight: '600', color: colors.brand[700] }}>{label}</Text>
      </View>
    </Pressable>
  );
}

// ─── Retail ───────────────────────────────────────────────────────────────────

type ApiCatalogItem = {
  id: string; name: string; pricePaise: number; unit?: string | null; isAvailable: boolean;
};

function Catalogue({ merchantId }: { readonly merchantId: string }) {
  const [items, setItems] = useState<ApiCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!merchantId) { setLoading(false); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/api/mobile/merchants/${merchantId}/catalog?kind=product`);
      const data = await res.json();
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch { setItems([]); } finally { setLoading(false); }
  }, [merchantId]);

  useEffect(() => { load(); }, [load]);

  async function toggle(id: string, isAvailable: boolean) {
    setItems((a) => a.map((i) => (i.id === id ? { ...i, isAvailable: !isAvailable } : i)));
    try {
      await fetch(`${BASE}/api/mobile/merchants/${merchantId}/catalog/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !isAvailable }),
      });
    } catch { /* optimistic update stands; next reload reconciles */ }
  }

  async function addItem() {
    if (!newName.trim() || !newPrice || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/merchants/${merchantId}/catalog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'product',
          name: newName.trim(),
          pricePaise: Math.round((parseFloat(newPrice) || 0) * 100),
        }),
      });
      if (!res.ok) throw new Error('create failed');
      setNewName(''); setNewPrice(''); setAdding(false);
      await load();
    } catch {
      Alert.alert('Error', 'Could not save this item — please try again.');
    } finally { setSaving(false); }
  }

  if (loading) return <ActivityIndicator style={{ marginTop: spacing[6] }} />;

  return (
    <VStack gap={3}>
      <Button label={adding ? 'Cancel' : '+ Add catalogue item'} variant="secondary" onPress={() => setAdding((v) => !v)} fullWidth />
      {adding && (
        <Card padding={3.5} elevation="none" bordered>
          <VStack gap={2}>
            <TextInput value={newName} onChangeText={setNewName} placeholder="Item name" style={styles.quoteInput} />
            <HStack gap={2}>
              <TextInput value={newPrice} onChangeText={setNewPrice} keyboardType="numeric" placeholder="Price (Rs)" style={[styles.quoteInput, { flex: 1 }]} />
              <Pressable style={styles.sendBtn} onPress={addItem} disabled={saving}>
                <View style={styles.sendBtnInner}>
                  <Text variant="caption" style={{ color: '#fff', fontWeight: '700' }}>{saving ? 'Saving…' : 'Save'}</Text>
                </View>
              </Pressable>
            </HStack>
          </VStack>
        </Card>
      )}
      {items.length === 0 && !adding && (
        <View style={styles.emptySection}>
          <Package size={32} color={colors.surface.textSecondary} />
          <Text variant="body" tone="secondary">No catalogue items yet</Text>
        </View>
      )}
      {items.map((i) => (
        <Card key={i.id} padding={3.5} elevation="none" bordered>
          <HStack gap={3} align="center">
            <View style={styles.thumb}>
              <Package size={20} color={colors.brand[700]} />
            </View>
            <VStack gap={0.5} style={{ flex: 1 }}>
              <Text variant="body" style={{ fontWeight: '700' }} numberOfLines={1}>{i.name}</Text>
              <Text variant="caption" style={{ fontWeight: '700', color: colors.brand[700] }}>Rs {Math.round(i.pricePaise / 100)}{i.unit ? ` / ${i.unit}` : ''}</Text>
            </VStack>
            <Switch
              value={i.isAvailable}
              onValueChange={() => toggle(i.id, i.isAvailable)}
              trackColor={{ true: colors.brand[600], false: colors.gray[300] }}
            />
          </HStack>
        </Card>
      ))}
    </VStack>
  );
}

function Orders() {
  const [orders, setOrders] = useState<BizOrder[]>(BIZ_ORDERS);
  const statusTones: Record<BizOrder['status'], 'warning' | 'info' | 'brand' | 'success' | 'neutral'> = {
    new: 'warning', packing: 'info', out_for_delivery: 'brand', delivered: 'success', cancelled: 'neutral',
  };
  const nextStatus: Partial<Record<BizOrder['status'], BizOrder['status']>> = {
    new: 'packing', packing: 'out_for_delivery', out_for_delivery: 'delivered',
  };
  function advance(id: string) {
    setOrders((prev) => prev.map((o) => {
      if (o.id !== id) return o;
      const next = nextStatus[o.status];
      if (!next) return o;
      return { ...o, status: next };
    }));
  }
  return (
    <VStack gap={3}>
      {orders.map((o) => (
        <Card key={o.id} padding={4} elevation="xs" bordered>
          <HStack gap={2} align="center" style={{ justifyContent: 'space-between' }}>
            <VStack gap={0.5}>
              <Text variant="body" style={{ fontWeight: '700' }}>{o.customerName}</Text>
              <Text variant="caption" tone="secondary">{o.customerFlat} · #{o.id.toUpperCase()} · {o.payment === 'paid' ? 'Paid' : 'COD'}</Text>
            </VStack>
            <Badge label={o.status.replace(/_/g, ' ').toUpperCase()} tone={statusTones[o.status]} />
          </HStack>
          <View style={styles.itemsBox}>
            {o.items.map((it, i) => (
              <HStack key={i} gap={2} align="center" style={{ justifyContent: 'space-between' }}>
                <Text variant="caption">{it.qty} x {it.name}</Text>
                <Text variant="caption" style={{ fontWeight: '600' }}>Rs {it.qty * it.priceRupees}</Text>
              </HStack>
            ))}
          </View>
          <HStack gap={2} align="center" style={{ marginTop: spacing[2], justifyContent: 'space-between' }}>
            <Text variant="caption" tone="secondary">{Math.round((Date.now() - o.placedAt) / 60_000)}m ago</Text>
            <Text variant="body" style={{ fontWeight: '800', color: colors.brand[700] }}>Rs {o.totalRupees}</Text>
          </HStack>
          {!!nextStatus[o.status] && (
            <View style={{ marginTop: spacing[2] }}>
              <Button
                label={"Advance to " + (nextStatus[o.status] ?? '').replace(/_/g, ' ')}
                variant="secondary"
                onPress={() => advance(o.id)}
                fullWidth
              />
            </View>
          )}
        </Card>
      ))}
    </VStack>
  );
}

// ─── Food ─────────────────────────────────────────────────────────────────────

function FoodMenu({ merchantId }: { readonly merchantId: string }) {
  const [items, setItems] = useState<ApiCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!merchantId) { setLoading(false); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/api/mobile/merchants/${merchantId}/catalog?kind=menu_item`);
      const data = await res.json();
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch { setItems([]); } finally { setLoading(false); }
  }, [merchantId]);

  useEffect(() => { load(); }, [load]);

  async function toggle(id: string, isAvailable: boolean) {
    setItems((a) => a.map((i) => (i.id === id ? { ...i, isAvailable: !isAvailable } : i)));
    try {
      await fetch(`${BASE}/api/mobile/merchants/${merchantId}/catalog/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !isAvailable }),
      });
    } catch { /* optimistic update stands; next reload reconciles */ }
  }

  async function addItem() {
    if (!newName.trim() || !newPrice || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/merchants/${merchantId}/catalog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'menu_item',
          name: newName.trim(),
          pricePaise: Math.round((parseFloat(newPrice) || 0) * 100),
          attributes: { isVeg: true },
        }),
      });
      if (!res.ok) throw new Error('create failed');
      setNewName(''); setNewPrice(''); setAdding(false);
      await load();
    } catch {
      Alert.alert('Error', 'Could not save this item — please try again.');
    } finally { setSaving(false); }
  }

  if (loading) return <ActivityIndicator style={{ marginTop: spacing[6] }} />;

  return (
    <VStack gap={3}>
      <Button label={adding ? 'Cancel' : '+ Add menu item'} variant="secondary" onPress={() => setAdding((v) => !v)} fullWidth />
      {adding && (
        <Card padding={3.5} elevation="none" bordered>
          <VStack gap={2}>
            <TextInput value={newName} onChangeText={setNewName} placeholder="Item name" style={styles.quoteInput} />
            <HStack gap={2}>
              <TextInput value={newPrice} onChangeText={setNewPrice} keyboardType="numeric" placeholder="Price (Rs)" style={[styles.quoteInput, { flex: 1 }]} />
              <Pressable style={styles.sendBtn} onPress={addItem} disabled={saving}>
                <View style={styles.sendBtnInner}>
                  <Text variant="caption" style={{ color: '#fff', fontWeight: '700' }}>{saving ? 'Saving…' : 'Save'}</Text>
                </View>
              </Pressable>
            </HStack>
          </VStack>
        </Card>
      )}
      {items.length === 0 && !adding && (
        <View style={styles.emptySection}>
          <BookOpen size={32} color={colors.surface.textSecondary} />
          <Text variant="body" tone="secondary">No menu items yet</Text>
        </View>
      )}
      {items.map((i) => (
        <Card key={i.id} padding={3.5} elevation="none" bordered>
          <HStack gap={3} align="center">
            <VStack gap={0.5} style={{ flex: 1 }}>
              <Text variant="body" style={{ fontWeight: '700' }} numberOfLines={1}>{i.name}</Text>
              <Text variant="caption" style={{ fontWeight: '700', color: colors.brand[700] }}>Rs {Math.round(i.pricePaise / 100)}</Text>
            </VStack>
            <Switch
              value={i.isAvailable}
              onValueChange={() => toggle(i.id, i.isAvailable)}
              trackColor={{ true: colors.brand[600], false: colors.gray[300] }}
            />
          </HStack>
        </Card>
      ))}
    </VStack>
  );
}

function FoodKitchen() {
  const [orders, setOrders] = useState<FoodOrder[]>(FOOD_ORDERS);
  const statusTones: Record<FoodOrder['status'], 'warning' | 'info' | 'brand' | 'success' | 'neutral'> = {
    new: 'warning', preparing: 'info', ready: 'brand', out_for_delivery: 'neutral', delivered: 'success',
  };
  const nextStatus: Partial<Record<FoodOrder['status'], FoodOrder['status']>> = {
    new: 'preparing', preparing: 'ready', ready: 'out_for_delivery', out_for_delivery: 'delivered',
  };
  function advance(id: string) {
    setOrders((prev) => prev.map((o) => {
      if (o.id !== id) return o;
      const next = nextStatus[o.status];
      if (!next) return o;
      return { ...o, status: next };
    }));
  }
  return (
    <VStack gap={3}>
      {orders.map((o) => (
        <Card key={o.id} padding={4} elevation="xs" bordered>
          <HStack gap={2} align="center" style={{ justifyContent: 'space-between' }}>
            <VStack gap={0.5}>
              <Text variant="body" style={{ fontWeight: '700' }}>{o.customerName}</Text>
              <Text variant="caption" tone="secondary">{o.customerFlat} · {o.orderType.toUpperCase()}</Text>
            </VStack>
            <Badge label={o.status.replace(/_/g, ' ').toUpperCase()} tone={statusTones[o.status]} />
          </HStack>
          <View style={styles.itemsBox}>
            {o.items.map((it, i) => (
              <Text key={i} variant="caption">{it.qty} x {it.name}</Text>
            ))}
          </View>
          <HStack gap={2} align="center" style={{ marginTop: spacing[2], justifyContent: 'space-between' }}>
            <Text variant="caption" tone="secondary">{Math.round((Date.now() - o.placedAt) / 60_000)}m ago · {o.payment === 'paid' ? 'Paid' : 'COD'}</Text>
            <Text variant="body" style={{ fontWeight: '800', color: colors.brand[700] }}>Rs {o.totalRupees}</Text>
          </HStack>
          {!!nextStatus[o.status] && (
            <View style={{ marginTop: spacing[2] }}>
              <Button
                label={"Mark " + (nextStatus[o.status] ?? '').replace(/_/g, ' ')}
                variant="secondary"
                onPress={() => advance(o.id)}
                fullWidth
              />
            </View>
          )}
        </Card>
      ))}
    </VStack>
  );
}

// ─── Appointment ──────────────────────────────────────────────────────────────

function ApptServices() {
  const services = useAppointmentStore((s) => s.services);
  const toggle = useAppointmentStore((s) => s.toggleService);
  const addService = useAppointmentStore((s) => s.addService);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');

  function saveService() {
    if (!newName.trim() || !newPrice) return;
    addService({ name: newName.trim(), durationMins: 30, priceRupees: Math.round(parseFloat(newPrice)) || 0, available: true });
    setNewName(''); setNewPrice(''); setAdding(false);
  }

  return (
    <VStack gap={3}>
      <Button label={adding ? 'Cancel' : '+ Add service'} variant="secondary" onPress={() => setAdding((v) => !v)} fullWidth />
      {adding && (
        <Card padding={3.5} elevation="none" bordered>
          <VStack gap={2}>
            <TextInput value={newName} onChangeText={setNewName} placeholder="Service name" style={styles.quoteInput} />
            <HStack gap={2}>
              <TextInput value={newPrice} onChangeText={setNewPrice} keyboardType="numeric" placeholder="Price (Rs)" style={[styles.quoteInput, { flex: 1 }]} />
              <Pressable style={styles.sendBtn} onPress={saveService}>
                <View style={styles.sendBtnInner}>
                  <Text variant="caption" style={{ color: '#fff', fontWeight: '700' }}>Save</Text>
                </View>
              </Pressable>
            </HStack>
          </VStack>
        </Card>
      )}
      {services.map((svc) => (
        <Card key={svc.id} padding={3.5} elevation="none" bordered>
          <HStack gap={3} align="center">
            <VStack gap={0.5} style={{ flex: 1 }}>
              <Text variant="body" style={{ fontWeight: '700' }}>{svc.name}</Text>
              <HStack gap={2}>
                <Text variant="caption" style={{ fontWeight: '700', color: colors.brand[700] }}>Rs {svc.priceRupees}</Text>
                <Text variant="caption" tone="secondary">· {svc.durationMins} min</Text>
              </HStack>
            </VStack>
            <Switch
              value={svc.available}
              onValueChange={() => toggle(svc.id)}
              trackColor={{ true: colors.brand[600], false: colors.gray[300] }}
            />
          </HStack>
        </Card>
      ))}
    </VStack>
  );
}

function ApptBookings() {
  const appointments = useAppointmentStore((s) => s.appointments);
  const updateStatus = useAppointmentStore((s) => s.updateStatus);
  const today = new Date().toISOString().slice(0, 10);
  const todayAppts = appointments.filter((a) => a.date === today);
  const upcoming = appointments.filter((a) => a.date > today);
  const statusTones: Record<string, 'success' | 'neutral' | 'warning' | 'brand'> = {
    confirmed: 'brand', completed: 'success', cancelled: 'neutral', no_show: 'warning',
  };
  return (
    <VStack gap={4}>
      {todayAppts.length > 0 && (
        <VStack gap={2}>
          <Text variant="caption" style={{ fontWeight: '700', textTransform: 'uppercase', color: colors.surface.textSecondary, letterSpacing: 0.7 }}>Today</Text>
          {todayAppts.map((a) => (
            <Card key={a.id} padding={3.5} elevation="none" bordered>
              <HStack gap={3} align="center">
                <VStack gap={0.5} style={{ flex: 1 }}>
                  <Text variant="body" style={{ fontWeight: '700' }}>{a.customerName}</Text>
                  <Text variant="caption" tone="secondary">{a.serviceName} · {a.time} · Flat {a.customerFlat}</Text>
                </VStack>
                <VStack gap={1} align="end">
                  <Badge label={a.status.toUpperCase()} tone={statusTones[a.status] ?? 'neutral'} />
                  <Text variant="caption" style={{ fontWeight: '700', color: colors.brand[700] }}>Rs {a.feeRupees}</Text>
                </VStack>
              </HStack>
              {a.status === 'confirmed' && (
                <View style={{ marginTop: spacing[2] }}>
                  <Button
                    label="Mark completed"
                    variant="secondary"
                    onPress={() => updateStatus(a.id, 'completed')}
                    fullWidth
                  />
                </View>
              )}
            </Card>
          ))}
        </VStack>
      )}
      {upcoming.length > 0 && (
        <VStack gap={2}>
          <Text variant="caption" style={{ fontWeight: '700', textTransform: 'uppercase', color: colors.surface.textSecondary, letterSpacing: 0.7 }}>Upcoming</Text>
          {upcoming.map((a) => (
            <Card key={a.id} padding={3.5} elevation="none" bordered>
              <HStack gap={3} align="center">
                <VStack gap={0.5} style={{ flex: 1 }}>
                  <Text variant="body" style={{ fontWeight: '700' }}>{a.customerName}</Text>
                  <Text variant="caption" tone="secondary">{a.serviceName} · {a.date} {a.time}</Text>
                </VStack>
                <VStack gap={1} align="end">
                  <Badge label={a.status.toUpperCase()} tone={statusTones[a.status] ?? 'neutral'} />
                  <Text variant="caption" style={{ fontWeight: '700', color: colors.brand[700] }}>Rs {a.feeRupees}</Text>
                </VStack>
              </HStack>
            </Card>
          ))}
        </VStack>
      )}
      {todayAppts.length === 0 && upcoming.length === 0 && (
        <View style={styles.emptySection}>
          <Calendar size={32} color={colors.surface.textSecondary} />
          <Text variant="body" tone="secondary">No upcoming bookings</Text>
        </View>
      )}
    </VStack>
  );
}

// ─── Services ─────────────────────────────────────────────────────────────────

function SvcOffered() {
  const offeredServices = useServiceRequestStore((s) => s.offeredServices);
  const toggle = useServiceRequestStore((s) => s.toggleService);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');

  function addOffered() {
    if (!newName.trim() || !newPrice) return;
    useServiceRequestStore.setState((s) => ({
      offeredServices: [
        ...s.offeredServices,
        { id: `os_${Date.now()}`, name: newName.trim(), baseRupees: Math.round(parseFloat(newPrice)) || 0, available: true },
      ],
    }));
    setNewName(''); setNewPrice(''); setAdding(false);
  }

  return (
    <VStack gap={3}>
      <Button label={adding ? 'Cancel' : '+ Add service'} variant="secondary" onPress={() => setAdding((v) => !v)} fullWidth />
      {adding && (
        <Card padding={3.5} elevation="none" bordered>
          <VStack gap={2}>
            <TextInput value={newName} onChangeText={setNewName} placeholder="Service name" style={styles.quoteInput} />
            <HStack gap={2}>
              <TextInput value={newPrice} onChangeText={setNewPrice} keyboardType="numeric" placeholder="Base price (Rs)" style={[styles.quoteInput, { flex: 1 }]} />
              <Pressable style={styles.sendBtn} onPress={addOffered}>
                <View style={styles.sendBtnInner}>
                  <Text variant="caption" style={{ color: '#fff', fontWeight: '700' }}>Save</Text>
                </View>
              </Pressable>
            </HStack>
          </VStack>
        </Card>
      )}
      {offeredServices.map((svc) => (
        <Card key={svc.id} padding={3.5} elevation="none" bordered>
          <HStack gap={3} align="center">
            <VStack gap={0.5} style={{ flex: 1 }}>
              <Text variant="body" style={{ fontWeight: '700' }}>{svc.name}</Text>
              <Text variant="caption" style={{ fontWeight: '700', color: colors.brand[700] }}>from Rs {svc.baseRupees}</Text>
            </VStack>
            <Switch
              value={svc.available}
              onValueChange={() => toggle(svc.id)}
              trackColor={{ true: colors.brand[600], false: colors.gray[300] }}
            />
          </HStack>
        </Card>
      ))}
    </VStack>
  );
}

function SvcRequests() {
  const requests = useServiceRequestStore((s) => s.requests);
  const sendQuote = useServiceRequestStore((s) => s.sendQuote);
  const updateStatus = useServiceRequestStore((s) => s.updateStatus);
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [quoteAmt, setQuoteAmt] = useState('500');

  const statusTones: Record<string, 'warning' | 'info' | 'brand' | 'success' | 'neutral'> = {
    pending: 'warning', quoted: 'info', accepted: 'brand',
    in_progress: 'brand', done: 'success', rejected: 'neutral',
  };
  const nextStatus: Record<string, string> = {
    accepted: 'in_progress', in_progress: 'done',
  };

  return (
    <VStack gap={3}>
      {requests.map((r) => (
        <Card key={r.id} padding={4} elevation="xs" bordered>
          <HStack gap={2} align="center" style={{ justifyContent: 'space-between' }}>
            <VStack gap={0.5} style={{ flex: 1 }}>
              <Text variant="body" style={{ fontWeight: '700' }}>{r.customerName}</Text>
              <Text variant="caption" tone="secondary" numberOfLines={1}>{r.serviceType} · Flat {r.customerFlat}</Text>
            </VStack>
            <Badge label={r.status.toUpperCase()} tone={statusTones[r.status] ?? 'neutral'} />
          </HStack>
          <Text variant="caption" tone="secondary" style={{ marginTop: spacing[1.5] }} numberOfLines={2}>{r.description}</Text>
          {r.status === 'pending' && quoteId !== r.id && (
            <View style={{ marginTop: spacing[2] }}>
              <Button label="Send quote" variant="secondary" onPress={() => setQuoteId(r.id)} fullWidth />
            </View>
          )}
          {quoteId === r.id && (
            <View style={{ marginTop: spacing[2] }}>
              <HStack gap={2}>
                <TextInput
                  value={quoteAmt}
                  onChangeText={setQuoteAmt}
                  keyboardType="numeric"
                  placeholder="Amount (Rs)"
                  style={[styles.quoteInput, { flex: 1 }]}
                />
                <Pressable
                  style={styles.sendBtn}
                  onPress={() => {
                    sendQuote(r.id, Number(quoteAmt));
                    setQuoteId(null);
                  }}
                >
                  <View style={styles.sendBtnInner}>
                    <Send size={16} color="#fff" />
                    <Text variant="caption" style={{ color: '#fff', fontWeight: '700' }}>Send</Text>
                  </View>
                </Pressable>
              </HStack>
            </View>
          )}
          {!!nextStatus[r.status] && (
            <View style={{ marginTop: spacing[2] }}>
              <Button
                label={"Mark " + nextStatus[r.status].replace(/_/g, ' ')}
                variant="secondary"
                onPress={() => updateStatus(r.id, nextStatus[r.status] as any)}
                fullWidth
              />
            </View>
          )}
        </Card>
      ))}
    </VStack>
  );
}

// ─── API Quotes (services / appointment merchants) ────────────────────────────

type ApiQuote = {
  id: string; serviceDescription: string; budgetPaise?: number;
  status: 'open' | 'quoted' | 'accepted' | 'declined';
  merchantReply?: string; quotedPaise?: number; createdAt: string;
  user: { name: string };
};

function ApiQuotes({ merchantId }: { readonly merchantId: string }) {
  const userId = useWalletStore((s) => s.userId);
  const [quotes, setQuotes]   = useState<ApiQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply]     = useState<{ id: string; text: string; amtRs: string } | null>(null);
  const [saving, setSaving]   = useState(false);

  const load = useCallback(async () => {
    if (!merchantId) { setLoading(false); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/api/mobile/quotes?merchantId=${merchantId}`);
      const data = await res.json();
      setQuotes(data.quotes ?? []);
    } catch { setQuotes([]); } finally { setLoading(false); }
  }, [merchantId]);

  useEffect(() => { load(); }, [load]);

  async function sendQuoteReply(quoteId: string, merchantReply: string, quotedPaise: number) {
    if (!userId) return;
    setSaving(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorId: merchantId, action: 'quote', merchantReply, quotedPaise }),
      });
      if (!res.ok) throw new Error('quote reply failed');
      setReply(null);
      await load();
    } catch {
      Alert.alert('Error', 'Could not send your quote — please try again.');
    } finally { setSaving(false); }
  }

  const statusTones: Record<string, 'warning' | 'info' | 'brand' | 'success' | 'neutral'> = {
    open: 'warning', quoted: 'info', accepted: 'brand', declined: 'neutral',
  };

  if (loading) return <ActivityIndicator style={{ marginTop: spacing[6] }} />;
  if (quotes.length === 0) {
    return (
      <View style={styles.emptySection}>
        <ClipboardList size={32} color={colors.surface.textSecondary} />
        <Text variant="body" tone="secondary">No quote requests yet</Text>
      </View>
    );
  }

  return (
    <VStack gap={3}>
      {quotes.map((q) => (
        <Card key={q.id} padding={4} elevation="xs" bordered>
          <HStack gap={2} align="center" style={{ justifyContent: 'space-between' }}>
            <VStack gap={0.5} style={{ flex: 1 }}>
              <Text variant="body" style={{ fontWeight: '700' }}>{q.user.name}</Text>
              <Text variant="caption" tone="secondary" numberOfLines={2}>{q.serviceDescription}</Text>
              {q.budgetPaise ? (
                <Text variant="caption" style={{ fontWeight: '700', color: colors.brand[700] }}>
                  Budget: Rs {Math.round(q.budgetPaise / 100)}
                </Text>
              ) : null}
            </VStack>
            <Badge label={q.status.toUpperCase()} tone={statusTones[q.status] ?? 'neutral'} />
          </HStack>
          {q.merchantReply && (
            <Text variant="caption" tone="secondary" style={{ marginTop: spacing[1.5] }}>
              Your quote: Rs {q.quotedPaise ? Math.round(q.quotedPaise / 100) : '—'} — {q.merchantReply}
            </Text>
          )}
          {q.status === 'open' && reply?.id !== q.id && (
            <View style={{ marginTop: spacing[2] }}>
              <Button label="Send quote" variant="secondary" onPress={() => setReply({ id: q.id, text: '', amtRs: '' })} fullWidth />
            </View>
          )}
          {reply?.id === q.id && (
            <VStack gap={2} style={{ marginTop: spacing[2] }}>
              <TextInput
                value={reply.text}
                onChangeText={(v) => setReply((r) => r ? { ...r, text: v } : r)}
                placeholder="Describe your quote…"
                style={styles.quoteInput}
                multiline
              />
              <HStack gap={2}>
                <TextInput
                  value={reply.amtRs}
                  onChangeText={(v) => setReply((r) => r ? { ...r, amtRs: v } : r)}
                  keyboardType="numeric"
                  placeholder="Amount (Rs)"
                  style={[styles.quoteInput, { flex: 1 }]}
                />
                <Pressable
                  style={styles.sendBtn}
                  onPress={() => {
                    if (!reply.amtRs) return;
                    sendQuoteReply(q.id, reply.text, Math.round(parseFloat(reply.amtRs) * 100));
                  }}
                  disabled={saving}
                >
                  <View style={styles.sendBtnInner}>
                    <Send size={16} color="#fff" />
                    <Text variant="caption" style={{ color: '#fff', fontWeight: '700' }}>Send</Text>
                  </View>
                </Pressable>
              </HStack>
            </VStack>
          )}
          {q.status === 'accepted' && (
            <Text variant="caption" style={{ color: colors.semantic.success, fontWeight: '700', marginTop: spacing[1.5] }}>
              Customer accepted your quote
            </Text>
          )}
        </Card>
      ))}
    </VStack>
  );
}

// ─── Education ────────────────────────────────────────────────────────────────

function EduBatches() {
  const [batches, setBatches] = useState<EducationBatch[]>(EDU_BATCHES);
  const [adding, setAdding] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newFee, setNewFee] = useState('');
  function toggleBatch(id: string) {
    setBatches((prev) => prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b)));
  }
  function addBatch() {
    if (!newSubject.trim() || !newFee) return;
    setBatches((prev) => [
      { id: `eb_${Date.now()}`, subject: newSubject.trim(), level: 'All levels', timing: 'TBD', days: 'TBD', students: 0, capacity: 15, feeRupees: Math.round(parseFloat(newFee)) || 0, active: true },
      ...prev,
    ]);
    setNewSubject(''); setNewFee(''); setAdding(false);
  }
  return (
    <VStack gap={3}>
      <Button label={adding ? 'Cancel' : '+ Add batch'} variant="secondary" onPress={() => setAdding((v) => !v)} fullWidth />
      {adding && (
        <Card padding={3.5} elevation="none" bordered>
          <VStack gap={2}>
            <TextInput value={newSubject} onChangeText={setNewSubject} placeholder="Subject" style={styles.quoteInput} />
            <HStack gap={2}>
              <TextInput value={newFee} onChangeText={setNewFee} keyboardType="numeric" placeholder="Fee (Rs/mo)" style={[styles.quoteInput, { flex: 1 }]} />
              <Pressable style={styles.sendBtn} onPress={addBatch}>
                <View style={styles.sendBtnInner}>
                  <Text variant="caption" style={{ color: '#fff', fontWeight: '700' }}>Save</Text>
                </View>
              </Pressable>
            </HStack>
          </VStack>
        </Card>
      )}
      {batches.map((b) => (
        <Card key={b.id} padding={4} elevation="xs" bordered>
          <HStack gap={3} align="center">
            <VStack gap={0.5} style={{ flex: 1 }}>
              <Text variant="body" style={{ fontWeight: '700' }}>{b.subject}</Text>
              <Text variant="caption" tone="secondary">{b.level} · {b.timing} · {b.days}</Text>
              <HStack gap={2} style={{ marginTop: spacing[0.5] }}>
                <Text variant="caption" style={{ fontWeight: '700', color: colors.brand[700] }}>Rs {b.feeRupees}/mo</Text>
                <Text variant="caption" tone="secondary">· {b.students}/{b.capacity} students</Text>
              </HStack>
            </VStack>
            <Switch
              value={b.active}
              onValueChange={() => toggleBatch(b.id)}
              trackColor={{ true: colors.brand[600], false: colors.gray[300] }}
            />
          </HStack>
        </Card>
      ))}
    </VStack>
  );
}

function EduFees() {
  const [fees, setFees] = useState<StudentFee[]>(STUDENT_FEES);
  function toggleFee(id: string) {
    setFees((prev) => prev.map((f) => (f.id === id ? { ...f, paid: !f.paid } : f)));
  }
  const pending = fees.filter((f) => !f.paid);
  const paid = fees.filter((f) => f.paid);
  return (
    <VStack gap={4}>
      {pending.length > 0 && (
        <VStack gap={2}>
          <Text variant="caption" style={{ fontWeight: '700', textTransform: 'uppercase', color: colors.surface.textSecondary, letterSpacing: 0.7 }}>Pending ({pending.length})</Text>
          {pending.map((f) => (
            <Card key={f.id} padding={3.5} elevation="none" bordered>
              <HStack gap={3} align="center">
                <VStack gap={0.5} style={{ flex: 1 }}>
                  <Text variant="body" style={{ fontWeight: '700' }}>{f.studentName}</Text>
                  <Text variant="caption" tone="secondary">{f.batchName} · Flat {f.flat} · {f.month}</Text>
                </VStack>
                <HStack gap={2} align="center">
                  <Text variant="body" style={{ fontWeight: '800', color: colors.semantic.danger }}>Rs {f.feeRupees}</Text>
                  <Pressable style={styles.checkBtn} onPress={() => toggleFee(f.id)}>
                    <CheckCircle size={22} color={colors.gray[300]} />
                  </Pressable>
                </HStack>
              </HStack>
            </Card>
          ))}
        </VStack>
      )}
      {paid.length > 0 && (
        <VStack gap={2}>
          <Text variant="caption" style={{ fontWeight: '700', textTransform: 'uppercase', color: colors.surface.textSecondary, letterSpacing: 0.7 }}>Paid ({paid.length})</Text>
          {paid.map((f) => (
            <Card key={f.id} padding={3.5} elevation="none" bordered style={{ opacity: 0.65 }}>
              <HStack gap={3} align="center">
                <VStack gap={0.5} style={{ flex: 1 }}>
                  <Text variant="body" style={{ fontWeight: '700' }}>{f.studentName}</Text>
                  <Text variant="caption" tone="secondary">{f.batchName} · Flat {f.flat} · {f.month}</Text>
                </VStack>
                <HStack gap={2} align="center">
                  <Text variant="body" style={{ fontWeight: '800', color: colors.semantic.success }}>Rs {f.feeRupees}</Text>
                  <Pressable onPress={() => toggleFee(f.id)}>
                    <CheckCircle size={22} color={colors.semantic.success} fill={colors.semantic.success} />
                  </Pressable>
                </HStack>
              </HStack>
            </Card>
          ))}
        </VStack>
      )}
    </VStack>
  );
}

// ─── Offers (shared across all merchant types) ────────────────────────────────

type ApiOffer = {
  id: string; title: string; type: string; value: number; isActive: boolean; endsAt: string;
};

function Offers({ merchantId }: { readonly merchantId: string }) {
  const [offers, setOffers]   = useState<ApiOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding]   = useState(false);
  const [title, setTitle]     = useState('');
  const [percent, setPercent] = useState('10');
  const [days, setDays]       = useState('7');
  const [saving, setSaving]   = useState(false);

  const load = useCallback(async () => {
    if (!merchantId) { setLoading(false); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/api/mobile/merchants/${merchantId}/offers`);
      const data = await res.json();
      setOffers(Array.isArray(data?.offers) ? data.offers : []);
    } catch { setOffers([]); } finally { setLoading(false); }
  }, [merchantId]);

  useEffect(() => { load(); }, [load]);

  async function toggle(id: string, isActive: boolean) {
    setOffers((a) => a.map((o) => (o.id === id ? { ...o, isActive: !isActive } : o)));
    try {
      await fetch(`${BASE}/api/mobile/merchants/${merchantId}/offers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
    } catch { /* optimistic update stands; next reload reconciles */ }
  }

  async function remove(id: string) {
    setOffers((a) => a.filter((o) => o.id !== id));
    try {
      await fetch(`${BASE}/api/mobile/merchants/${merchantId}/offers/${id}`, { method: 'DELETE' });
    } catch { /* ignore — reload will reconcile on next visit */ }
  }

  async function addOffer() {
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      const endsAt = new Date(Date.now() + (parseInt(days, 10) || 7) * 86_400_000).toISOString();
      const res = await fetch(`${BASE}/api/mobile/merchants/${merchantId}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(), type: 'percent_off', value: parseInt(percent, 10) || 0, endsAt,
        }),
      });
      if (!res.ok) throw new Error('create failed');
      setTitle(''); setPercent('10'); setDays('7'); setAdding(false);
      await load();
    } catch {
      Alert.alert('Error', 'Could not create this offer — please try again.');
    } finally { setSaving(false); }
  }

  if (loading) return <ActivityIndicator style={{ marginTop: spacing[6] }} />;

  return (
    <VStack gap={3}>
      <Button label={adding ? 'Cancel' : '+ Create an offer'} variant="secondary" onPress={() => setAdding((v) => !v)} fullWidth />
      {adding && (
        <Card padding={3.5} elevation="none" bordered>
          <VStack gap={2}>
            <TextInput value={title} onChangeText={setTitle} placeholder="Offer title — e.g. Weekend special" style={styles.quoteInput} />
            <HStack gap={2}>
              <TextInput value={percent} onChangeText={setPercent} keyboardType="numeric" placeholder="% off" style={[styles.quoteInput, { flex: 1 }]} />
              <TextInput value={days} onChangeText={setDays} keyboardType="numeric" placeholder="Valid for (days)" style={[styles.quoteInput, { flex: 1 }]} />
            </HStack>
            <Pressable style={styles.sendBtn} onPress={addOffer} disabled={saving}>
              <View style={styles.sendBtnInner}>
                <Text variant="caption" style={{ color: '#fff', fontWeight: '700' }}>{saving ? 'Saving…' : 'Save offer'}</Text>
              </View>
            </Pressable>
          </VStack>
        </Card>
      )}
      {offers.length === 0 && !adding && (
        <View style={styles.emptySection}>
          <Megaphone size={32} color={colors.surface.textSecondary} />
          <Text variant="body" tone="secondary">No offers yet — create one to attract more customers</Text>
        </View>
      )}
      {offers.map((o) => (
        <Card key={o.id} padding={3.5} elevation="none" bordered>
          <HStack gap={3} align="center">
            <VStack gap={0.5} style={{ flex: 1 }}>
              <Text variant="body" style={{ fontWeight: '700' }}>{o.title}</Text>
              <Text variant="caption" tone="secondary">
                {o.type === 'percent_off' ? `${o.value}% off` : `Rs ${Math.round(o.value / 100)} off`} · ends {new Date(o.endsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </Text>
            </VStack>
            <Switch
              value={o.isActive}
              onValueChange={() => toggle(o.id, o.isActive)}
              trackColor={{ true: colors.brand[600], false: colors.gray[300] }}
            />
            <Pressable onPress={() => remove(o.id)} hitSlop={8}>
              <Text variant="caption" style={{ color: colors.semantic.danger, fontWeight: '700' }}>Delete</Text>
            </Pressable>
          </HStack>
        </Card>
      ))}
    </VStack>
  );
}

// ─── Posts (shared) ───────────────────────────────────────────────────────────

function Posts() {
  const [posts, setPosts] = useState<BizPost[]>(BIZ_POSTS);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');

  function addPost() {
    if (!newTitle.trim()) return;
    setPosts((prev) => [
      { id: `bp_${Date.now()}`, title: newTitle.trim(), body: newBody.trim(), type: 'announcement', postedAt: Date.now(), reachViews: 0, clicks: 0 },
      ...prev,
    ]);
    setNewTitle(''); setNewBody(''); setAdding(false);
  }

  return (
    <VStack gap={3}>
      <Button label={adding ? 'Cancel' : '+ Create a post'} onPress={() => setAdding((v) => !v)} fullWidth />
      {adding && (
        <Card padding={3.5} elevation="none" bordered>
          <VStack gap={2}>
            <TextInput value={newTitle} onChangeText={setNewTitle} placeholder="Post title" style={styles.quoteInput} />
            <TextInput value={newBody} onChangeText={setNewBody} placeholder="What's the update?" style={[styles.quoteInput, { minHeight: 60 }]} multiline />
            <Pressable style={styles.sendBtn} onPress={addPost}>
              <View style={styles.sendBtnInner}>
                <Send size={16} color="#fff" />
                <Text variant="caption" style={{ color: '#fff', fontWeight: '700' }}>Post</Text>
              </View>
            </Pressable>
          </VStack>
        </Card>
      )}
      {posts.map((p) => {
        let postTone: 'success' | 'brand' | 'neutral' = 'neutral';
        if (p.type === 'offer') {
          postTone = 'success';
        } else if (p.type === 'arrival') {
          postTone = 'brand';
        }
        return (
          <Card key={p.id} padding={4} elevation="xs" bordered>
            <HStack gap={2} align="center" style={{ justifyContent: 'space-between' }}>
              <Badge label={p.type.toUpperCase()} tone={postTone} />
              <Text variant="caption" tone="secondary">{Math.round((Date.now() - p.postedAt) / 60_000)}m ago</Text>
            </HStack>
            <Text variant="body" style={{ fontWeight: '700', marginTop: spacing[2] }}>{p.title}</Text>
            <Text variant="caption" tone="secondary" style={{ marginTop: 4 }}>{p.body}</Text>
            <HStack gap={3} align="center" style={{ marginTop: spacing[3] }}>
              <HStack gap={1} align="center">
                <Eye size={13} color={colors.surface.textSecondary} />
                <Text variant="caption" tone="secondary">{p.reachViews.toLocaleString('en-IN')}</Text>
              </HStack>
              <HStack gap={1} align="center">
                <Zap size={13} color={colors.surface.textSecondary} />
                <Text variant="caption" tone="secondary">{p.clicks} clicks</Text>
              </HStack>
            </HStack>
          </Card>
        );
      })}
    </VStack>
  );
}

// ─── Promote (shared) ─────────────────────────────────────────────────────────

function Promote({
  pro, bizId, bizName,
}: {
  readonly pro: boolean;
  readonly bizId: string;
  readonly bizName: string;
}) {
  const spend = useWalletStore((s) => s.spend);
  const balancePaise = useWalletStore((s) => s.balancePaise);
  const userId = useWalletStore((s) => s.userId);
  const [activeTier, setActiveTier] = useState<string | null>(null);
  const [boostingTier, setBoostingTier] = useState<string | null>(null);

  async function handleBoost(opt: { label: string; price: number }) {
    if (!pro || boostingTier) return;
    const priceInPaise = opt.price * 100;
    if (balancePaise < priceInPaise) {
      Alert.alert('Insufficient balance', 'Add money to your Lokul wallet to activate this boost.');
      return;
    }
    setBoostingTier(opt.label);
    try {
      spend(priceInPaise, `Boost: ${opt.label} tier`, bizName);
      if (userId) {
        await fetch(`${BASE}/api/mobile/merchants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ownerId: userId, id: bizId, name: bizName, activeBoostTier: opt.label }),
        });
      }
      setActiveTier(opt.label);
      Alert.alert('Boost activated', `${opt.label} is live for the next 24 hours.`);
    } catch {
      Alert.alert('Error', 'Could not activate this boost — please try again.');
    } finally {
      setBoostingTier(null);
    }
  }

  return (
    <VStack gap={3}>
      <Card padding={4} elevation="xs" bordered style={{ backgroundColor: colors.brand[50], borderColor: colors.brand[100] }}>
        <HStack gap={3} align="center">
          <View style={[styles.thumb, { backgroundColor: '#fff' }]}>
            <Megaphone size={20} color={colors.brand[700]} />
          </View>
          <VStack gap={0.5} style={{ flex: 1 }}>
            <Text variant="body" style={{ fontWeight: '700' }}>Boost a post</Text>
            <Text variant="caption" tone="secondary">Reach more residents within your chosen radius.</Text>
          </VStack>
        </HStack>
      </Card>
      {[
        { label: '500 m · 200 reach', price: 20 },
        { label: '1 km · 800 reach', price: 60 },
        { label: '2 km · 2,500 reach', price: 150 },
        { label: '5 km · 8,000 reach', price: 500 },
      ].map((opt) => (
        <Pressable key={opt.label} disabled={!pro || !!boostingTier} onPress={() => handleBoost(opt)}>
          <Card
            padding={3.5}
            elevation="none"
            bordered
            style={
              !pro
                ? { opacity: 0.55 }
                : activeTier === opt.label
                ? { borderColor: colors.brand[500], borderWidth: 2 }
                : undefined
            }
          >
            <HStack gap={3} align="center" style={{ justifyContent: 'space-between' }}>
              <VStack gap={0.5}>
                <Text variant="body" style={{ fontWeight: '700' }}>{opt.label}</Text>
                <Text variant="caption" tone="secondary">
                  {boostingTier === opt.label
                    ? 'Activating…'
                    : activeTier === opt.label
                    ? 'Active · ~24h hyperlocal reach'
                    : '~24h hyperlocal reach'}
                </Text>
              </VStack>
              <Text variant="h3" style={{ color: colors.brand[700], fontWeight: '800' }}>Rs {opt.price}</Text>
            </HStack>
          </Card>
        </Pressable>
      ))}
      {!pro && (
        <Card padding={4} elevation="none" bordered style={{ backgroundColor: colors.semantic.warningBg, borderColor: '#FCD34D' }}>
          <Text variant="caption" style={{ fontWeight: '700', color: colors.semantic.warning }}>
            Upgrade to Pro to unlock promotions and analytics.
          </Text>
        </Card>
      )}
    </VStack>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.surface.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surface.border,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  banner: { padding: spacing[4] },
  logo: { width: 64, height: 64, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  tabs: {
    backgroundColor: colors.surface.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surface.border,
    paddingVertical: spacing[2],
    flexGrow: 0,
  },
  tab: { paddingHorizontal: spacing[3], paddingVertical: spacing[1.5], borderRadius: radius.full, backgroundColor: colors.gray[100] },
  tabActive: { backgroundColor: colors.brand[50] },
  scroll: { padding: spacing[4], paddingBottom: spacing[10] },
  empty: { flex: 1, padding: spacing[6], alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
  emptySection: { alignItems: 'center', paddingVertical: spacing[8], gap: spacing[2] },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  kpi: {
    flexGrow: 1,
    flexBasis: '47%',
    padding: spacing[3],
    backgroundColor: colors.surface.background,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  qa: { borderRadius: radius.full },
  qaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.brand[50],
    borderRadius: radius.full,
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  vegDot: { width: 10, height: 10, borderRadius: 5, marginTop: 2 },
  itemsBox: {
    backgroundColor: colors.gray[50],
    padding: spacing[2.5],
    borderRadius: radius.md,
    marginTop: spacing[2.5],
    gap: spacing[1],
  },
  quoteInput: {
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    fontSize: 14,
    color: colors.surface.foreground,
    backgroundColor: colors.surface.background,
  },
  sendBtn: { borderRadius: radius.md },
  sendBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: colors.brand[600],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.md,
  },
  checkBtn: { padding: spacing[1] },
});
