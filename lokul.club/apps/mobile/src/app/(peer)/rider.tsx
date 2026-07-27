// PRD §05.4.4 — Rider dashboard
import { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Bike, Clock, MapPin, Package, Phone } from 'lucide-react-native';
import { Badge, Button, Card, HStack, Text, VStack } from '@/components/ui';
import { type ErrandRequest } from '@/data/peer-seed';
import { usePeerStore } from '@/store/peerRoleStore';
import { useVerificationStore } from '@/store/verificationStore';
import { usePeerOrders } from '@/hooks/usePeerOrders';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { Header, Stat, ActivateScreen } from './cook';

export default function RiderDashboard() {
  const router = useRouter();
  const rider = usePeerStore((s) => s.roles.rider);
  const activate = usePeerStore((s) => s.activate);
  const tier = useVerificationStore((s) => s.tier);

  const { orders: apiOrders } = usePeerOrders();

  const [online, setOnline] = useState(true);
  const [errands, setErrands] = useState<ErrandRequest[]>([]);

  useEffect(() => {
    const mapped: ErrandRequest[] = apiOrders.map((o) => ({
      id: o.id,
      fromFlat: '',
      customerName: o.buyer.name,
      customerPhone: o.buyer.phone,
      pickup: o.listing?.title ?? 'Pickup',
      drop: 'Destination',
      distanceKm: 1,
      feeRupees: Math.round(o.amountPaise / 100),
      status: (o.status === 'pending'
        ? 'pending'
        : o.status === 'in_progress'
        ? 'in_progress'
        : o.status === 'completed'
        ? 'done'
        : 'accepted') as ErrandRequest['status'],
      notes: undefined,
      postedAt: new Date(o.createdAt).getTime(),
    }));
    setErrands(mapped);
  }, [apiOrders]);

  if (!rider.active) {
    return (
      <ActivateScreen
        title="Rider"
        desc="Run quick errands for your neighbors and earn per trip. You set your hours."
        canActivate={tier !== 'bronze'}
        onActivate={() => activate('rider')}
      />
    );
  }

  const pending = errands.filter((e) => e.status === 'pending');
  const active = errands.filter((e) => e.status === 'accepted' || e.status === 'in_progress');
  const todayRupees = errands.reduce((s, e) => s + e.feeRupees, 0);

  const advance = (id: string) =>
    setErrands((arr) =>
      arr.map((e) => {
        if (e.id !== id) return e;
        const next: ErrandRequest['status'] =
          e.status === 'pending' ? 'accepted' : e.status === 'accepted' ? 'in_progress' : 'done';
        return { ...e, status: next };
      })
    );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Rider" onBack={() => router.back()} />

      <View style={styles.statsStrip}>
        <Stat label="Pending" value={pending.length} tint="#F97316" />
        <Stat label="Active" value={active.length} tint="#0EA5E9" />
        <Stat label="₹ Today" value={todayRupees} tint={colors.brand[600]} prefix="₹" />
      </View>

      <View style={styles.kitchenRow}>
        <HStack gap={2} align="center">
          <View style={[styles.dot, { backgroundColor: online ? '#10B981' : '#94A3B8' }]} />
          <Text variant="body" style={{ fontWeight: '700' }}>
            {online ? 'Available for errands' : 'Offline'}
          </Text>
        </HStack>
        <Switch
          value={online}
          onValueChange={setOnline}
          trackColor={{ true: colors.brand[600], false: colors.gray[300] }}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {active.length > 0 && (
          <Section title="Active runs">
            {active.map((e) => (
              <ErrandCard key={e.id} errand={e} onAdvance={() => advance(e.id)} active />
            ))}
          </Section>
        )}
        <Section title={`Pending requests (${pending.length})`}>
          {pending.length === 0 ? (
            <Card padding={4} elevation="none" bordered>
              <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
                No requests right now. We’ll notify you when something nearby comes in.
              </Text>
            </Card>
          ) : (
            pending.map((e) => <ErrandCard key={e.id} errand={e} onAdvance={() => advance(e.id)} />)
          )}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function ErrandCard({
  errand,
  onAdvance,
  active = false,
}: {
  readonly errand: ErrandRequest;
  readonly onAdvance: () => void;
  readonly active?: boolean;
}) {
  const ageMin = Math.max(1, Math.round((Date.now() - errand.postedAt) / 60_000));
  const cta =
    errand.status === 'pending'
      ? 'Accept'
      : errand.status === 'accepted'
      ? 'Start trip'
      : 'Mark delivered';

  return (
    <Card padding={4} elevation="xs" bordered style={active ? { borderColor: colors.brand[200] } : undefined}>
      <HStack gap={2} align="center" style={{ justifyContent: 'space-between' }}>
        <HStack gap={2} align="center">
          <View style={styles.runIcon}>
            <Package size={16} color={colors.brand[700]} />
          </View>
          <VStack gap={0.5}>
            <Text variant="body" style={{ fontWeight: '700' }}>{errand.customerName}</Text>
            <Text variant="caption" tone="secondary">{errand.fromFlat} · {ageMin}m ago</Text>
          </VStack>
        </HStack>
        <Text variant="h3" style={{ color: colors.brand[700], fontWeight: '800' }}>
          ₹{errand.feeRupees}
        </Text>
      </HStack>

      <VStack gap={1.5} style={{ marginTop: spacing[3] }}>
        <HStack gap={2} align="start">
          <MapPin size={14} color="#10B981" style={{ marginTop: 2 }} />
          <Text variant="caption" style={{ flex: 1 }}>
            <Text variant="caption" style={{ fontWeight: '700' }}>Pickup: </Text>
            {errand.pickup}
          </Text>
        </HStack>
        <HStack gap={2} align="start">
          <MapPin size={14} color="#DC2626" style={{ marginTop: 2 }} />
          <Text variant="caption" style={{ flex: 1 }}>
            <Text variant="caption" style={{ fontWeight: '700' }}>Drop: </Text>
            {errand.drop}
          </Text>
        </HStack>
        {errand.notes && (
          <Text variant="caption" tone="secondary" style={{ paddingLeft: 22 }}>
            “{errand.notes}”
          </Text>
        )}
      </VStack>

      <HStack gap={2} align="center" style={{ marginTop: spacing[2], justifyContent: 'space-between' }}>
        <HStack gap={1.5} align="center">
          <Bike size={13} color={colors.surface.textSecondary} />
          <Text variant="caption" tone="secondary">{errand.distanceKm.toFixed(1)} km</Text>
        </HStack>
        {errand.status !== 'pending' && (
          <Badge label={errand.status.replace('_', ' ').toUpperCase()} tone="info" />
        )}
      </HStack>

      <View style={{ flexDirection: 'row', gap: spacing[2], marginTop: spacing[3] }}>
        {errand.status !== 'pending' && (
          <Pressable
            style={styles.callBtn}
            accessibilityRole="button"
            onPress={() => {
              if (!errand.customerPhone) {
                Alert.alert('No phone number', "This customer's phone number isn't available.");
                return;
              }
              Linking.openURL(`tel:${errand.customerPhone}`);
            }}
          >
            <Phone size={16} color={colors.brand[600]} />
          </Pressable>
        )}
        <View style={{ flex: 1 }}>
          <Button label={cta} onPress={onAdvance} fullWidth />
        </View>
      </View>
    </Card>
  );
}

function Section({ title, children }: { readonly title: string; readonly children: React.ReactNode }) {
  return (
    <VStack gap={2.5} style={{ marginBottom: spacing[4] }}>
      <Text variant="caption" style={{ color: colors.surface.textSecondary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 }}>
        {title}
      </Text>
      <VStack gap={3}>{children}</VStack>
    </VStack>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  statsStrip: {
    flexDirection: 'row',
    gap: spacing[2],
    padding: spacing[3],
    backgroundColor: colors.surface.background,
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
  dot: { width: 10, height: 10, borderRadius: 5 },
  scroll: { padding: spacing[4], paddingBottom: spacing[10] },
  runIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surface.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.background,
  },
});
