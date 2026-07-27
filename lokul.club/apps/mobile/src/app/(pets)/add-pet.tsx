/**
 * Add a Pet
 * Route: /(pets)/add-pet
 */
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Button, HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { useWalletStore } from '@/store/walletStore';
import { useOnboardingStore } from '@/store/onboardingStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type PetType = 'dog' | 'cat' | 'bird' | 'fish' | 'other';

const TYPES: { id: PetType; label: string }[] = [
  { id: 'dog', label: 'Dog' },
  { id: 'cat', label: 'Cat' },
  { id: 'bird', label: 'Bird' },
  { id: 'fish', label: 'Fish' },
  { id: 'other', label: 'Other' },
];

export default function AddPetScreen() {
  const router = useRouter();
  const userId = useWalletStore((s) => s.userId);
  const pinCode = useOnboardingStore((s) => s.pin);

  const [name, setName] = useState('');
  const [type, setType] = useState<PetType>('dog');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [vaccinated, setVaccinated] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Add a name', "Please enter your pet's name.");
      return;
    }
    if (!userId || !pinCode) {
      Alert.alert('Not signed in', 'Please complete onboarding before adding a pet.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/pets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: userId,
          name: trimmedName,
          type,
          breed: breed.trim() || undefined,
          age: age.trim() || undefined,
          vaccinated,
          notes: notes.trim() || undefined,
          pinCode,
        }),
      });
      if (!res.ok) throw new Error('failed');
      router.replace('/(pets)/my-pets');
    } catch {
      Alert.alert('Failed to save', 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>Add a Pet</Text>
      </HStack>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <VStack gap="lg">
          <VStack gap="xs">
            <Text variant="label" tone="secondary">Pet's name</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.inputFlat}
                placeholder="e.g. Bruno"
                placeholderTextColor={colors.textDisabled}
                value={name}
                onChangeText={setName}
                accessibilityLabel="Pet's name"
              />
            </View>
          </VStack>

          <VStack gap="xs">
            <Text variant="label" tone="secondary">Type</Text>
            <View style={styles.chipsWrap}>
              {TYPES.map((t) => (
                <Pressable
                  key={t.id}
                  onPress={() => setType(t.id)}
                  style={[styles.chip, type === t.id && styles.chipActive]}
                >
                  <Text
                    variant="caption"
                    style={{ fontWeight: '600', color: type === t.id ? '#fff' : colors.foreground }}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </VStack>

          <VStack gap="xs">
            <Text variant="label" tone="secondary">Breed</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.inputFlat}
                placeholder="e.g. Golden Retriever"
                placeholderTextColor={colors.textDisabled}
                value={breed}
                onChangeText={setBreed}
                accessibilityLabel="Breed"
              />
            </View>
          </VStack>

          <VStack gap="xs">
            <Text variant="label" tone="secondary">Age</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.inputFlat}
                placeholder="e.g. 2 years"
                placeholderTextColor={colors.textDisabled}
                value={age}
                onChangeText={setAge}
                accessibilityLabel="Age"
              />
            </View>
          </VStack>

          <HStack style={styles.switchRow}>
            <Text variant="body" style={{ fontWeight: '500' }}>Vaccinated</Text>
            <Switch value={vaccinated} onValueChange={setVaccinated} />
          </HStack>

          <VStack gap="xs">
            <Text variant="label" tone="secondary">Notes (optional)</Text>
            <View style={[styles.inputRow, styles.textAreaRow]}>
              <TextInput
                style={[styles.inputFlat, styles.textArea]}
                placeholder="Anything neighbours should know?"
                placeholderTextColor={colors.textDisabled}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                accessibilityLabel="Notes"
              />
            </View>
          </VStack>

          <Button
            label={saving ? 'Saving…' : 'Add Pet'}
            onPress={handleSave}
            disabled={saving}
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
  textArea: { minHeight: 90, textAlignVertical: 'top' },
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
  switchRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  bottomPadding: { height: 100 },
});
