// Generic role dashboard — shared by all new peer roles.
// Each role screen imports this and passes its PeerRole key.
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Clock } from 'lucide-react-native';
import { Badge, Button, Card, HStack, Text, VStack } from '@/components/ui';
import { ROLE_META, usePeerStore, type PeerRole } from '@/store/peerRoleStore';
import { useVerificationStore } from '@/store/verificationStore';
import { usePeerOrders } from '@/hooks/usePeerOrders';
import { colors, spacing } from '@lokul/ui-tokens';
import { ActivateScreen, Header, Stat } from './cook';

type BookingStatus = 'pending' | 'confirmed' | 'done';

interface GenericBooking {
  id: string;
  customerName: string;
  service: string;
  scheduledAt: string;
  feeRupees: number;
  status: BookingStatus;
}

const STATUS_TONE: Record<BookingStatus, 'warning' | 'info' | 'success'> = {
  pending: 'warning',
  confirmed: 'info',
  done: 'success',
};

const NEXT_ACTION: Partial<Record<BookingStatus, string>> = {
  pending: 'Accept',
  confirmed: 'Mark Done',
};

interface Props {
  readonly role: PeerRole;
}

export function GenericRoleDashboard({ role }: Props) {
  const router    = useRouter();
  const meta      = ROLE_META[role];
  const roleState = usePeerStore((s) => s.roles[role]);
  const activate  = usePeerStore((s) => s.activate);
  const tier      = useVerificationStore((s) => s.tier);
  const { orders: apiOrders } = usePeerOrders();

  const [online, setOnline]     = useState(true);
  const [bookings, setBookings] = useState<GenericBooking[]>([]);

  useEffect(() => {
    if (apiOrders.length === 0) return;
    setBookings(
      apiOrders.map((o) => ({
        id: o.id,
        customerName: o.buyer.name,
        service: o.listing?.title ?? 'Booking',
        scheduledAt: new Date(o.createdAt).toLocaleString('en-IN', {
          dateStyle: 'short',
          timeStyle: 'short',
        }),
        feeRupees: Math.round(o.amountPaise / 100),
        status: (
          o.status === 'completed' ? 'done' :
          o.status === 'accepted'  ? 'confirmed' : 'pending'
        ) as BookingStatus,
      }))
    );
  }, [apiOrders]);

  if (!roleState.active) {
    return (
      <ActivateScreen
        title={meta.label}
        desc={meta.tagline}
        canActivate={tier !== 'bronze'}
        onActivate={() => activate(role)}
      />
    );
  }

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title={meta.label} subtitle={`${meta.emoji}  ${meta.tagline}`} onBack={() => router.back()} />

      {/* Stats row */}
      <View style={styles.stats}>
        <Stat
          label="Earnings"
          value={`₹${(roleState.earningsPaise / 100).toLocaleString('en-IN')}`}
          tint={meta.tint}
        />
        <Stat label="Completed" value={roleState.completedOrders} tint={meta.tint} />
        <Stat
          label="Rating"
          value={roleState.rating > 0 ? roleState.rating.toFixed(1) : '—'}
          tint={meta.tint}
        />
      </View>

      {/* Available toggle */}
      <View style={styles.toggleRow}>
        <VStack gap={0.5}>
          <Text variant="body" style={{ fontWeight: '600' }}>
            {online ? 'Available for bookings' : 'Offline'}
          </Text>
          <Text variant="caption" tone="secondary">
            {online
              ? `${pendingCount} new request${pendingCount !== 1 ? 's' : ''}`
              : 'Not visible to neighbors'}
          </Text>
        </VStack>
        <Switch
          value={online}
          onValueChange={setOnline}
          thumbColor="#fff"
          trackColor={{ false: colors.surface.border, true: meta.tint }}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {bookings.length === 0 ? (
          <Card padding={4} elevation="none" style={styles.empty}>
            <Text style={{ fontSize: 32, textAlign: 'center' }}>{meta.emoji}</Text>
            <Text variant="caption" tone="secondary" style={{ textAlign: 'center', marginTop: 8 }}>
              No bookings yet.{'\n'}Share your profile to start earning!
            </Text>
          </Card>
        ) : (
          <VStack gap={3}>
            {bookings.map((b) => (
              <Card key={b.id} padding={4} elevation="xs" bordered>
                <VStack gap={2}>
                  <HStack gap={2} align="center" style={{ justifyContent: 'space-between' }}>
                    <Text variant="body" style={{ fontWeight: '700' }}>{b.customerName}</Text>
                    <Badge
                      label={b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                      tone={STATUS_TONE[b.status]}
                    />
                  </HStack>
                  <Text variant="caption" tone="secondary">{b.service}</Text>
                  <HStack gap={2} align="center" style={{ justifyContent: 'space-between' }}>
                    <HStack gap={1} align="center">
                      <Clock size={12} color={colors.surface.textSecondary} />
                      <Text variant="caption" tone="secondary">{b.scheduledAt}</Text>
                    </HStack>
                    <Text variant="caption" style={{ fontWeight: '700', color: meta.tint }}>
                      ₹{b.feeRupees}
                    </Text>
                  </HStack>
                  {NEXT_ACTION[b.status] !== undefined && (
                    <Button
                      size="sm"
                      label={NEXT_ACTION[b.status]!}
                      onPress={() =>
                        setBookings((prev) =>
                          prev.map((x) =>
                            x.id === b.id
                              ? { ...x, status: b.status === 'pending' ? 'confirmed' : 'done' }
                              : x
                          )
                        )
                      }
                    />
                  )}
                </VStack>
              </Card>
            ))}
          </VStack>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  stats: {
    flexDirection: 'row',
    backgroundColor: colors.surface.background,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surface.border,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.surface.background,
    marginTop: spacing[2],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surface.border,
  },
  scroll: { padding: spacing[4], paddingBottom: spacing[10] },
  empty: { alignItems: 'center', marginTop: spacing[8] },
});

// Expo Router requires a default export for every file inside app/.
// This component is used programmatically by peer role screens, not navigated to directly.
export default GenericRoleDashboard;
