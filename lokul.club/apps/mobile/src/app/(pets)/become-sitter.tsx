/**
 * Become a Pet Sitter
 * Route: /(pets)/become-sitter
 */
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Button, HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { useWalletStore } from '@/store/walletStore';
import { useOnboardingStore } from '@/store/onboardingStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const PET_TYPE_OPTIONS = ['Dogs', 'Cats', 'Birds', 'Fish', 'Other'];

export default function BecomeSitterScreen() {
  const router = useRouter();
  const userId = useWalletStore((s) => s.userId);
  const pinCode = useOnboardingStore((s) => s.pin);

  const [petTypes, setPetTypes] = useState<string[]>([]);
  const [experience, setExperience] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  const togglePetType = (type: string) => {
    setPetTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };

  const handleSubmit = async () => {
    const price = Number(pricePerDay.trim());
    if (petTypes.length === 0) {
      Alert.alert('Pick pet types', 'Select at least one type of pet you can care for.');
      return;
    }
    if (!pricePerDay.trim() || Number.isNaN(price) || price < 0) {
      Alert.alert('Invalid rate', 'Please enter a valid daily rate.');
      return;
    }
    if (!userId || !pinCode) {
      Alert.alert('Not signed in', 'Please complete onboarding first.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/pets/sitters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          petTypes,
          experience: experience.trim() || undefined,
          bio: bio.trim() || undefined,
          pricePerDayPaise: Math.round(price * 100),
          pinCode,
        }),
      });
      if (!res.ok) throw new Error('failed');
      Alert.alert('You\'re listed!', 'Neighbours looking for a pet sitter can now find and contact you.', [
        { text: 'OK', onPress: () => router.replace('/(pets)') },
      ]);
    } catch {
      Alert.alert('Failed to register', 'Please try again.');
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
        <Text variant="h3" style={{ fontWeight: '700' }}>Become a Pet Sitter</Text>
      </HStack>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <VStack gap="lg">
          <VStack gap="xs">
            <Text variant="label" tone="secondary">Pets you can care for</Text>
            <View style={styles.chipsWrap}>
              {PET_TYPE_OPTIONS.map((type) => (
                <Pressable
                  key={type}
                  onPress={() => togglePetType(type)}
                  style={[styles.chip, petTypes.includes(type) && styles.chipActive]}
                >
                  <Text variant="caption" style={{ fontWeight: '600', color: petTypes.includes(type) ? '#fff' : colors.foreground }}>
                    {type}
                  </Text>
                </Pressable>
              ))}
            </View>
          </VStack>

          <VStack gap="xs">
            <Text variant="label" tone="secondary">Experience</Text>
            <View style={styles.inputRow}>
              <TextInput style={styles.inputFlat} placeholder="e.g. 3 years, own two dogs" placeholderTextColor={colors.textDisabled} value={experience} onChangeText={setExperience} />
            </View>
          </VStack>

          <VStack gap="xs">
            <Text variant="label" tone="secondary">Rate per day (₹)</Text>
            <View style={styles.inputRow}>
              <TextInput style={styles.inputFlat} placeholder="e.g. 300" placeholderTextColor={colors.textDisabled} value={pricePerDay} onChangeText={setPricePerDay} keyboardType="numeric" />
            </View>
          </VStack>

          <VStack gap="xs">
            <Text variant="label" tone="secondary">Bio (optional)</Text>
            <View style={[styles.inputRow, styles.textAreaRow]}>
              <TextInput
                style={[styles.inputFlat, styles.textArea]}
                placeholder="Tell neighbours a bit about yourself"
                placeholderTextColor={colors.textDisabled}
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
              />
            </View>
          </VStack>

          <Button label={saving ? 'Submitting…' : 'Register as Sitter'} onPress={handleSubmit} disabled={saving} fullWidth />
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
  bottomPadding: { height: 100 },
});
