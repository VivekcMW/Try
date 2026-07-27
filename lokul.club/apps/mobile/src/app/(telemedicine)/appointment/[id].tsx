/**
 * Appointment detail / join
 * Route: /(telemedicine)/appointment/[id]
 *
 * There is no real video backend, so "Join" is honest: it shows a clear
 * waiting state and offers a real phone fallback (Linking to tel:) when the
 * doctor's clinic phone is known, instead of faking a connect.
 */
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Clock, Phone, Video, XCircle } from 'lucide-react-native';
import { Badge, Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { DOCTORS } from '@/data/telemedicine-catalog';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const STATUS_TONE = {
  upcoming: 'brand' as const,
  completed: 'success' as const,
  cancelled: 'danger' as const,
};

type ApiAppointment = {
  id: string;
  doctorId: string | null;
  doctorName: string;
  specialty: string;
  mode: 'video' | 'audio' | 'in_person' | 'instant';
  dateLabel: string;
  timeLabel: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  reason: string | null;
};

export default function AppointmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [appointment, setAppointment] = useState<ApiAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [waitingForCall, setWaitingForCall] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/telemedicine/appointments/${id}`);
      const data = await res.json();
      setAppointment(res.ok ? data.appointment : null);
    } catch {
      setAppointment(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      </SafeAreaView>
    );
  }

  if (!appointment) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <HStack gap={spacing.md} style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ArrowLeft size={22} color={colors.foreground} />
          </Pressable>
          <Text variant="h3" style={{ fontWeight: '700' }}>Appointment not found</Text>
        </HStack>
      </SafeAreaView>
    );
  }

  const doctor = DOCTORS.find((d) => d.id === appointment.doctorId);
  const isVideoLike = appointment.mode === 'video' || appointment.mode === 'instant';

  const handleJoin = () => {
    // Honest behaviour: there is no real video backend for this feature yet,
    // so we show that clearly instead of pretending a call connects.
    setWaitingForCall(true);
  };

  const handleCallClinic = () => {
    if (!doctor?.clinicPhone) return;
    Linking.openURL(`tel:${doctor.clinicPhone}`).catch(() =>
      Alert.alert('Could not place call', 'Your device could not open the phone dialer.'),
    );
  };

  const handleCancel = () => {
    Alert.alert('Cancel appointment?', 'This will mark the appointment as cancelled.', [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Cancel appointment',
        style: 'destructive',
        onPress: async () => {
          try {
            await fetch(`${BASE}/api/mobile/telemedicine/appointments/${appointment.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'cancelled' }),
            });
          } finally {
            router.back();
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack gap={spacing.md} style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>Appointment</Text>
      </HStack>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <HStack style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <VStack style={{ flex: 1 }}>
              <Text variant="h3" style={{ fontWeight: '700' }}>{appointment.doctorName}</Text>
              <Text variant="body" tone="secondary">{appointment.specialty}</Text>
            </VStack>
            <Badge label={appointment.status.toUpperCase()} tone={STATUS_TONE[appointment.status]} />
          </HStack>

          <View style={styles.divider} />

          <HStack gap={spacing.md}>
            <HStack gap={spacing.xs} style={{ alignItems: 'center' }}>
              <Calendar size={14} color={colors.textSecondary} />
              <Text variant="caption" tone="secondary">{appointment.dateLabel}</Text>
            </HStack>
            <HStack gap={spacing.xs} style={{ alignItems: 'center' }}>
              <Clock size={14} color={colors.textSecondary} />
              <Text variant="caption" tone="secondary">{appointment.timeLabel}</Text>
            </HStack>
          </HStack>

          {appointment.reason && (
            <VStack style={{ marginTop: spacing.md }}>
              <Text variant="label" style={{ fontWeight: '600' }}>REASON</Text>
              <Text variant="body" style={{ marginTop: spacing.xs }}>{appointment.reason}</Text>
            </VStack>
          )}
        </Card>

        {isVideoLike && appointment.status === 'upcoming' && (
          <Card style={styles.joinCard}>
            {!waitingForCall ? (
              <VStack style={{ alignItems: 'center' }}>
                <Video size={32} color={colors.brand[600]} />
                <Text variant="body" style={{ fontWeight: '700', marginTop: spacing.sm }}>Ready to join?</Text>
                <Text variant="caption" tone="secondary" style={{ textAlign: 'center', marginTop: spacing.xs }}>
                  Video calling isn't available in this preview build yet.
                </Text>
                <View style={{ marginTop: spacing.md }}>
                  <Button label="Join Call" onPress={handleJoin} />
                </View>
              </VStack>
            ) : (
              <VStack style={{ alignItems: 'center' }}>
                <Video size={32} color={colors.warning} />
                <Text variant="body" style={{ fontWeight: '700', marginTop: spacing.sm }}>
                  Video calling isn't set up yet
                </Text>
                <Text variant="caption" tone="secondary" style={{ textAlign: 'center', marginTop: spacing.xs }}>
                  This is a preview build without a live video backend. The call would start here once video is enabled.
                </Text>
                {doctor?.clinicPhone && (
                  <View style={{ marginTop: spacing.md }}>
                    <Button
                      label={`Call ${doctor.name}'s clinic instead`}
                      variant="secondary"
                      leftIcon={<Phone size={16} color={colors.brand[600]} />}
                      onPress={handleCallClinic}
                    />
                  </View>
                )}
              </VStack>
            )}
          </Card>
        )}

        {appointment.status === 'upcoming' && (
          <Pressable onPress={handleCancel} style={styles.cancelRow}>
            <XCircle size={16} color={colors.danger} />
            <Text variant="body" style={{ color: colors.danger, fontWeight: '600' }}>Cancel Appointment</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.background },
  header: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: { padding: spacing.lg, paddingBottom: spacing[10] },
  card: { padding: spacing.md },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  joinCard: { padding: spacing.lg, marginTop: spacing.md },
  cancelRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    marginTop: spacing.lg, padding: spacing.md, borderRadius: radius.md,
    backgroundColor: colors.dangerBg,
  },
});
