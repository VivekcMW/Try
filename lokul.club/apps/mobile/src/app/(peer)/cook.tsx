// PRD §05 — Cook dashboard (menu + orders + kitchen toggle)
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Check,
  ChefHat,
  Clock,
  Leaf,
  Plus,
  Utensils,
  X,
} from 'lucide-react-native';
import { Badge, Button, Card, HStack, Input, Text, VStack } from '@/components/ui';
import { VerificationGate } from '@/components/VerificationGate';
import { type CookOrder, type MenuItem } from '@/data/peer-seed';
import { usePeerStore } from '@/store/peerRoleStore';
import { usePeerListingsStore } from '@/store/peerListingsStore';
import { useVerificationStore } from '@/store/verificationStore';
import { usePeerOrders } from '@/hooks/usePeerOrders';
import { colors, radius, spacing } from '@lokul/ui-tokens';

type Tab = 'menu' | 'orders';

export default function CookDashboard() {
  const router = useRouter();
  const tier = useVerificationStore((s) => s.tier);
  const cook = usePeerStore((s) => s.roles.cook);
  const activate = usePeerStore((s) => s.activate);

  const { orders: apiOrders, reload } = usePeerOrders();

  const menu = usePeerListingsStore((s) => s.menuItems);
  const toggleMenuItem = usePeerListingsStore((s) => s.toggleMenuItem);
  const addMenuItem = usePeerListingsStore((s) => s.addMenuItem);

  const [tab, setTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<CookOrder[]>([]);
  const [kitchenOpen, setKitchenOpen] = useState(true);
  const [addItemVisible, setAddItemVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newVeg, setNewVeg] = useState(true);

  useEffect(() => {
    const mapped: CookOrder[] = apiOrders.map((o) => ({
      id: o.id,
      buyerName: o.buyer.name,
      buyerFlat: '',
      items: [{ name: o.listing?.title ?? 'Order', qty: 1, priceRupees: Math.round(o.amountPaise / 100) }],
      totalRupees: Math.round(o.amountPaise / 100),
      status: (o.status === 'pending'
        ? 'new'
        : o.status === 'in_progress'
        ? 'cooking'
        : o.status === 'completed'
        ? 'delivered'
        : 'ready') as CookOrder['status'],
      placedAt: new Date(o.createdAt).getTime(),
      pickupAt: new Date(o.createdAt).getTime() + 3_600_000,
      paid: o.status === 'completed',
    }));
    setOrders(mapped);
  }, [apiOrders]);

  if (!cook.active) {
    return (
      <ActivateScreen
        onActivate={() => activate('cook')}
        canActivate={tier !== 'bronze'}
        title="Cook"
        desc="Sell home-cooked meals to neighbors. Set a menu, accept orders, get paid via Lokul wallet."
      />
    );
  }

  const newCount = orders.filter((o) => o.status === 'new').length;
  const cookingCount = orders.filter((o) => o.status === 'cooking').length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;
  const todayRupees = orders.reduce((acc, o) => acc + o.totalRupees, 0);

  const resetAddItemForm = () => {
    setNewName('');
    setNewPrice('');
    setNewNotes('');
    setNewVeg(true);
  };

  const submitNewItem = () => {
    const price = Number(newPrice);
    if (!newName.trim() || !price || price <= 0) return;
    addMenuItem({
      name: newName.trim(),
      priceRupees: Math.round(price),
      veg: newVeg,
      available: true,
      notes: newNotes.trim() || undefined,
    });
    resetAddItemForm();
    setAddItemVisible(false);
  };

  const advance = (id: string) =>
    setOrders((os) =>
      os.map((o) => {
        if (o.id !== id) return o;
        const next: CookOrder['status'] =
          o.status === 'new' ? 'cooking' : o.status === 'cooking' ? 'ready' : o.status === 'ready' ? 'delivered' : o.status;
        return { ...o, status: next };
      })
    );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Cook" onBack={() => router.back()} />

      {/* Stats strip */}
      <View style={styles.statsStrip}>
        <Stat label="New" value={newCount} tint="#F97316" />
        <Stat label="Cooking" value={cookingCount} tint="#0EA5E9" />
        <Stat label="Ready" value={readyCount} tint="#10B981" />
        <Stat label="₹ Today" value={todayRupees} tint={colors.brand[600]} prefix="₹" />
      </View>

      {/* Kitchen open toggle */}
      <View style={styles.kitchenRow}>
        <HStack gap={2} align="center">
          <View style={[styles.kitchenDot, { backgroundColor: kitchenOpen ? '#10B981' : '#94A3B8' }]} />
          <Text variant="body" style={{ fontWeight: '700' }}>
            Kitchen is {kitchenOpen ? 'OPEN' : 'CLOSED'}
          </Text>
        </HStack>
        <Switch
          value={kitchenOpen}
          onValueChange={setKitchenOpen}
          trackColor={{ true: colors.brand[600], false: colors.gray[300] }}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TabBtn label={`Orders (${orders.length})`} active={tab === 'orders'} onPress={() => setTab('orders')} />
        <TabBtn label={`Menu (${menu.length})`} active={tab === 'menu'} onPress={() => setTab('menu')} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {tab === 'orders' ? (
          <VStack gap={3}>
            {orders.length === 0 ? (
              <Text variant="body" tone="secondary" style={{ textAlign: 'center', marginTop: spacing[8] }}>
                No orders yet
              </Text>
            ) : (
              orders.map((o) => (
                <OrderCard key={o.id} order={o} onAdvance={() => advance(o.id)} />
              ))
            )}
          </VStack>
        ) : (
          <VStack gap={3}>
            {menu.map((m) => (
              <MenuRow key={m.id} item={m} onToggle={() => toggleMenuItem(m.id)} />
            ))}
            <Pressable style={styles.addBtn} onPress={() => setAddItemVisible(true)} accessibilityRole="button">
              <Plus size={18} color={colors.brand[700]} />
              <Text variant="body" style={{ color: colors.brand[700], fontWeight: '700' }}>
                Add menu item
              </Text>
            </Pressable>
          </VStack>
        )}
      </ScrollView>

      <Modal
        visible={addItemVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAddItemVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <HStack gap={2} align="center" style={{ justifyContent: 'space-between', marginBottom: spacing[3] }}>
              <Text variant="h3">Add menu item</Text>
              <Pressable onPress={() => setAddItemVisible(false)} hitSlop={10} accessibilityRole="button">
                <X size={20} color={colors.surface.heading} />
              </Pressable>
            </HStack>

            <VStack gap={3}>
              <Input label="Item name" value={newName} onChangeText={setNewName} placeholder="e.g. Veg Thali" />
              <Input
                label="Price (₹)"
                value={newPrice}
                onChangeText={(v) => setNewPrice(v.replace(/[^0-9]/g, ''))}
                placeholder="110"
                keyboardType="number-pad"
              />
              <Input label="Notes (optional)" value={newNotes} onChangeText={setNewNotes} placeholder="Fresh till 2pm" />

              <HStack gap={2} align="center">
                <Pressable
                  style={[styles.vegToggle, newVeg && styles.vegToggleActive]}
                  onPress={() => setNewVeg(true)}
                  accessibilityRole="button"
                >
                  <Leaf size={14} color={newVeg ? '#16A34A' : colors.gray[400]} />
                  <Text variant="caption" style={{ fontWeight: '700', color: newVeg ? '#16A34A' : colors.gray[500] }}>Veg</Text>
                </Pressable>
                <Pressable
                  style={[styles.vegToggle, !newVeg && styles.nonvegToggleActive]}
                  onPress={() => setNewVeg(false)}
                  accessibilityRole="button"
                >
                  <Text variant="caption" style={{ fontWeight: '700', color: !newVeg ? '#DC2626' : colors.gray[500] }}>Non-veg</Text>
                </Pressable>
              </HStack>

              <Button
                label="Add item"
                onPress={submitNewItem}
                disabled={!newName.trim() || !Number(newPrice)}
                fullWidth
              />
            </VStack>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function OrderCard({ order, onAdvance }: { order: CookOrder; onAdvance: () => void }) {
  const status = order.status;
  const nextLabel =
    status === 'new'
      ? 'Accept & Start Cooking'
      : status === 'cooking'
      ? 'Mark Ready'
      : status === 'ready'
      ? 'Mark Delivered'
      : 'Done';

  const tone: Record<string, 'brand' | 'info' | 'success' | 'neutral' | 'warning'> = {
    new: 'warning',
    cooking: 'info',
    ready: 'success',
    delivered: 'neutral',
    cancelled: 'neutral',
  };

  return (
    <Card padding={4} elevation="xs" bordered>
      <HStack gap={3} align="center" style={{ marginBottom: spacing[2] }}>
        <View style={styles.orderAvatar}>
          <Text style={{ fontWeight: '700', color: colors.brand[700] }}>
            {order.buyerName.split(' ').map((p) => p[0]).join('').slice(0, 2)}
          </Text>
        </View>
        <VStack gap={0.5} style={{ flex: 1 }}>
          <Text variant="body" style={{ fontWeight: '700' }}>{order.buyerName}</Text>
          <Text variant="caption" tone="secondary">{order.buyerFlat} · #{order.id.toUpperCase()}</Text>
        </VStack>
        <Badge label={status.toUpperCase()} tone={tone[status]} />
      </HStack>

      <VStack gap={1} style={styles.itemsBox}>
        {order.items.map((it, i) => (
          <HStack key={i} gap={2} align="center" style={{ justifyContent: 'space-between' }}>
            <Text variant="caption">{it.qty} × {it.name}</Text>
            <Text variant="caption" style={{ fontWeight: '600' }}>₹ {it.qty * it.priceRupees}</Text>
          </HStack>
        ))}
      </VStack>

      <HStack gap={2} align="center" style={{ marginTop: spacing[2.5], justifyContent: 'space-between' }}>
        <HStack gap={1.5} align="center">
          <Clock size={13} color={colors.surface.textSecondary} />
          <Text variant="caption" tone="secondary">
            Pickup {new Date(order.pickupAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </HStack>
        <Text variant="body" style={{ fontWeight: '700', color: colors.brand[700] }}>
          ₹ {order.totalRupees}
        </Text>
      </HStack>

      {status !== 'delivered' && status !== 'cancelled' && (
        <View style={{ marginTop: spacing[3] }}>
          <Button onPress={onAdvance} label={nextLabel} fullWidth />
        </View>
      )}
    </Card>
  );
}

function MenuRow({ item, onToggle }: { item: MenuItem; onToggle: () => void }) {
  return (
    <Card padding={3.5} elevation="none" bordered>
      <HStack gap={3} align="center">
        <View style={[styles.vegDot, item.veg ? styles.vegOk : styles.nonveg]}>
          {item.veg ? <Leaf size={12} color="#16A34A" /> : <View style={styles.nvInner} />}
        </View>
        <VStack gap={0.5} style={{ flex: 1 }}>
          <Text variant="body" style={{ fontWeight: '600' }}>{item.name}</Text>
          <HStack gap={2} align="center">
            <Text variant="caption" style={{ fontWeight: '700', color: colors.brand[700] }}>
              ₹ {item.priceRupees}
            </Text>
            {item.notes && <Text variant="caption" tone="secondary">· {item.notes}</Text>}
          </HStack>
        </VStack>
        <Switch
          value={item.available}
          onValueChange={onToggle}
          trackColor={{ true: colors.brand[600], false: colors.gray[300] }}
        />
      </HStack>
    </Card>
  );
}

export function Header({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={10} style={styles.iconBtn}>
        <ArrowLeft size={20} color={colors.surface.heading} />
      </Pressable>
      <VStack gap={0} style={{ alignItems: 'center' }}>
        <Text variant="h3" style={{ fontWeight: '700' }}>{title}</Text>
        {subtitle && <Text variant="caption" tone="secondary">{subtitle}</Text>}
      </VStack>
      <View style={{ width: 36 }} />
    </View>
  );
}

export function Stat({ label, value, tint, prefix }: { label: string; value: number | string; tint: string; prefix?: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="caption" tone="secondary" style={{ fontSize: 11 }}>{label}</Text>
      <Text variant="h3" style={{ color: tint, fontWeight: '800' }}>
        {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}
      </Text>
    </View>
  );
}

function TabBtn({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tabBtn, active && styles.tabBtnActive]}>
      <Text variant="caption" style={{ color: active ? colors.brand[700] : colors.surface.textSecondary, fontWeight: '700' }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ActivateScreen({
  title,
  desc,
  canActivate,
  onActivate,
}: {
  title: string;
  desc: string;
  canActivate: boolean;
  onActivate: () => void;
}) {
  const router = useRouter();
  const [gateVisible, setGateVisible] = useState(false);
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title={title} onBack={() => router.back()} />
      <View style={styles.activate}>
        <View style={styles.activateIcon}>
          <ChefHat size={36} color={colors.brand[600]} />
        </View>
        <Text variant="h2" style={{ textAlign: 'center', fontWeight: '700' }}>
          Activate {title} role
        </Text>
        <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>{desc}</Text>

        <VStack gap={2} style={{ width: '100%', marginTop: spacing[5] }}>
          <Bullet text="Set your menu / availability / batches" />
          <Bullet text="Accept orders from neighbors within radius" />
          <Bullet text="Get paid instantly via Lokul wallet" />
          <Bullet text="Build trust with reviews & repeat customers" />
        </VStack>

        <View style={{ flex: 1 }} />

        {canActivate ? (
          <View style={{ width: '100%' }}>
            <Button onPress={onActivate} label="Activate role" fullWidth />
          </View>
        ) : (
          <View style={{ width: '100%' }}>
            <Button
              onPress={() => setGateVisible(true)}
              variant="primary"
              label="Verify to activate →"
              fullWidth
            />
          </View>
        )}
      </View>

      <VerificationGate
        visible={gateVisible}
        onClose={() => setGateVisible(false)}
        action="activate this role and accept orders"
      />
    </SafeAreaView>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <HStack gap={2} align="center">
      <View style={styles.bulletDot}>
        <Check size={12} color="#16A34A" strokeWidth={3} />
      </View>
      <Text variant="body" style={{ flex: 1 }}>{text}</Text>
    </HStack>
  );
}

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
  statsStrip: {
    flexDirection: 'row',
    gap: spacing[2],
    padding: spacing[3],
    backgroundColor: colors.surface.background,
  },
  stat: {
    flex: 1,
    padding: spacing[2.5],
    backgroundColor: colors.gray[50],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surface.border,
    alignItems: 'flex-start',
    gap: 2,
  },
  kitchenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.surface.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surface.border,
  },
  kitchenDot: { width: 10, height: 10, borderRadius: 5 },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.surface.background,
    gap: spacing[2],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surface.border,
  },
  tabBtn: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: radius.full,
    backgroundColor: colors.gray[100],
  },
  tabBtnActive: { backgroundColor: colors.brand[50] },
  scroll: { padding: spacing[4], paddingBottom: spacing[10] },
  orderAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemsBox: {
    backgroundColor: colors.gray[50],
    padding: spacing[2.5],
    borderRadius: radius.md,
  },
  vegDot: {
    width: 22,
    height: 22,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  vegOk: { borderColor: '#16A34A', backgroundColor: '#DCFCE7' },
  nonveg: { borderColor: '#DC2626', backgroundColor: '#FEE2E2' },
  nvInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#DC2626' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1.5],
    padding: spacing[3],
    backgroundColor: colors.brand[50],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.brand[100],
    borderStyle: 'dashed',
  },
  activate: {
    flex: 1,
    padding: spacing[5],
    alignItems: 'center',
    gap: spacing[3],
  },
  activateIcon: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[6],
  },
  bulletDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing[5],
    paddingBottom: spacing[8],
  },
  vegToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.surface.border,
  },
  vegToggleActive: { borderColor: '#16A34A', backgroundColor: '#DCFCE7' },
  nonvegToggleActive: { borderColor: '#DC2626', backgroundColor: '#FEE2E2' },
});
