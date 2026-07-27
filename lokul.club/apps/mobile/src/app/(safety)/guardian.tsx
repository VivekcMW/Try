import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Linking,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  RefreshCw,
  Shield,
} from 'lucide-react-native';
import { Avatar, HStack, Text, VStack } from '@/components/ui';
import { PlusGate } from '@/components/PlusGate';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type JourneyStatus = 'active' | 'arrived' | 'overdue' | 'cancelled';

type Journey = {
  id: string;
  travelerName: string;
  travelerPhone: string;
  origin: string;
  destination: string;
  startedAt: string;
  expectedArrival: string;
  lastPingAt: string | null;
  lastLat: number | null;
  lastLng: number | null;
  status: JourneyStatus;
  guardianNote: string;
};

/** Mock journey — replaced by real API call when journey ID is provided */
const MOCK_JOURNEY: Journey = {
  id: 'journey-001',
  travelerName: 'Priya Sharma',
  travelerPhone: '+919876543210',
  origin: 'Aundh Residency, Gate 2',
  destination: 'Baner Metro Station',
  startedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),  // 18 min ago
  expectedArrival: new Date(Date.now() + 7 * 60 * 1000).toISOString(),
  lastPingAt: new Date(Date.now() - 90 * 1000).toISOString(),       // 1.5 min ago
  lastLat: 18.5563,
  lastLng: 73.8084,
  status: 'active',
  guardianNote: 'Please check in every 5 minutes.',
};

function formatDuration(ms: number) {
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

const STATUS_META: Record<JourneyStatus, { label: string; color: string; bg: string }> = {
  active:    { label: 'En route',  color: colors.semantic.success,  bg: '#D1FAE5' },
  arrived:   { label: 'Arrived',   color: colors.semantic.success,  bg: '#D1FAE5' },
  overdue:   { label: 'Overdue',   color: colors.semantic.danger,   bg: '#FEE2E2' },
  cancelled: { label: 'Cancelled', color: colors.surface.textSecondary, bg: colors.gray[100] },
};

export default function GuardianScreen() {
  const router   = useRouter();
  const userId   = useWalletStore((s) => s.userId);
  const { journeyId } = useLocalSearchParams<{ journeyId: string }>();

  const [journey,     setJourney]     = useState<Journey | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [elapsed,     setElapsed]     = useState(0);          // ms since start
  const [lastPingAgo, setLastPingAgo] = useState(0);          // ms since last ping
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pulse animation for the "live" indicator
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.25, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 800, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Load journey data
  const loadJourney = useCallback(async () => {
    const id = journeyId ?? 'journey-001';
    try {
      const res = await fetch(`${BASE}/api/mobile/safety/journey/${id}`);
      if (res.ok) {
        const data = await res.json();
        setJourney(data);
      } else {
        setJourney(MOCK_JOURNEY);
      }
    } catch {
      setJourney(MOCK_JOURNEY);
    } finally {
      setLoading(false);
    }
  }, [journeyId]);

  useEffect(() => {
    loadJourney();
  }, [loadJourney]);

  // Clock tick
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (!journey) return;
      setElapsed(Date.now() - new Date(journey.startedAt).getTime());
      setLastPingAgo(journey.lastPingAt ? Date.now() - new Date(journey.lastPingAt).getTime() : 0);
    }, 5_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [journey]);

  // Initialise on first load
  useEffect(() => {
    if (!journey) return;
    setElapsed(Date.now() - new Date(journey.startedAt).getTime());
    setLastPingAgo(journey.lastPingAt ? Date.now() - new Date(journey.lastPingAt).getTime() : 0);
  }, [journey]);

  const handleCallTraveler = () => {
    if (!journey) return;
    Linking.openURL(`tel:${journey.travelerPhone}`);
  };

  const handleTriggerAlert = () => {
    Alert.alert(
      'Trigger emergency alert?',
      `This will send an SOS on behalf of ${journey?.travelerName ?? 'the traveler'} to nearby responders.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send alert',
          style: 'destructive',
          onPress: async () => {
            if (!journey) return;
            try {
              await fetch(`${BASE}/api/mobile/sos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  authorId: userId,
                  pinCode: '000000',
                  category: 'women_safety',
                  severity: 'high',
                  body: `Guardian alert: ${journey.travelerName} is overdue on their journey to ${journey.destination}.`,
                  lat: journey.lastLat,
                  lng: journey.lastLng,
                }),
              });
              Alert.alert('Alert sent', 'Nearby responders have been notified.');
            } catch {
              Alert.alert('Error', 'Could not send alert. Please call 112 directly.');
            }
          },
        },
      ],
    );
  };

  if (loading || !journey) {
    return (
      <PlusGate feature="guardian_live_map" title="Guardian Live Map" subtitle="Track a loved one's journey in real-time with Lokul Plus.">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="body" tone="secondary">Loading journey…</Text>
        </View>
      </SafeAreaView>
      </PlusGate>
    );
  }

  const statusMeta = STATUS_META[journey.status];
  const isOverdue  = journey.status === 'overdue';
  const isArrived  = journey.status === 'arrived';
  const minutesLeft = Math.floor(
    (new Date(journey.expectedArrival).getTime() - Date.now()) / 60_000,
  );

  return (
    <PlusGate feature="guardian_live_map" title="Guardian Live Map" subtitle="Track a loved one's journey in real-time with Lokul Plus.">
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <HStack gap={3} align="center" style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back">
          <ArrowLeft size={22} color={colors.surface.heading} />
        </Pressable>
        <VStack gap={0} style={{ flex: 1 }}>
          <Text variant="h3" style={{ color: colors.surface.heading, fontWeight: '700' }}>
            Guardian view
          </Text>
          <Text variant="caption" tone="secondary">Live journey tracking</Text>
        </VStack>
        <Pressable
          onPress={loadJourney}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Refresh"
        >
          <RefreshCw size={18} color={colors.surface.textSecondary} />
        </Pressable>
      </HStack>

      <View style={styles.scroll}>
        {/* Status hero card */}
        <View style={[styles.heroCard, isOverdue && styles.heroCardDanger]}>
          {/* Live dot */}
          {!isArrived && (
            <HStack gap={1.5} align="center" style={{ marginBottom: spacing[3] }}>
              <Animated.View
                style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]}
              />
              <Text variant="caption" style={{ color: isOverdue ? colors.semantic.danger : colors.semantic.success, fontWeight: '700' }}>
                {isOverdue ? 'OVERDUE' : 'LIVE'}
              </Text>
            </HStack>
          )}

          {/* Status pill + traveler */}
          <HStack gap={3} align="center">
            <Avatar name={journey.travelerName} size="lg" />
            <VStack gap={1} style={{ flex: 1 }}>
              <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
                {journey.travelerName}
              </Text>
              <View style={[styles.statusPill, { backgroundColor: statusMeta.bg }]}>
                <Text variant="caption" style={{ color: statusMeta.color, fontWeight: '700' }}>
                  {statusMeta.label}
                </Text>
              </View>
            </VStack>
            {isArrived && <CheckCircle size={30} color={colors.semantic.success} />}
            {isOverdue  && <AlertTriangle size={30} color={colors.semantic.danger} />}
          </HStack>

          {/* Journey route */}
          <View style={styles.routeCard}>
            <HStack gap={2} align="center">
              <View style={styles.originDot} />
              <Text variant="body" style={{ flex: 1, color: colors.surface.heading }}>
                {journey.origin}
              </Text>
            </HStack>
            <View style={styles.routeLine} />
            <HStack gap={2} align="center">
              <MapPin size={14} color={colors.brand[600]} />
              <Text variant="body" style={{ flex: 1, color: colors.surface.heading }}>
                {journey.destination}
              </Text>
            </HStack>
          </View>
        </View>

        {/* Time stats */}
        <View style={styles.statsRow}>
          <StatBox
            icon={<Clock size={16} color={colors.brand[600]} />}
            label="Elapsed"
            value={formatDuration(elapsed)}
          />
          <StatBox
            icon={<Clock size={16} color={isOverdue ? colors.semantic.danger : colors.surface.textSecondary} />}
            label={minutesLeft > 0 ? 'ETA in' : 'Overdue by'}
            value={minutesLeft > 0 ? `${minutesLeft}m` : `${Math.abs(minutesLeft)}m`}
            danger={minutesLeft <= 0}
          />
          <StatBox
            icon={<Shield size={16} color={lastPingAgo > 5 * 60_000 ? colors.semantic.danger : colors.semantic.success} />}
            label="Last ping"
            value={lastPingAgo > 0 ? formatDuration(lastPingAgo) + ' ago' : '—'}
            danger={lastPingAgo > 5 * 60_000}
          />
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading, marginBottom: spacing[3] }}>
            Journey timeline
          </Text>
          <TimelineRow icon="🚶" label="Journey started" time={formatTime(journey.startedAt)} />
          {journey.lastPingAt && (
            <TimelineRow icon="📍" label="Last location ping" time={formatTime(journey.lastPingAt)} />
          )}
          <TimelineRow
            icon={isArrived ? '✅' : '🏁'}
            label="Expected arrival"
            time={formatTime(journey.expectedArrival)}
            muted={!isArrived}
          />
        </View>

        {/* Guardian note */}
        {!!journey.guardianNote && (
          <View style={styles.noteCard}>
            <Text variant="caption" style={{ fontWeight: '700', color: colors.surface.heading, marginBottom: spacing[1] }}>
              Note from traveler
            </Text>
            <Text variant="body" tone="secondary">{journey.guardianNote}</Text>
          </View>
        )}

        {/* Actions */}
        {!isArrived && !journey.status.includes('cancelled') && (
          <VStack gap={3} style={styles.actions}>
            <Pressable
              onPress={handleCallTraveler}
              style={({ pressed }) => [styles.callBtn, pressed && { opacity: 0.85 }]}
              accessibilityRole="button"
            >
              <Phone size={20} color="#fff" />
              <Text variant="body" style={{ color: '#fff', fontWeight: '700' }}>
                Call {journey.travelerName.split(' ')[0]}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleTriggerAlert}
              style={({ pressed }) => [styles.alertBtn, pressed && { opacity: 0.85 }]}
              accessibilityRole="button"
            >
              <AlertTriangle size={20} color={colors.semantic.danger} />
              <Text variant="body" style={{ color: colors.semantic.danger, fontWeight: '700' }}>
                Trigger emergency alert
              </Text>
            </Pressable>
          </VStack>
        )}

        {isArrived && (
          <View style={styles.arrivedBanner}>
            <CheckCircle size={22} color={colors.semantic.success} />
            <Text variant="body" style={{ color: colors.semantic.success, fontWeight: '700' }}>
              {journey.travelerName.split(' ')[0]} has arrived safely!
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
    </PlusGate>
  );
}

function StatBox({
  icon, label, value, danger,
}: {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly value: string;
  readonly danger?: boolean;
}) {
  return (
    <View style={styles.statBox}>
      {icon}
      <Text variant="caption" tone="secondary" style={{ marginTop: spacing[1] }}>{label}</Text>
      <Text
        variant="body"
        style={{ fontWeight: '700', color: danger ? colors.semantic.danger : colors.surface.heading }}
      >
        {value}
      </Text>
    </View>
  );
}

function TimelineRow({
  icon, label, time, muted,
}: {
  readonly icon: string;
  readonly label: string;
  readonly time: string;
  readonly muted?: boolean;
}) {
  return (
    <HStack gap={3} align="center" style={{ marginBottom: spacing[3] }}>
      <Text style={{ fontSize: 18 }}>{icon}</Text>
      <Text
        variant="body"
        style={{ flex: 1, color: muted ? colors.surface.textSecondary : colors.surface.heading }}
      >
        {label}
      </Text>
      <Text variant="caption" tone="secondary">{time}</Text>
    </HStack>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface.background,
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.border,
  },
  scroll: {
    flex: 1,
    padding: spacing[4],
    gap: spacing[4],
  },
  heroCard: {
    backgroundColor: colors.surface.surfaceMuted,
    borderRadius: radius.xl,
    padding: spacing[4],
  },
  heroCardDanger: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.semantic.success,
  },
  statusPill: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
  },
  routeCard: {
    marginTop: spacing[4],
    backgroundColor: colors.surface.background,
    borderRadius: radius.lg,
    padding: spacing[3],
    gap: 0,
  },
  originDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.brand[600],
    marginLeft: 2,
  },
  routeLine: {
    height: 16,
    width: 1,
    backgroundColor: colors.surface.border,
    marginLeft: spacing[1] + 4,
    marginVertical: spacing[1],
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface.surfaceMuted,
    borderRadius: radius.lg,
    padding: spacing[3],
    alignItems: 'center',
    gap: 2,
  },
  section: {
    backgroundColor: colors.surface.surfaceMuted,
    borderRadius: radius.xl,
    padding: spacing[4],
  },
  noteCard: {
    backgroundColor: '#FEF9C3',
    borderRadius: radius.lg,
    padding: spacing[3],
  },
  actions: {
    paddingBottom: spacing[6],
  },
  callBtn: {
    flexDirection: 'row',
    gap: spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand[600],
    borderRadius: radius.lg,
    paddingVertical: spacing[4],
  },
  alertBtn: {
    flexDirection: 'row',
    gap: spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: radius.lg,
    paddingVertical: spacing[4],
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  arrivedBanner: {
    flexDirection: 'row',
    gap: spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D1FAE5',
    borderRadius: radius.lg,
    padding: spacing[4],
    marginBottom: spacing[6],
  },
});
