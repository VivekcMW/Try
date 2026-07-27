import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Clock, Heart } from 'lucide-react-native';
import { Badge, Button, Card, HStack, Text, VStack } from '@/components/ui';
import { usePeerStore } from '@/store/peerRoleStore';
import { useVerificationStore } from '@/store/verificationStore';
import { usePeerOrders } from '@/hooks/usePeerOrders';
import { colors, spacing } from '@lokul/ui-tokens';
import { ActivateScreen, Header, Stat } from './cook';

type CareStatus = 'pending' | 'confirmed' | 'active' | 'completed';

interface CareRequest {
  id: string;
  familyName: string;
  flat: string;
  careType: 'Pet Sitting' | 'Babysitting' | 'Elder Care';
  description: string;
  scheduledAt: string;
  durationHrs: number;
  feeRupees: number;
  status: CareStatus;
}

const REQUESTS: CareRequest[] = [
  { id: 'ck1', familyName: 'Sharma family', flat: 'A-401', careType: 'Pet Sitting',  description: 'Golden retriever, 2 days',   scheduledAt: 'Today, 8:00 PM',  durationHrs: 48, feeRupees: 800,  status: 'pending' },
  { id: 'ck2', familyName: 'Joshi family',  flat: 'B-201', careType: 'Babysitting',  description: '3-yr-old, 3 hrs',            scheduledAt: 'Today, 6:00 PM',  durationHrs: 3,  feeRupees: 300,  status: 'confirmed' },
  { id: 'ck3', familyName: 'Desai family',  flat: 'A-305', careType: 'Elder Care',   description: 'Morning routine, daily',     scheduledAt: 'Tomorrow, 7 AM',  durationHrs: 2,  feeRupees: 250,  status: 'pending' },
  { id: 'ck4', familyName: 'Mehta family',  flat: 'C-102', careType: 'Pet Sitting',  description: 'Two cats, weekend',          scheduledAt: 'Last weekend',    durationHrs: 24, feeRupees: 500,  status: 'completed' },
];

const CARE_TINT: Record<CareRequest['careType'], string> = {
  'Pet Sitting': '#F59E0B', 'Babysitting': '#EC4899', 'Elder Care': '#14B8A6',
};

const STATUS_TONE: Record<CareStatus, 'warning' | 'info' | 'brand' | 'success'> = {
  pending: 'warning', confirmed: 'info', active: 'brand', completed: 'success',
};

const NEXT_ACTION: Partial<Record<CareStatus, string>> = {
  pending: 'Accept', confirmed: 'Start Care', active: 'Mark Completed',
};

export default function CaretakerDashboard() {
  const router = useRouter();
  const caretaker = usePeerStore((s) => s.roles.caretaker);
  const activate = usePeerStore((s) => s.activate);
  const tier = useVerificationStore((s) => s.tier);

  const { orders: apiOrders } = usePeerOrders();

  const [online, setOnline] = useState(true);
  const [requests, setRequests] = useState<CareRequest[]>(REQUESTS);
  const [careTypes, setCareTypes] = useState<Set<string>>(
    new Set(['Pet Sitting', 'Babysitting', 'Elder Care'])
  );

  useEffect(() => {
    if (apiOrders.length === 0) return;
    const mapped: CareRequest[] = apiOrders.map((o) => ({
      id: o.id,
      familyName: o.buyer.name,
      flat: '',
      careType: 'Pet Sitting' as CareRequest['careType'],
      description: o.listing?.title ?? 'Care request',
      scheduledAt: new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      durationHrs: 1,
      feeRupees: Math.round(o.amountPaise / 100),
      status: (o.status === 'completed' ? 'completed' : o.status === 'in_progress' ? 'active' : o.status === 'accepted' ? 'confirmed' : 'pending') as CareStatus,
    }));
    setRequests(mapped);
  }, [apiOrders]);

  if (!caretaker.active) {
    return (
      <ActivateScreen
        title="Caretaker"
        desc="Offer trusted pet sitting, babysitting, and elder care services to your neighbors."
        canActivate={tier !== 'bronze'}
        onActivate={() => activate('caretaker')}
      />
    );
  }

  const pending   = requests.filter((r) => r.status === 'pending').length;
  const active    = requests.filter((r) => r.status === 'active').length;
  const todayRupees = requests.filter((r) => r.status === 'completed').reduce((s, r) => s + r.feeRupees, 0);

  const advance = (id: string) =>
    setRequests((arr) =>
      arr.map((r) => {
        if (r.id !== id) return r;
        let next: CareStatus;
        if (r.status === 'pending') next = 'confirmed';
        else if (r.status === 'confirmed') next = 'active';
        else next = 'completed';
        return { ...r, status: next };
      })
    );

  const toggleType = (type: string) =>
    setCareTypes((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Caretaker" onBack={() => router.back()} />

      <View style={styles.statsStrip}>
        <Stat label="Pending"  value={pending} tint="#F97316" />
        <Stat label="Active"   value={active}  tint="#F59E0B" />
        <Stat label="₹ Today" value={todayRupees} tint={colors.brand[600]} prefix="₹" />
      </View>

      <View style={styles.toggleRow}>
        <HStack gap={2} align="center">
          <View style={[styles.dot, { backgroundColor: online ? '#10B981' : '#94A3B8' }]} />
          <Text variant="body" style={{ fontWeight: '700' }}>
            {online ? 'Available for care' : 'Offline'}
          </Text>
        </HStack>
        <Switch
          value={online}
          onValueChange={setOnline}
          trackColor={{ true: colors.brand[600], false: colors.gray[300] }}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Care type chips */}
        <Text variant="label" tone="secondary" style={{ textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: spacing[2] }}>
          I Offer
        </Text>
        <View style={styles.chipWrap}>
          {(['Pet Sitting', 'Babysitting', 'Elder Care'] as const).map((type) => {
            const on = careTypes.has(type);
            return (
              <Badge
                key={type}
                label={type}
                tone={on ? 'brand' : 'neutral'}
                onPress={() => toggleType(type)}
              />
            );
          })}
        </View>

        <Text variant="label" tone="secondary" style={{ textTransform: 'uppercase', letterSpacing: 0.4, marginTop: spacing[4], marginBottom: spacing[2] }}>
          Requests ({requests.length})
        </Text>

        {requests.map((r) => {
          const action = NEXT_ACTION[r.status];
          const tint = CARE_TINT[r.careType];
          return (
            <Card key={r.id} padding={4} elevation="xs" bordered style={{ marginBottom: spacing[3] }}>
              <HStack gap={3} align="center" style={{ marginBottom: spacing[2] }}>
                <View style={[styles.avatar, { backgroundColor: tint + '20' }]}>
                  <Text style={{ fontWeight: '700', color: tint }}>
                    {r.familyName.split(' ')[0][0]}
                  </Text>
                </View>
                <VStack gap={0.5} style={{ flex: 1 }}>
                  <Text variant="body" style={{ fontWeight: '700' }}>{r.familyName}</Text>
                  <Text variant="caption" tone="secondary">{r.flat}</Text>
                </VStack>
                <Badge label={r.status.toUpperCase()} tone={STATUS_TONE[r.status]} />
              </HStack>
              <HStack gap={2} align="center" style={{ marginBottom: spacing[1] }}>
                <Heart size={13} color={tint} />
                <Text variant="caption" style={{ flex: 1, color: tint, fontWeight: '600' }}>{r.careType}</Text>
                <Text variant="body" style={{ fontWeight: '700', color: tint }}>₹{r.feeRupees}</Text>
              </HStack>
              <Text variant="caption" tone="secondary" style={{ marginBottom: spacing[1] }}>{r.description}</Text>
              <HStack gap={1.5} align="center" style={{ marginBottom: action ? spacing[2] : 0 }}>
                <Clock size={13} color={colors.surface.textSecondary} />
                <Text variant="caption" tone="secondary">{r.scheduledAt} · {r.durationHrs}h</Text>
              </HStack>
              {!!action && (
                <Button onPress={() => advance(r.id)} label={action} fullWidth />
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
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
});
