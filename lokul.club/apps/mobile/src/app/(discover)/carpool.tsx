// PRD §09 — Carpool listings (real API)
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Clock, MapPin, Plus, Users } from 'lucide-react-native';
import { Badge, Button, Card, HStack, Text, VStack } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type ApiTrip = {
  id: string;
  fromLabel: string;
  toLabel: string;
  departureAt: string;
  seatsTotal: number;
  seatsLeft: number;
  pricePaise: number;
  status: string;
  notes: string | null;
  driver: { id: string; name: string; avatarUrl: string | null; kycTier: string };
  _count: { joins: number };
};

export default function CarpoolScreen() {
  const router   = useRouter();
  const pinCode  = useOnboardingStore((s) => s.pin);
  const userId   = useWalletStore((s) => s.userId);
  const [trips,   setTrips]   = useState<ApiTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Try to get device location for proximity-sorted results
  useEffect(() => {
    (async () => {
      try {
        const ExpoLocation = require('expo-location');
        const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await ExpoLocation.getCurrentPositionAsync({});
          setUserCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        }
      } catch { /* noop */ }
    })();
  }, []);

  const load = useCallback(async () => {
    if (!pinCode) return;
    setLoading(true);
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 8000);
    try {
      let url = `${BASE}/api/mobile/carpool?pinCode=${pinCode}`;
      if (userCoords) url += `&lat=${userCoords.lat}&lng=${userCoords.lng}&radiusKm=15`;
      const res  = await fetch(url, { signal: ctrl.signal });
      const data = await res.json();
      setTrips(Array.isArray(data?.items) ? data.items : []);
    } catch {
      setTrips([]);
    } finally {
      clearTimeout(to);
      setLoading(false);
    }
  }, [pinCode, userCoords]);

  useEffect(() => { load(); }, [load]);

  async function handleJoin(tripId: string) {
    if (!userId) return;
    setJoining(tripId);
    try {
      const res = await fetch(`${BASE}/api/mobile/carpool/${tripId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passengerId: userId, seats: 1 }),
      });
      if (!res.ok) { Alert.alert('Join failed', 'Could not join this trip.'); return; }
      load();
    } catch { Alert.alert('Network error', 'Please try again.'); } finally {
      setJoining(null);
    }
  }

  async function handleLeave(tripId: string) {
    if (!userId) return;
    setJoining(tripId);
    try {
      const res = await fetch(`${BASE}/api/mobile/carpool/${tripId}/join`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passengerId: userId }),
      });
      if (!res.ok) { Alert.alert('Leave failed', 'Could not leave this trip.'); return; }
      load();
    } catch { Alert.alert('Network error', 'Please try again.'); } finally {
      setJoining(null);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>Carpool</Text>
        <Pressable onPress={() => router.push('/(discover)/carpool-create' as never)} hitSlop={10} style={styles.iconBtn}>
          <Plus size={22} color={colors.brand[700]} />
        </Pressable>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.brand[600]} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <VStack gap={3}>
            {trips.map((t) => (
              <TripCard
                key={t.id}
                t={t}
                isDriver={t.driver.id === userId}
                loading={joining === t.id}
                onJoin={() => handleJoin(t.id)}
                onLeave={() => handleLeave(t.id)}
              />
            ))}
            {trips.length === 0 && (
              <Text variant="body" tone="secondary" style={{ textAlign: 'center', padding: spacing[10] }}>
                No carpools available in your area yet.
              </Text>
            )}
          </VStack>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function TripCard({
  t, isDriver, loading, onJoin, onLeave,
}: {
  t: ApiTrip;
  isDriver: boolean;
  loading: boolean;
  onJoin: () => void;
  onLeave: () => void;
}) {
  const full  = t.seatsLeft === 0;
  const dep   = new Date(t.departureAt);
  const depStr = dep.toLocaleString('en-IN', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
  const cost  = (t.pricePaise / 100).toLocaleString('en-IN');

  return (
    <Card padding={4} elevation="xs" bordered>
      <HStack justify="between" align="center">
        <Text variant="body" style={{ fontWeight: '800', color: colors.surface.heading, flex: 1 }}>{t.fromLabel}</Text>
        <Text variant="h3" style={{ fontWeight: '800', color: colors.brand[700] }}>
          ₹{cost}<Text variant="caption" tone="secondary">/seat</Text>
        </Text>
      </HStack>
      <HStack gap={1.5} align="center" style={{ marginTop: spacing[1] }}>
        <MapPin size={13} color={colors.surface.textSecondary} />
        <Text variant="caption" tone="secondary" style={{ flex: 1 }} numberOfLines={1}>→ {t.toLabel}</Text>
      </HStack>

      <HStack gap={3} align="center" style={{ marginTop: spacing[3] }}>
        <HStack gap={1} align="center">
          <Clock size={13} color={colors.surface.textSecondary} />
          <Text variant="caption" tone="secondary">{depStr}</Text>
        </HStack>
        <HStack gap={1} align="center">
          <Users size={13} color={colors.surface.textSecondary} />
          <Text variant="caption" tone="secondary">{t.seatsLeft}/{t.seatsTotal} left</Text>
        </HStack>
        <Badge label={t.driver.kycTier.toUpperCase()} tone="neutral" size="sm" />
      </HStack>

      {t.notes && (
        <Text variant="caption" tone="secondary" style={{ marginTop: spacing[2] }} numberOfLines={2}>{t.notes}</Text>
      )}

      <HStack gap={2} align="center" style={{ marginTop: spacing[3], justifyContent: 'space-between' }}>
        <Text variant="caption" tone="secondary">Driver · {t.driver.name}</Text>
        {!isDriver && (
          <HStack gap={2}>
            {t._count.joins > 0 && (
              <Button label="Leave" variant="ghost" size="sm" loading={loading} onPress={onLeave} />
            )}
            <Button label={full ? 'Full' : 'Request seat'} size="sm" loading={loading} onPress={onJoin} disabled={full} />
          </HStack>
        )}
        {isDriver && <Badge label="YOUR TRIP" tone="success" size="sm" />}
      </HStack>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    backgroundColor: colors.surface.background,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.surface.border,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  scroll:  { padding: spacing[4], paddingBottom: spacing[10] },
});
