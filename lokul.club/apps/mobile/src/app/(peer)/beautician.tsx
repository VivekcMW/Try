import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Clock, Scissors } from 'lucide-react-native';
import { Badge, Button, Card, HStack, Text, VStack } from '@/components/ui';
import { usePeerStore } from '@/store/peerRoleStore';
import { useVerificationStore } from '@/store/verificationStore';
import { usePeerOrders } from '@/hooks/usePeerOrders';
import { colors, spacing } from '@lokul/ui-tokens';
import { ActivateScreen, Header, Stat } from './cook';

type AppointmentStatus = 'pending' | 'confirmed' | 'done';

interface Appointment {
  id: string;
  customerName: string;
  customerFlat: string;
  service: string;
  scheduledAt: string;
  feeRupees: number;
  status: AppointmentStatus;
}

const APPOINTMENTS: Appointment[] = [
  { id: 'be1', customerName: 'Meena Iyer',   customerFlat: 'B-304', service: 'Haircut & blowdry',   scheduledAt: 'Today, 3:00 PM',  feeRupees: 400, status: 'confirmed' },
  { id: 'be2', customerName: 'Sunita Patel', customerFlat: 'B-501', service: 'Facial & cleanup',    scheduledAt: 'Today, 5:30 PM',  feeRupees: 500, status: 'pending' },
  { id: 'be3', customerName: 'Pooja Nair',   customerFlat: 'A-102', service: 'Threading + waxing',  scheduledAt: 'Tomorrow, 11 AM', feeRupees: 300, status: 'pending' },
  { id: 'be4', customerName: 'Lata Sharma',  customerFlat: 'C-204', service: 'Manicure + pedicure', scheduledAt: 'Yesterday',       feeRupees: 450, status: 'done' },
];

const SERVICES = ['Haircut', 'Facial', 'Threading', 'Waxing', 'Manicure', 'Pedicure', 'Blowdry', 'Hair colour'];

const STATUS_TONE: Record<AppointmentStatus, 'warning' | 'info' | 'success'> = {
  pending: 'warning', confirmed: 'info', done: 'success',
};

export default function BeauticianDashboard() {
  const router = useRouter();
  const beautician = usePeerStore((s) => s.roles.beautician);
  const activate = usePeerStore((s) => s.activate);
  const tier = useVerificationStore((s) => s.tier);

  const { orders: apiOrders } = usePeerOrders();

  const [online, setOnline] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>(APPOINTMENTS);
  const [services, setServices] = useState<Set<string>>(new Set(['Haircut', 'Facial', 'Threading']));

  useEffect(() => {
    if (apiOrders.length === 0) return;
    const mapped: Appointment[] = apiOrders.map((o) => ({
      id: o.id,
      customerName: o.buyer.name,
      customerFlat: '',
      service: o.listing?.title ?? 'Service',
      scheduledAt: new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      feeRupees: Math.round(o.amountPaise / 100),
      status: (o.status === 'completed' ? 'done' : o.status === 'in_progress' ? 'confirmed' : 'pending') as AppointmentStatus,
    }));
    setAppointments(mapped);
  }, [apiOrders]);

  if (!beautician.active) {
    return (
      <ActivateScreen
        title="Beautician"
        desc="Offer home salon services to neighbors — hair, skin, nails and more. Earn at your own schedule."
        canActivate={tier !== 'bronze'}
        onActivate={() => activate('beautician')}
      />
    );
  }

  const pending  = appointments.filter((a) => a.status === 'pending').length;
  const todayRupees = appointments.filter((a) => a.status === 'done').reduce((s, a) => s + a.feeRupees, 0);

  const advance = (id: string) =>
    setAppointments((arr) =>
      arr.map((a) => {
        if (a.id !== id) return a;
        const next: AppointmentStatus = a.status === 'pending' ? 'confirmed' : 'done';
        return { ...a, status: next };
      })
    );

  const toggleService = (svc: string) =>
    setServices((prev) => {
      const next = new Set(prev);
      next.has(svc) ? next.delete(svc) : next.add(svc);
      return next;
    });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Beautician" onBack={() => router.back()} />

      <View style={styles.statsStrip}>
        <Stat label="Pending"  value={pending} tint="#EC4899" />
        <Stat label="Services" value={services.size} tint="#8B5CF6" />
        <Stat label="₹ Today" value={todayRupees} tint={colors.brand[600]} prefix="₹" />
      </View>

      <View style={styles.toggleRow}>
        <HStack gap={2} align="center">
          <View style={[styles.dot, { backgroundColor: online ? '#10B981' : '#94A3B8' }]} />
          <Text variant="body" style={{ fontWeight: '700' }}>
            {online ? 'Accepting bookings' : 'Offline'}
          </Text>
        </HStack>
        <Switch
          value={online}
          onValueChange={setOnline}
          trackColor={{ true: colors.brand[600], false: colors.gray[300] }}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Service chips */}
        <Text variant="label" tone="secondary" style={{ textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: spacing[2] }}>
          My Services
        </Text>
        <View style={styles.chipWrap}>
          {SERVICES.map((svc) => {
            const on = services.has(svc);
            return (
              <Badge
                key={svc}
                label={svc}
                tone={on ? 'brand' : 'neutral'}
                onPress={() => toggleService(svc)}
              />
            );
          })}
        </View>

        <Text variant="label" tone="secondary" style={{ textTransform: 'uppercase', letterSpacing: 0.4, marginTop: spacing[4], marginBottom: spacing[2] }}>
          Appointments ({appointments.length})
        </Text>

        {appointments.map((a) => (
          <Card key={a.id} padding={4} elevation="xs" bordered style={{ marginBottom: spacing[3] }}>
            <HStack gap={3} align="center" style={{ marginBottom: spacing[2] }}>
              <View style={styles.avatar}>
                <Text style={{ fontWeight: '700', color: '#EC4899' }}>
                  {a.customerName.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                </Text>
              </View>
              <VStack gap={0.5} style={{ flex: 1 }}>
                <Text variant="body" style={{ fontWeight: '700' }}>{a.customerName}</Text>
                <Text variant="caption" tone="secondary">{a.customerFlat}</Text>
              </VStack>
              <Badge label={a.status.toUpperCase()} tone={STATUS_TONE[a.status]} />
            </HStack>
            <HStack gap={2} align="center" style={{ marginBottom: spacing[1] }}>
              <Scissors size={13} color={colors.surface.textSecondary} />
              <Text variant="caption" style={{ flex: 1 }}>{a.service}</Text>
              <Text variant="body" style={{ fontWeight: '700', color: '#EC4899' }}>₹{a.feeRupees}</Text>
            </HStack>
            <HStack gap={1.5} align="center" style={{ marginBottom: spacing[2] }}>
              <Clock size={13} color={colors.surface.textSecondary} />
              <Text variant="caption" tone="secondary">{a.scheduledAt}</Text>
            </HStack>
            {a.status !== 'done' && (
              <Button
                onPress={() => advance(a.id)}
                label={a.status === 'pending' ? 'Confirm Booking' : 'Mark Done'}
                fullWidth
              />
            )}
          </Card>
        ))}
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
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#EC489920', alignItems: 'center', justifyContent: 'center',
  },
});
