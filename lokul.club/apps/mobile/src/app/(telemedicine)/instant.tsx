/**
 * Instant Consult
 * Route: /(telemedicine)/instant
 */
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Video } from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { SPECIALTIES, DOCTORS } from '@/data/telemedicine-catalog';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export default function InstantConsultScreen() {
  const router = useRouter();
  const userId = useWalletStore((s) => s.userId);

  const [specialtyId, setSpecialtyId] = useState(SPECIALTIES[0].id);
  const [reason, setReason] = useState('');
  const [starting, setStarting] = useState(false);

  const specialty = SPECIALTIES.find((s) => s.id === specialtyId)!;
  const availableDoctor =
    DOCTORS.find((d) => d.specialty === specialtyId && d.availableToday) ??
    DOCTORS.find((d) => d.specialty === specialtyId);

  const handleStart = async () => {
    if (!userId) {
      Alert.alert('Not signed in', 'Please complete onboarding first.');
      return;
    }
    setStarting(true);
    try {
      const now = new Date();
      const res = await fetch(`${BASE}/api/mobile/telemedicine/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          doctorId: availableDoctor?.id,
          doctorName: availableDoctor?.name ?? `Next available ${specialty.name} doctor`,
          specialty: specialty.name,
          mode: 'instant',
          dateLabel: 'Today',
          timeLabel: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          reason: reason.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error('failed');
      router.replace(`/(telemedicine)/appointment/${data.appointment.id}`);
    } catch {
      Alert.alert('Failed to start', 'Please try again.');
    } finally {
      setStarting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <HStack gap={spacing.md} style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>Instant Consult</Text>
      </HStack>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card style={styles.introCard}>
          <HStack gap={spacing.md} style={{ alignItems: 'center' }}>
            <View style={styles.introIcon}>
              <Video size={22} color={colors.brand[600]} />
            </View>
            <VStack style={{ flex: 1 }}>
              <Text variant="body" style={{ fontWeight: '700' }}>Connect with a doctor now</Text>
              <Text variant="caption" tone="secondary">Pick a specialty and briefly describe your concern.</Text>
            </VStack>
          </HStack>
        </Card>

        <VStack gap={spacing.sm} style={{ marginTop: spacing.lg }}>
          <Text variant="label" style={{ fontWeight: '600' }}>SPECIALTY</Text>
          <View style={styles.chipsWrap}>
            {SPECIALTIES.map((s) => {
              const isActive = s.id === specialtyId;
              const Icon = s.icon;
              return (
                <Pressable
                  key={s.id}
                  onPress={() => setSpecialtyId(s.id)}
                  style={[styles.chip, isActive && { backgroundColor: s.color, borderColor: s.color }]}
                >
                  <Icon size={14} color={isActive ? colors.surface.background : s.color} />
                  <Text variant="caption" style={{ fontWeight: '600', color: isActive ? colors.surface.background : colors.foreground }}>
                    {s.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </VStack>

        <VStack gap={spacing.sm} style={{ marginTop: spacing.lg }}>
          <Text variant="label" style={{ fontWeight: '600' }}>WHAT'S GOING ON? (OPTIONAL)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="e.g. Fever since yesterday, mild cough…"
            placeholderTextColor={colors.textSecondary}
            multiline
            value={reason}
            onChangeText={setReason}
          />
        </VStack>

        <Card style={styles.matchCard}>
          <Text variant="caption" tone="secondary">You'll be connected with</Text>
          <Text variant="body" style={{ fontWeight: '700', marginTop: 2 }}>
            {availableDoctor ? availableDoctor.name : `Next available ${specialty.name} doctor`}
          </Text>
          {availableDoctor && (
            <Text variant="caption" tone="secondary">
              {availableDoctor.availableToday ? `Available now · ${availableDoctor.nextSlot}` : availableDoctor.nextSlot}
            </Text>
          )}
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button label={starting ? 'Starting…' : 'Start Instant Consult'} fullWidth size="lg" disabled={starting} onPress={handleStart} />
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
  introCard: { padding: spacing.md, backgroundColor: colors.brand[50] },
  introIcon: {
    width: 44, height: 44, borderRadius: radius.lg,
    backgroundColor: colors.surface.background, alignItems: 'center', justifyContent: 'center',
  },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.full, backgroundColor: colors.surfaceMuted,
    borderWidth: 1, borderColor: colors.border,
  },
  textArea: {
    minHeight: 90, backgroundColor: colors.surfaceMuted, borderRadius: radius.md,
    padding: spacing.md, fontSize: 15, color: colors.foreground, textAlignVertical: 'top',
  },
  matchCard: { padding: spacing.md, marginTop: spacing.lg },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
});
