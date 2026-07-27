/**
 * Doctor detail
 * Route: /(telemedicine)/doctor/[id]
 */
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, BadgeCheck, Globe, MapPin, Star, Video, Building } from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { DOCTORS, SPECIALTIES } from '@/data/telemedicine-catalog';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type Mode = 'video' | 'in-person';

export default function DoctorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const userId = useWalletStore((s) => s.userId);
  const [mode, setMode] = useState<Mode>('video');
  const [booking, setBooking] = useState(false);

  const doctor = DOCTORS.find((d) => d.id === id);

  if (!doctor) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <HStack gap={spacing.md} style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ArrowLeft size={22} color={colors.foreground} />
          </Pressable>
          <Text variant="h3" style={{ fontWeight: '700' }}>Doctor not found</Text>
        </HStack>
      </SafeAreaView>
    );
  }

  const specialty = SPECIALTIES.find((s) => s.id === doctor.specialty);

  const handleBook = async () => {
    if (!userId) {
      Alert.alert('Not signed in', 'Please complete onboarding first.');
      return;
    }
    setBooking(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/telemedicine/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          doctorId: doctor.id,
          doctorName: doctor.name,
          specialty: specialty?.name ?? doctor.specialty,
          mode: mode === 'in-person' ? 'in_person' : 'video',
          dateLabel: doctor.availableToday ? 'Today' : (doctor.nextSlot?.split(' ').slice(0, -2).join(' ') || 'Upcoming'),
          timeLabel: doctor.nextSlot ?? 'TBD',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error('failed');
      router.replace(`/(telemedicine)/appointment/${data.appointment.id}`);
    } catch {
      Alert.alert('Failed to book', 'Please try again.');
    } finally {
      setBooking(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack gap={spacing.md} style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>Doctor Profile</Text>
      </HStack>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.profileCard}>
          <HStack gap={spacing.md}>
            <View style={[styles.avatar, { backgroundColor: `${specialty?.color ?? colors.brand[600]}20` }]}>
              {specialty ? <specialty.icon size={28} color={specialty.color} /> : null}
            </View>
            <VStack style={{ flex: 1 }}>
              <HStack gap={spacing.xs} style={{ alignItems: 'center' }}>
                <Text variant="h3" style={{ fontWeight: '700' }}>{doctor.name}</Text>
                {doctor.verified && <BadgeCheck size={16} color={colors.success} />}
              </HStack>
              <Text variant="body" tone="secondary">{doctor.qualification}</Text>
              <HStack gap={spacing.xs} style={{ marginTop: spacing.xs, alignItems: 'center' }}>
                <Star size={13} color={colors.warning} fill={colors.warning} />
                <Text variant="caption">{doctor.rating} ({doctor.reviews} reviews)</Text>
              </HStack>
            </VStack>
          </HStack>

          <View style={styles.divider} />

          <HStack gap={spacing.md} style={{ flexWrap: 'wrap' }}>
            <HStack gap={spacing.xs} style={{ alignItems: 'center' }}>
              <Building size={14} color={colors.textSecondary} />
              <Text variant="caption" tone="secondary">{doctor.experience} experience</Text>
            </HStack>
            {doctor.clinicName && (
              <HStack gap={spacing.xs} style={{ alignItems: 'center' }}>
                <MapPin size={14} color={colors.textSecondary} />
                <Text variant="caption" tone="secondary">{doctor.clinicName}</Text>
              </HStack>
            )}
            <HStack gap={spacing.xs} style={{ alignItems: 'center' }}>
              <Globe size={14} color={colors.textSecondary} />
              <Text variant="caption" tone="secondary">{doctor.languages.join(', ')}</Text>
            </HStack>
          </HStack>
        </Card>

        <Card style={styles.feesCard}>
          <Text variant="label" style={{ fontWeight: '600' }}>CONSULTATION TYPE</Text>
          <HStack gap={spacing.sm} style={{ marginTop: spacing.sm }}>
            <Pressable
              onPress={() => setMode('video')}
              style={[styles.modeChip, mode === 'video' && styles.modeChipActive]}
            >
              <Video size={16} color={mode === 'video' ? colors.surface.background : colors.brand[600]} />
              <VStack style={{ alignItems: 'center' }}>
                <Text variant="caption" style={{ fontWeight: '600', color: mode === 'video' ? colors.surface.background : colors.foreground }}>
                  Video
                </Text>
                <Text variant="caption" style={{ color: mode === 'video' ? colors.surface.background : colors.textSecondary }}>
                  ₹{doctor.videoFee}
                </Text>
              </VStack>
            </Pressable>
            <Pressable
              onPress={() => setMode('in-person')}
              style={[styles.modeChip, mode === 'in-person' && styles.modeChipActive]}
            >
              <Building size={16} color={mode === 'in-person' ? colors.surface.background : colors.brand[600]} />
              <VStack style={{ alignItems: 'center' }}>
                <Text variant="caption" style={{ fontWeight: '600', color: mode === 'in-person' ? colors.surface.background : colors.foreground }}>
                  In-clinic
                </Text>
                <Text variant="caption" style={{ color: mode === 'in-person' ? colors.surface.background : colors.textSecondary }}>
                  ₹{doctor.consultationFee}
                </Text>
              </VStack>
            </Pressable>
          </HStack>

          <Text variant="caption" tone="secondary" style={{ marginTop: spacing.md }}>
            {doctor.availableToday ? `Next available: Today, ${doctor.nextSlot}` : `Next available: ${doctor.nextSlot}`}
          </Text>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={booking ? 'Booking…' : `Book Appointment · ₹${mode === 'video' ? doctor.videoFee : doctor.consultationFee}`}
          fullWidth
          size="lg"
          loading={booking}
          onPress={handleBook}
        />
      </View>
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
  profileCard: { padding: spacing.md },
  avatar: { width: 64, height: 64, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  feesCard: { padding: spacing.md, marginTop: spacing.md },
  modeChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    paddingVertical: spacing.md, borderRadius: radius.md,
    backgroundColor: colors.brand[50], borderWidth: 1, borderColor: colors.brand[600],
  },
  modeChipActive: { backgroundColor: colors.brand[600] },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
});
