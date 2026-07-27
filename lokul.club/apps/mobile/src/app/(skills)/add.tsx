/**
 * Post a Skill
 * Route: /(skills)/add
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
import { SKILL_CATEGORIES } from './index';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type SkillMode = 'teach' | 'learn' | 'exchange';

const MODES: { id: SkillMode; label: string }[] = [
  { id: 'teach', label: 'Teaching' },
  { id: 'learn', label: 'Learning' },
  { id: 'exchange', label: 'Exchange' },
];

export default function AddSkillScreen() {
  const router = useRouter();
  const userId = useWalletStore((s) => s.userId);
  const pinCode = useOnboardingStore((s) => s.pin);

  const [skill, setSkill] = useState('');
  const [categoryId, setCategoryId] = useState(SKILL_CATEGORIES[0].id);
  const [mode, setMode] = useState<SkillMode>('teach');
  const [description, setDescription] = useState('');
  const [experience, setExperience] = useState('');
  const [availability, setAvailability] = useState('');
  const [priceText, setPriceText] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const title = skill.trim();
    if (!title) {
      Alert.alert('Add a title', 'Please enter what skill you want to teach, learn, or exchange.');
      return;
    }

    const trimmedPrice = priceText.trim();
    const price = trimmedPrice.length === 0 ? null : Number(trimmedPrice);
    if (price !== null && (Number.isNaN(price) || price < 0)) {
      Alert.alert('Invalid price', 'Price per session must be a positive number, or leave it blank for free/exchange.');
      return;
    }
    if (!userId || !pinCode) {
      Alert.alert('Not signed in', 'Please complete onboarding first.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: userId,
          skill: title,
          category: categoryId,
          description: description.trim() || undefined,
          experience: experience.trim() || undefined,
          mode,
          availability: availability.trim() || undefined,
          pricePaise: price !== null ? Math.round(price * 100) : null,
          pinCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error('failed');
      router.replace(`/(skills)/${data.offer.id}`);
    } catch {
      Alert.alert('Failed to post', 'Please try again.');
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
        <Text variant="h3" style={{ fontWeight: '700' }}>Post a Skill</Text>
      </HStack>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <VStack gap="lg">
          <VStack gap="xs">
            <Text variant="label" tone="secondary">Skill title</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.inputFlat}
                placeholder="e.g. Guitar Lessons"
                placeholderTextColor={colors.textDisabled}
                value={skill}
                onChangeText={setSkill}
                accessibilityLabel="Skill title"
              />
            </View>
          </VStack>

          <VStack gap="xs">
            <Text variant="label" tone="secondary">Category</Text>
            <View style={styles.chipsWrap}>
              {SKILL_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => setCategoryId(cat.id)}
                  style={[styles.chip, categoryId === cat.id && { backgroundColor: cat.color, borderColor: cat.color }]}
                >
                  <Text
                    variant="caption"
                    style={{ fontWeight: '600', color: categoryId === cat.id ? colors.background : colors.foreground }}
                  >
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </VStack>

          <VStack gap="xs">
            <Text variant="label" tone="secondary">I want to</Text>
            <View style={styles.chipsWrap}>
              {MODES.map((m) => (
                <Pressable
                  key={m.id}
                  onPress={() => setMode(m.id)}
                  style={[styles.chip, mode === m.id && styles.chipActive]}
                >
                  <Text
                    variant="caption"
                    style={{ fontWeight: '600', color: mode === m.id ? colors.background : colors.foreground }}
                  >
                    {m.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </VStack>

          <VStack gap="xs">
            <Text variant="label" tone="secondary">Description</Text>
            <View style={[styles.inputRow, styles.textAreaRow]}>
              <TextInput
                style={[styles.inputFlat, styles.textArea]}
                placeholder="What will you teach, or what do you want to learn?"
                placeholderTextColor={colors.textDisabled}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                accessibilityLabel="Description"
              />
            </View>
          </VStack>

          <VStack gap="xs">
            <Text variant="label" tone="secondary">Experience</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.inputFlat}
                placeholder="e.g. 5 years, Certified instructor"
                placeholderTextColor={colors.textDisabled}
                value={experience}
                onChangeText={setExperience}
                accessibilityLabel="Experience"
              />
            </View>
          </VStack>

          <VStack gap="xs">
            <Text variant="label" tone="secondary">Availability</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.inputFlat}
                placeholder="e.g. Weekends, 10 AM - 12 PM"
                placeholderTextColor={colors.textDisabled}
                value={availability}
                onChangeText={setAvailability}
                accessibilityLabel="Availability"
              />
            </View>
          </VStack>

          <VStack gap="xs">
            <Text variant="label" tone="secondary">Price per session (optional)</Text>
            <View style={styles.inputRow}>
              <Text variant="body" tone="secondary">₹</Text>
              <TextInput
                style={styles.inputFlat}
                placeholder="Leave blank for free / exchange"
                placeholderTextColor={colors.textDisabled}
                value={priceText}
                onChangeText={setPriceText}
                keyboardType="numeric"
                accessibilityLabel="Price per session"
              />
            </View>
          </VStack>

          <Button
            label={saving ? 'Posting…' : 'Post Skill'}
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
  bottomPadding: { height: 100 },
});
