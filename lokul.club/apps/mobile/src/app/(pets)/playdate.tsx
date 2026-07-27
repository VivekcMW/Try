/**
 * Schedule a Pet Playdate
 * Route: /(pets)/playdate
 */
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Users } from 'lucide-react-native';
import { Button, HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { useWalletStore } from '@/store/walletStore';
import { useOnboardingStore } from '@/store/onboardingStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type ApiPet = { id: string; name: string };

export default function PlaydateScreen() {
  const router = useRouter();
  const userId = useWalletStore((s) => s.userId);
  const pinCode = useOnboardingStore((s) => s.pin);
  const [myPets, setMyPets] = useState<ApiPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [petId, setPetId] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/pets?ownerId=${userId}`);
      const data = await res.json();
      const pets: ApiPet[] = data.pets ?? [];
      setMyPets(pets);
      setPetId(pets[0]?.id ?? '');
    } catch {
      setMyPets([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const handleSchedule = async () => {
    if (!petId) {
      Alert.alert('Add a pet first', 'You need a pet on your profile before scheduling a playdate.');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Missing info', 'Please add a location.');
      return;
    }
    if (!userId || !pinCode) {
      Alert.alert('Not signed in', 'Please complete onboarding first.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/pets/playdates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterId: userId,
          petId,
          location: location.trim(),
          note: note.trim() || undefined,
          pinCode,
        }),
      });
      if (!res.ok) throw new Error('failed');
      Alert.alert('Playdate scheduled', 'Neighbours with pets nearby will be notified.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Failed to schedule', 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>Schedule a Playdate</Text>
      </HStack>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <VStack gap="lg">
          <View style={styles.introCard}>
            <Users size={22} color={colors.brand[600]} />
            <Text variant="body" tone="secondary" style={{ marginTop: spacing.xs }}>
              Invite neighbourhood pets for a playdate — pick a time and place, and nearby pet owners will see it.
            </Text>
          </View>

          <VStack gap="xs">
            <Text variant="label" tone="secondary">Which pet</Text>
            {myPets.length === 0 ? (
              <Text variant="caption" tone="secondary">
                You haven't added a pet yet — add one from My Pets first.
              </Text>
            ) : (
              <View style={styles.chipsWrap}>
                {myPets.map((pet) => (
                  <Pressable
                    key={pet.id}
                    onPress={() => setPetId(pet.id)}
                    style={[styles.chip, petId === pet.id && styles.chipActive]}
                  >
                    <Text variant="caption" style={{ fontWeight: '600', color: petId === pet.id ? '#fff' : colors.foreground }}>
                      {pet.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </VStack>

          <VStack gap="xs">
            <Text variant="label" tone="secondary">Date & time</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.inputFlat}
                placeholder="e.g. Sat, 5 PM"
                placeholderTextColor={colors.textDisabled}
                value={date}
                onChangeText={setDate}
              />
            </View>
          </VStack>

          <VStack gap="xs">
            <Text variant="label" tone="secondary">Location</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.inputFlat}
                placeholder="e.g. Society garden"
                placeholderTextColor={colors.textDisabled}
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </VStack>

          <VStack gap="xs">
            <Text variant="label" tone="secondary">Note (optional)</Text>
            <View style={[styles.inputRow, styles.textAreaRow]}>
              <TextInput
                style={[styles.inputFlat, styles.textArea]}
                placeholder="Anything else neighbours should know?"
                placeholderTextColor={colors.textDisabled}
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
              />
            </View>
          </VStack>

          <Button
            label={saving ? 'Scheduling…' : 'Schedule Playdate'}
            onPress={handleSchedule}
            disabled={saving || myPets.length === 0}
            fullWidth
          />
        </VStack>
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scroll: { flex: 1 },
  form: { padding: spacing.lg },
  introCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.brand[50],
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceMuted,
  },
  textAreaRow: { alignItems: 'flex-start', paddingVertical: spacing.sm },
  inputFlat: { flex: 1, paddingVertical: spacing.sm, fontSize: 15, color: colors.foreground },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.brand[600],
    borderColor: colors.brand[600],
  },
  bottomPadding: { height: 100 },
});
