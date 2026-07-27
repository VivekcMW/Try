// PRD §09 — Create RWA Notice (admin/staff only)
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Tag } from 'lucide-react-native';
import { Button, HStack, Text, VStack } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const NOTICE_TAGS = [
  'maintenance', 'water', 'electricity', 'parking',
  'security', 'cleanliness', 'payment', 'general',
];

export default function CreateNoticeScreen() {
  const router   = useRouter();
  const userId   = useWalletStore((s) => s.userId);
  const pinCode  = useOnboardingStore((s) => s.pin);

  const [body,        setBody]        = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [submitting,  setSubmitting]  = useState(false);

  async function handlePost() {
    if (!body.trim()) { Alert.alert('Content required', 'Write the notice content.'); return; }
    if (!userId || !pinCode) { Alert.alert('Not logged in', 'Please complete onboarding first.'); return; }

    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/posts`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          userId,
          pinCode,
          type:     'rwa_notice',
          postBody: body.trim(),
          tags:     selectedTag ? [selectedTag] : [],
        }),
      });
      if (!res.ok) throw new Error('Failed to post notice');
      router.back();
    } catch {
      Alert.alert('Error', 'Could not post notice. Please try again.');
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
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Post a Notice</Text>
      </HStack>

      <ScrollView
        contentContainerStyle={{ padding: spacing[4], gap: spacing[4], paddingBottom: spacing[20] }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Body */}
        <VStack gap={1.5}>
          <Text variant="caption" style={{ fontWeight: '700', color: colors.surface.heading }}>
            Notice Content *
          </Text>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Write the official notice here. It will be visible to all society members."
            placeholderTextColor={colors.surface.textSecondary}
            multiline
            numberOfLines={6}
            maxLength={1000}
            style={[styles.input, styles.multiline]}
          />
          <Text variant="caption" tone="secondary" style={{ textAlign: 'right' }}>
            {body.length}/1000
          </Text>
        </VStack>

        {/* Category */}
        <VStack gap={1.5}>
          <HStack gap={1.5} align="center">
            <Tag size={14} color={colors.brand[600]} />
            <Text variant="caption" style={{ fontWeight: '700', color: colors.surface.heading }}>
              Category
            </Text>
          </HStack>
          <View style={styles.tagWrap}>
            {NOTICE_TAGS.map((t) => (
              <Pressable
                key={t}
                onPress={() => setSelectedTag(selectedTag === t ? '' : t)}
                style={[styles.chip, selectedTag === t && styles.chipSelected]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selectedTag === t }}
              >
                <Text
                  variant="caption"
                  style={{
                    fontWeight: '600',
                    textTransform: 'capitalize',
                    color: selectedTag === t ? colors.brand[700] : colors.surface.textSecondary,
                  }}
                >
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>
        </VStack>

        <Button
          label={submitting ? 'Posting…' : 'Post Notice'}
          onPress={handlePost}
          disabled={submitting || !body.trim()}
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
  multiline: { minHeight: 140, textAlignVertical: 'top' },
  tagWrap:   { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  chip: {
    paddingHorizontal: spacing[3], paddingVertical: spacing[1.5],
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.surface.border,
    backgroundColor: colors.gray[100],
  },
  chipSelected: {
    borderColor: colors.brand[400],
    backgroundColor: colors.brand[50] ?? '#EEF4FB',
  },
});
