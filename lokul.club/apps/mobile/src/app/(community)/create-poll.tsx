// PRD §09 — Create Poll (society / community poll with up to 5 options)
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react-native';
import { Button, HStack, Text, VStack } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const DURATIONS = [
  { label: '1 day',   value: 1  },
  { label: '3 days',  value: 3  },
  { label: '7 days',  value: 7  },
  { label: '14 days', value: 14 },
];

export default function CreatePollScreen() {
  const router   = useRouter();
  const userId   = useWalletStore((s) => s.userId);
  const pinCode  = useOnboardingStore((s) => s.pin);

  const [question,   setQuestion]   = useState('');
  const [options,    setOptions]    = useState(['', '']);
  const [duration,   setDuration]   = useState(7);
  const [submitting, setSubmitting] = useState(false);

  function addOption() {
    if (options.length >= 5) return;
    setOptions((prev) => [...prev, '']);
  }

  function removeOption(i: number) {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateOption(i: number, text: string) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? text : o)));
  }

  async function handleCreate() {
    if (!question.trim()) { Alert.alert('Question required', 'Enter a poll question.'); return; }
    const validOptions = options.filter((o) => o.trim());
    if (validOptions.length < 2) { Alert.alert('Options required', 'Add at least 2 options.'); return; }
    if (!userId || !pinCode) { Alert.alert('Not logged in', 'Please complete onboarding first.'); return; }

    const expiresAt = new Date(Date.now() + duration * 86_400_000).toISOString();
    const body = `${question.trim()}\n\nOptions:\n${validOptions.map((o, i) => `${i + 1}. ${o}`).join('\n')}\n\nExpires: ${new Date(expiresAt).toLocaleDateString('en-IN')}`;

    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/posts`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          userId,
          pinCode,
          type:     'poll',
          postBody: body,
          tags:     ['poll'],
        }),
      });
      if (!res.ok) throw new Error('Failed to create poll');
      router.back();
    } catch {
      Alert.alert('Error', 'Could not create poll. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack gap={3} align="center" style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Create Poll</Text>
      </HStack>

      <ScrollView
        contentContainerStyle={{ padding: spacing[4], gap: spacing[5], paddingBottom: spacing[20] }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Question */}
        <VStack gap={1.5}>
          <Text variant="caption" style={{ fontWeight: '700', color: colors.surface.heading }}>
            Poll Question *
          </Text>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder="e.g. Should we install CCTV at Gate 2?"
            placeholderTextColor={colors.surface.textSecondary}
            maxLength={200}
            style={styles.input}
          />
        </VStack>

        {/* Options */}
        <VStack gap={2}>
          <Text variant="caption" style={{ fontWeight: '700', color: colors.surface.heading }}>
            Options (2–5)
          </Text>
          {options.map((opt, i) => (
            <HStack key={i} gap={2} align="center">
              <View style={styles.optionNum}>
                <Text variant="caption" style={{ fontWeight: '700', color: colors.brand[600] }}>
                  {i + 1}
                </Text>
              </View>
              <TextInput
                value={opt}
                onChangeText={(t) => updateOption(i, t)}
                placeholder={`Option ${i + 1}`}
                placeholderTextColor={colors.surface.textSecondary}
                maxLength={80}
                style={[styles.input, { flex: 1 }]}
              />
              {options.length > 2 && (
                <Pressable
                  onPress={() => removeOption(i)}
                  style={styles.removeBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Remove option"
                >
                  <Trash2 size={16} color={colors.semantic.danger} />
                </Pressable>
              )}
            </HStack>
          ))}

          {options.length < 5 && (
            <Pressable onPress={addOption} style={styles.addOption} accessibilityRole="button">
              <Plus size={16} color={colors.brand[600]} />
              <Text variant="body" style={{ color: colors.brand[600], fontWeight: '600' }}>
                Add option
              </Text>
            </Pressable>
          )}
        </VStack>

        {/* Duration */}
        <VStack gap={1.5}>
          <Text variant="caption" style={{ fontWeight: '700', color: colors.surface.heading }}>
            Duration
          </Text>
          <View style={styles.tagWrap}>
            {DURATIONS.map((d) => (
              <Pressable
                key={d.value}
                onPress={() => setDuration(d.value)}
                style={[styles.chip, duration === d.value && styles.chipSelected]}
                accessibilityRole="radio"
                accessibilityState={{ checked: duration === d.value }}
              >
                <Text
                  variant="caption"
                  style={{
                    fontWeight: '600',
                    color: duration === d.value ? colors.brand[700] : colors.surface.textSecondary,
                  }}
                >
                  {d.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </VStack>

        <Button
          label={submitting ? 'Creating…' : 'Create Poll'}
          onPress={handleCreate}
          disabled={submitting || !question.trim()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.surface.background },
  topBar:  {
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    borderBottomWidth: 0.5, borderBottomColor: colors.surface.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center',
  },
  input: {
    borderWidth: 1, borderColor: colors.surface.border, borderRadius: radius.md,
    padding: spacing[3], color: colors.surface.heading, fontSize: 14, lineHeight: 20,
  },
  optionNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.brand[50] ?? '#EEF4FB',
    alignItems: 'center', justifyContent: 'center',
  },
  removeBtn: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: '#FEF2F2',
    alignItems: 'center', justifyContent: 'center',
  },
  addOption: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[2],
    padding: spacing[3], borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.brand[300] ?? colors.brand[400],
    borderStyle: 'dashed', justifyContent: 'center',
  },
  tagWrap:      { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  chip:         {
    paddingHorizontal: spacing[3], paddingVertical: spacing[1.5],
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.surface.border,
    backgroundColor: colors.gray[100],
  },
  chipSelected: {
    borderColor: colors.brand[400],
    backgroundColor: colors.brand[50] ?? '#EEF4FB',
  },
});
