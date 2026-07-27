import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Clock, Wrench } from 'lucide-react-native';
import { Badge, Button, Card, HStack, Text, VStack } from '@/components/ui';
import { usePeerStore } from '@/store/peerRoleStore';
import { useVerificationStore } from '@/store/verificationStore';
import { usePeerOrders } from '@/hooks/usePeerOrders';
import { colors, spacing } from '@lokul/ui-tokens';
import { ActivateScreen, Header, Stat } from './cook';

type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'done';

interface Booking {
  id: string;
  customerName: string;
  customerFlat: string;
  service: string;
  scheduledAt: string;
  feeRupees: number;
  status: BookingStatus;
}

const BOOKINGS: Booking[] = [
  { id: 'hm1', customerName: 'Priya Sharma',  customerFlat: 'A-401', service: 'Leaky tap repair',       scheduledAt: 'Today, 4:00 PM',  feeRupees: 250, status: 'pending' },
  { id: 'hm2', customerName: 'Vikram Joshi',  customerFlat: 'B-201', service: 'Switchboard replacement', scheduledAt: 'Today, 6:00 PM',  feeRupees: 350, status: 'confirmed' },
  { id: 'hm3', customerName: 'Anita Desai',   customerFlat: 'A-305', service: 'Ceiling fan fitting',     scheduledAt: 'Tomorrow, 10 AM', feeRupees: 200, status: 'done' },
];

const STATUS_TONE: Record<BookingStatus, 'warning' | 'info' | 'brand' | 'success'> = {
  pending: 'warning', confirmed: 'info', in_progress: 'brand', done: 'success',
};

const NEXT_ACTION: Partial<Record<BookingStatus, string>> = {
  pending: 'Accept Job', confirmed: 'Start Work', in_progress: 'Mark Done',
};

export default function HandymanDashboard() {
  const router = useRouter();
  const handyman = usePeerStore((s) => s.roles.handyman);
  const activate = usePeerStore((s) => s.activate);
  const tier = useVerificationStore((s) => s.tier);

  const { orders: apiOrders } = usePeerOrders();

  const [online, setOnline] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>(BOOKINGS);

  useEffect(() => {
    if (apiOrders.length === 0) return;
    const mapped: Booking[] = apiOrders.map((o) => ({
      id: o.id,
      customerName: o.buyer.name,
      customerFlat: '',
      service: o.listing?.title ?? 'Job',
      scheduledAt: new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      feeRupees: Math.round(o.amountPaise / 100),
      status: (o.status === 'completed' ? 'done' : o.status === 'in_progress' ? 'in_progress' : o.status === 'accepted' ? 'confirmed' : 'pending') as BookingStatus,
    }));
    setBookings(mapped);
  }, [apiOrders]);

  if (!handyman.active) {
    return (
      <ActivateScreen
        title="Handyman"
        desc="Offer plumbing, electrical, and carpentry services to your neighbors. Get paid per job."
        canActivate={tier !== 'bronze'}
        onActivate={() => activate('handyman')}
      />
    );
  }

  const pending = bookings.filter((b) => b.status === 'pending').length;
  const active = bookings.filter((b) => b.status === 'in_progress').length;
  const todayRupees = bookings.filter((b) => b.status === 'done').reduce((s, b) => s + b.feeRupees, 0);

  const advance = (id: string) =>
    setBookings((arr) =>
      arr.map((b) => {
        if (b.id !== id) return b;
        let next: BookingStatus;
        if (b.status === 'pending') next = 'confirmed';
        else if (b.status === 'confirmed') next = 'in_progress';
        else next = 'done';
        return { ...b, status: next };
      })
    );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Handyman" onBack={() => router.back()} />

      <View style={styles.statsStrip}>
        <Stat label="Pending"    value={pending} tint="#F97316" />
        <Stat label="Active"     value={active}  tint="#78716C" />
        <Stat label="₹ Today"   value={todayRupees} tint={colors.brand[600]} prefix="₹" />
      </View>

      <View style={styles.toggleRow}>
        <HStack gap={2} align="center">
          <View style={[styles.dot, { backgroundColor: online ? '#10B981' : '#94A3B8' }]} />
          <Text variant="body" style={{ fontWeight: '700' }}>
            {online ? 'Available for jobs' : 'Offline'}
          </Text>
        </HStack>
        <Switch
          value={online}
          onValueChange={setOnline}
          trackColor={{ true: colors.brand[600], false: colors.gray[300] }}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {bookings.map((b) => {
          const action = NEXT_ACTION[b.status];
          return (
            <Card key={b.id} padding={4} elevation="xs" bordered style={{ marginBottom: spacing[3] }}>
              <HStack gap={3} align="center" style={{ marginBottom: spacing[2] }}>
                <View style={styles.avatar}>
                  <Text style={{ fontWeight: '700', color: '#78716C' }}>
                    {b.customerName.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                  </Text>
                </View>
                <VStack gap={0.5} style={{ flex: 1 }}>
                  <Text variant="body" style={{ fontWeight: '700' }}>{b.customerName}</Text>
                  <Text variant="caption" tone="secondary">{b.customerFlat}</Text>
                </VStack>
                <Badge label={b.status.replace('_', ' ').toUpperCase()} tone={STATUS_TONE[b.status]} />
              </HStack>
              <HStack gap={2} align="center" style={{ marginBottom: spacing[1] }}>
                <Wrench size={13} color={colors.surface.textSecondary} />
                <Text variant="caption" style={{ flex: 1 }}>{b.service}</Text>
                <Text variant="body" style={{ fontWeight: '700', color: '#78716C' }}>₹{b.feeRupees}</Text>
              </HStack>
              <HStack gap={1.5} align="center" style={{ marginBottom: spacing[2] }}>
                <Clock size={13} color={colors.surface.textSecondary} />
                <Text variant="caption" tone="secondary">{b.scheduledAt}</Text>
              </HStack>
              {!!action && (
                <Button onPress={() => advance(b.id)} label={action} fullWidth />
              )}
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  statsStrip: {
    flexDirection: 'row', backgroundColor: colors.surface.background,
    borderBottomWidth: 0.5, borderBottomColor: colors.surface.border,
  },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    backgroundColor: colors.surface.background,
    borderBottomWidth: 0.5, borderBottomColor: colors.surface.border,
    marginBottom: spacing[2],
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  scroll: { padding: spacing[4], paddingBottom: spacing[16] },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#78716C20', alignItems: 'center', justifyContent: 'center',
  },
});
