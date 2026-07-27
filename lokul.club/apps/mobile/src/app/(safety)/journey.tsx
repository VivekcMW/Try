/**
 * Safe Journey Screen
 * Route: /(safety)/journey
 *
 * States:
 *   idle    → setup form (destination, interval, watchers)
 *   active  → live journey view with check-in countdown
 *   arrived → success state
 */
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  MapPin,
  Navigation,
  UserCheck,
  Waypoints,
  X,
} from 'lucide-react-native';
import { HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { useSafetyStore, type ActiveJourney } from '@/store/safetyStore';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';
const INTERVALS = [15, 30, 60] as const;

function useCheckInCountdown(nextCheckInISO: string | undefined) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!nextCheckInISO) return;
    const update = () => {
      const diff = Math.max(0, Math.floor((new Date(nextCheckInISO).getTime() - Date.now()) / 1000));
      setSecs(diff);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [nextCheckInISO]);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return { secs, label: `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` };
}

function JourneySetup() {
  const contacts  = useSafetyStore((s) => s.contacts);
  const startJourney = useSafetyStore((s) => s.startJourney);
  const userId    = useWalletStore((s) => s.userId);

  const [destination, setDestination] = useState('');
  const [checkInterval, setCheckInterval] = useState<typeof INTERVALS[number]>(30);
  const [watchers,    setWatchers]    = useState<string[]>(contacts.slice(0, 3).map((c) => c.id));
  const [loading,     setLoading]     = useState(false);

  const toggleWatcher = (id: string) => {
    setWatchers((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const start = async () => {
    if (!destination.trim()) return;
    setLoading(true);
    let serverJourneyId = 'local-' + Date.now();
    try {
      const res  = await fetch(`${BASE}/api/mobile/safety/journey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', userId, destination, checkInIntervalMin: checkInterval }),
      });
      const data = await res.json();
      if (data.id) serverJourneyId = data.id;
    } catch { /* offline fallback */ }
    const now = Date.now();
    startJourney({
      id:                  serverJourneyId,
      destination:         destination.trim(),
      startedAt:           new Date(now).toISOString(),
      expectedArrival:     new Date(now + checkInterval * 60_000 * 2).toISOString(),
      checkInIntervalMin:  checkInterval,
      nextCheckIn:         new Date(now + checkInterval * 60_000).toISOString(),
      watcherIds:          watchers,
      status:              'active',
    });
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.setupScroll}>
      <VStack gap={4}>
        <VStack gap={2} style={styles.card}>
          <HStack gap={2} align="center">
            <MapPin size={16} color={colors.brand[600]} />
            <Text variant="label" style={{ fontWeight: '700', color: colors.surface.heading }}>Destination</Text>
          </HStack>
          <TextInput
            style={styles.input}
            placeholder="Where are you going?"
            placeholderTextColor={colors.surface.textSecondary}
            value={destination}
            onChangeText={setDestination}
            accessibilityLabel="Journey destination"
          />
        </VStack>

        <VStack gap={2} style={styles.card}>
          <HStack gap={2} align="center">
            <Clock size={16} color={colors.brand[600]} />
            <Text variant="label" style={{ fontWeight: '700', color: colors.surface.heading }}>Check-in every</Text>
          </HStack>
          <HStack gap={2}>
            {INTERVALS.map((i) => (
              <Pressable
                key={i}
                onPress={() => setCheckInterval(i)}
                style={[styles.intervalChip, checkInterval === i && styles.intervalChipActive]}
                accessibilityRole="radio"
                accessibilityState={{ checked: checkInterval === i }}
              >
                <Text style={[styles.chipText, checkInterval === i && styles.chipTextActive]}>
                  {i} min
                </Text>
              </Pressable>
            ))}
          </HStack>
          <Text variant="caption" tone="secondary">
            If you miss a check-in, your watchers will be alerted automatically.
          </Text>
        </VStack>

        {contacts.length > 0 && (
          <VStack gap={2} style={styles.card}>
            <HStack gap={2} align="center">
              <UserCheck size={16} color={colors.brand[600]} />
              <Text variant="label" style={{ fontWeight: '700', color: colors.surface.heading }}>Alert if I miss check-in</Text>
            </HStack>
            {contacts.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => toggleWatcher(c.id)}
                style={[styles.watcherRow, watchers.includes(c.id) && styles.watcherRowActive]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: watchers.includes(c.id) }}
              >
                <HStack gap={3} align="center">
                  <View style={[styles.checkbox, watchers.includes(c.id) && styles.checkboxActive]}>
                    {watchers.includes(c.id) && <CheckCircle size={14} color="#fff" />}
                  </View>
                  <VStack gap={0}>
                    <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>{c.name}</Text>
                    <Text variant="caption" tone="secondary">{c.phone}</Text>
                  </VStack>
                </HStack>
              </Pressable>
            ))}
          </VStack>
        )}

        <Pressable
          onPress={start}
          style={[styles.startBtn, (!destination || loading) && { opacity: 0.4 }]}
          disabled={!destination || loading}
          accessibilityRole="button"
        >
          <Navigation size={20} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>
            {loading ? 'Starting…' : 'Start Safe Journey'}
          </Text>
        </Pressable>
      </VStack>
    </ScrollView>
  );
}

function JourneyActive({ journey }: { readonly journey: ActiveJourney }) {
  const router      = useRouter();
  const bumpCheckIn = useSafetyStore((s) => s.bumpNextCheckIn);
  const endJourney  = useSafetyStore((s) => s.endJourney);
  const userId      = useWalletStore((s) => s.userId);
  const { secs, label } = useCheckInCountdown(journey.nextCheckIn);

  // Pulse animation on countdown near zero
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (secs > 60) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.04, duration: 500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
    return () => pulse.stopAnimation();
  }, [secs <= 60]);

  const checkIn = async () => {
    try {
      await fetch(`${BASE}/api/mobile/safety/journey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'checkin', journeyId: journey.id, userId }),
      });
    } catch { /* offline */ }
    bumpCheckIn();
  };

  const end = async () => {
    try {
      await fetch(`${BASE}/api/mobile/safety/journey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'end', journeyId: journey.id, userId }),
      });
    } catch { /* offline */ }
    endJourney();
    router.back();
  };

  const overdue = secs === 0;

  return (
    <VStack gap={4} style={styles.setupScroll}>
      {/* Destination */}
      <View style={styles.card}>
        <HStack gap={3} align="center">
          <Navigation size={20} color={colors.brand[600]} />
          <VStack gap={0} style={{ flex: 1 }}>
            <Text variant="caption" tone="secondary">Travelling to</Text>
            <Text variant="body" style={{ fontWeight: '800', color: colors.surface.heading }}>{journey.destination}</Text>
          </VStack>
        </HStack>
      </View>

      {/* Countdown */}
      <Animated.View style={[styles.countdownCard, overdue && styles.countdownOverdue, { transform: [{ scale: pulse }] }]}>
        <Text style={[styles.countdownLabel, overdue && { color: '#fff' }]}>
          {overdue ? 'CHECK-IN OVERDUE' : 'Next check-in in'}
        </Text>
        <Text style={[styles.countdownTime, overdue && { color: '#fff' }]}>
          {overdue ? 'Tap NOW' : label}
        </Text>
        {overdue && (
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
            Your contacts will be alerted in 30 seconds
          </Text>
        )}
      </Animated.View>

      {/* Check-in button */}
      <Pressable
        onPress={checkIn}
        style={styles.checkInBtn}
        accessibilityRole="button"
        accessibilityLabel="I am safe — check in"
      >
        <CheckCircle size={24} color="#fff" />
        <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18 }}>I AM SAFE</Text>
      </Pressable>

      {/* End journey */}
      <Pressable
        onPress={end}
        style={styles.endBtn}
        accessibilityRole="button"
      >
        <X size={16} color={colors.surface.textSecondary} />
        <Text style={{ color: colors.surface.textSecondary, fontWeight: '700' }}>End Journey</Text>
      </Pressable>
    </VStack>
  );
}

export default function JourneyScreen() {
  const router  = useRouter();
  const journey = useSafetyStore((s) => s.journey);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <HStack gap={3} align="center" style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn} accessibilityRole="button">
          <ArrowLeft size={22} color={colors.surface.heading} />
        </Pressable>
        <HStack gap={2} align="center" style={{ flex: 1 }}>
          <Waypoints size={20} color={colors.brand[600]} />
          <Text variant="body" style={{ fontWeight: '800', color: colors.surface.heading }}>
            Safe Journey
          </Text>
        </HStack>
      </HStack>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing[16] }}>
        {journey?.status === 'active'
          ? <JourneyActive journey={journey} />
          : <JourneySetup />
        }
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  header:     { paddingHorizontal: spacing[4], paddingVertical: spacing[3], backgroundColor: colors.surface.background, borderBottomWidth: 1, borderBottomColor: colors.surface.border },
  backBtn:    { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center' },
  setupScroll:{ padding: spacing[4], gap: spacing[3] },
  card:       { backgroundColor: colors.surface.background, borderRadius: radius.xl, padding: spacing[4] },
  input:      { borderWidth: 1, borderColor: colors.surface.border, borderRadius: radius.lg, padding: spacing[3], fontSize: 15, color: colors.surface.heading },

  intervalChip:      { flex: 1, paddingVertical: spacing[3], borderRadius: radius.lg, backgroundColor: colors.gray[100], alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  intervalChipActive:{ backgroundColor: `${colors.brand[600]}10`, borderColor: colors.brand[600] },
  chipText:          { fontSize: 14, fontWeight: '700', color: colors.surface.textSecondary },
  chipTextActive:    { color: colors.brand[600] },

  watcherRow:       { padding: spacing[3], borderRadius: radius.lg, borderWidth: 1, borderColor: colors.surface.border },
  watcherRowActive: { borderColor: colors.brand[600], backgroundColor: `${colors.brand[600]}05` },
  checkbox:         { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.gray[300], alignItems: 'center', justifyContent: 'center' },
  checkboxActive:   { backgroundColor: colors.brand[600], borderColor: colors.brand[600] },

  startBtn: { backgroundColor: colors.brand[600], borderRadius: radius.xl, paddingVertical: spacing[4], flexDirection: 'row', gap: spacing[2], alignItems: 'center', justifyContent: 'center' },

  countdownCard:    { backgroundColor: colors.surface.background, borderRadius: radius.xl, padding: spacing[6], alignItems: 'center', gap: spacing[2], borderWidth: 2, borderColor: colors.surface.border },
  countdownOverdue: { backgroundColor: '#DC2626', borderColor: '#DC2626' },
  countdownLabel:   { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: colors.surface.textSecondary },
  countdownTime:    { fontSize: 52, fontWeight: '900', color: colors.surface.heading },

  checkInBtn: { backgroundColor: '#059669', borderRadius: radius.xl, paddingVertical: spacing[5], flexDirection: 'row', gap: spacing[3], alignItems: 'center', justifyContent: 'center', shadowColor: '#059669', shadowOpacity: 0.35, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, elevation: 8 },
  endBtn:     { flexDirection: 'row', gap: spacing[2], alignItems: 'center', justifyContent: 'center', paddingVertical: spacing[3] },
});
