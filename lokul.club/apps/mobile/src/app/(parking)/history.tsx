import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, CalendarClock, Clock, MapPin } from 'lucide-react-native';
import { Badge, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing } from '@lokul/ui-tokens';
import { useOnboardingStore } from '@/store/onboardingStore';
import { type VisitorRequest } from './index';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const STATUS_TONE: Record<VisitorRequest['status'], 'success' | 'danger' | 'brand' | 'warning' | 'neutral'> = {
  pending: 'warning',
  approved: 'success',
  active: 'brand',
  rejected: 'danger',
  completed: 'neutral',
};

export default function ParkingHistoryScreen() {
  const router = useRouter();
  const pinCode = useOnboardingStore((s) => s.pin);
  const [visitorRequests, setVisitorRequests] = useState<VisitorRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!pinCode) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/parking/visitor-requests?pinCode=${pinCode}`);
      const data = await res.json();
      setVisitorRequests(res.ok ? data.requests : []);
    } catch {
      setVisitorRequests([]);
    } finally {
      setLoading(false);
    }
  }, [pinCode]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      </SafeAreaView>
    );
  }

  const sorted = [...visitorRequests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack gap="md" align="center" style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} accessibilityRole="button">
          <ArrowLeft size={24} color={colors.surface.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700', flex: 1 }}>Booking History</Text>
      </HStack>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {sorted.length === 0 ? (
          <Card style={styles.emptyCard}>
            <CalendarClock size={40} color={colors.textSecondary} />
            <Text variant="bodyLg" style={{ marginTop: spacing.md, fontWeight: '500' }}>No bookings yet</Text>
            <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
              Visitor parking bookings you make will show up here.
            </Text>
          </Card>
        ) : (
          <VStack gap="md">
            {sorted.map((r) => (
              <Card key={r.id} style={styles.card}>
                <HStack style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <VStack style={{ flex: 1 }}>
                    <Text variant="body" style={{ fontWeight: '600' }}>{r.visitorName}</Text>
                    <Text variant="caption" tone="secondary">{r.vehicleNumber} • {r.vehicleType}</Text>
                  </VStack>
                  <Badge label={r.status} tone={STATUS_TONE[r.status]} />
                </HStack>

                <View style={styles.divider} />

                <VStack gap="xs">
                  <HStack gap="sm" align="center">
                    <Clock size={13} color={colors.textSecondary} />
                    <Text variant="caption" tone="secondary">{r.requestedTime} • {r.duration}</Text>
                  </HStack>
                  <HStack gap="sm" align="center">
                    <MapPin size={13} color={colors.textSecondary} />
                    <Text variant="caption" tone="secondary">Slot {r.requestedSlot} • {r.purpose}</Text>
                  </HStack>
                </VStack>
              </Card>
            ))}
          </VStack>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scroll: { padding: spacing.lg },
  card: { padding: spacing.md },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  emptyCard: { padding: spacing[8], alignItems: 'center' },
});
