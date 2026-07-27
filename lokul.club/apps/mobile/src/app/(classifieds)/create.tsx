import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Camera, X } from 'lucide-react-native';
import { Button, HStack, Text, VStack } from '@/components/ui';
import { VerificationGate } from '@/components/VerificationGate';
import type { ClassifiedCategory } from '@/data/community-seed';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useVerificationStore } from '@/store/verificationStore';
import { useWalletStore } from '@/store/walletStore';
import { colors, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const CATEGORIES: { id: ClassifiedCategory; label: string }[] = [
  { id: 'electronics', label: 'Electronics' },
  { id: 'furniture', label: 'Furniture' },
  { id: 'kids', label: 'Kids' },
  { id: 'books', label: 'Books' },
  { id: 'sports', label: 'Sports' },
  { id: 'appliances', label: 'Appliances' },
  { id: 'other', label: 'Other' },
];

const CONDITIONS = [
  { id: 'new', label: 'New' },
  { id: 'like_new', label: 'Like New' },
  { id: 'good', label: 'Good' },
  { id: 'fair', label: 'Fair' },
];

export default function CreateListingScreen() {
  const router    = useRouter();
  const userId    = useWalletStore((s) => s.userId);
  const pinCode   = useOnboardingStore((s) => s.pin);
  const tier      = useVerificationStore((s) => s.tier);
  const params    = useLocalSearchParams<{ category?: ClassifiedCategory; condition?: string; title?: string }>();
  const [gateVisible,   setGateVisible]   = useState(false);
  const [title,       setTitle]       = useState(params.title ?? '');
  const [description, setDescription] = useState('');
  const [price,       setPrice]       = useState('');
  const [category,    setCategory]    = useState<ClassifiedCategory>(params.category ?? 'other');
  const [condition,   setCondition]   = useState(params.condition ?? 'good');
  const [submitting,  setSubmitting]  = useState(false);

  const canSubmit = title.trim() && description.trim() && category;

  const handlePost = async () => {
    if (!canSubmit || !userId || !pinCode) return;
    if (tier === 'bronze') { setGateVisible(true); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/classifieds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: userId, pinCode, title: title.trim(),
          description: description.trim(), category, condition,
          price: Number(price) || 0,
        }),
      });
      if (res.ok) router.back();
      else { const d = await res.json(); Alert.alert('Error', d.error ?? 'Failed'); }
    } catch { Alert.alert('Error', 'Network error'); } finally { setSubmitting(false); }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <HStack gap={3} align="center" style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn} accessibilityRole="button">
          <X size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Create Listing</Text>
        <Button
          label={submitting ? 'Posting…' : 'Post'}
          size="sm"
          disabled={!canSubmit || submitting}
          onPress={handlePost}
        />
      </HStack>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Photo */}
        <Pressable style={styles.photoBox} accessibilityRole="button">
          <Camera size={28} color={colors.gray[400]} />
          <Text variant="caption" tone="secondary" style={{ marginTop: spacing[1] }}>Add photos</Text>
        </Pressable>

        {/* Title */}
        <VStack gap={1} style={{ marginTop: spacing[4] }}>
          <Text variant="caption" style={{ color: colors.gray[500], fontWeight: '700' }}>TITLE</Text>
          <TextInput
            style={styles.textField}
            placeholder="What are you selling?"
            placeholderTextColor={colors.surface.textSecondary}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </VStack>

        {/* Description */}
        <VStack gap={1} style={{ marginTop: spacing[4] }}>
          <Text variant="caption" style={{ color: colors.gray[500], fontWeight: '700' }}>DESCRIPTION</Text>
          <TextInput
            style={[styles.textField, { minHeight: 100, textAlignVertical: 'top' }]}
            placeholder="Describe the item…"
            placeholderTextColor={colors.surface.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={500}
          />
        </VStack>

        {/* Price */}
        <VStack gap={1} style={{ marginTop: spacing[4] }}>
          <Text variant="caption" style={{ color: colors.gray[500], fontWeight: '700' }}>PRICE (₹)</Text>
          <TextInput
            style={styles.textField}
            placeholder="0 for free"
            placeholderTextColor={colors.surface.textSecondary}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            maxLength={10}
          />
        </VStack>

        {/* Category */}
        <VStack gap={2} style={{ marginTop: spacing[4] }}>
          <Text variant="caption" style={{ color: colors.gray[500], fontWeight: '700' }}>CATEGORY</Text>
          <View style={styles.chipWrap}>
            {CATEGORIES.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => setCategory(c.id)}
                style={[styles.chip, category === c.id && styles.chipActive]}
                accessibilityRole="button"
              >
                <Text
                  variant="caption"
                  style={{ fontWeight: '700', color: category === c.id ? '#fff' : colors.surface.foreground }}
                >
                  {c.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </VStack>

        {/* Condition */}
        <VStack gap={2} style={{ marginTop: spacing[4] }}>
          <Text variant="caption" style={{ color: colors.gray[500], fontWeight: '700' }}>CONDITION</Text>
          <HStack gap={2}>
            {CONDITIONS.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => setCondition(c.id)}
                style={[styles.chip, condition === c.id && styles.chipActive]}
                accessibilityRole="button"
              >
                <Text
                  variant="caption"
                  style={{ fontWeight: '700', color: condition === c.id ? '#fff' : colors.surface.foreground }}
                >
                  {c.label}
                </Text>
              </Pressable>
            ))}
          </HStack>
        </VStack>
      </ScrollView>

      <VerificationGate
        visible={gateVisible}
        onClose={() => setGateVisible(false)}
        action="publish this listing"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.background },
  topBar: {
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    borderBottomWidth: 0.5, borderBottomColor: colors.surface.border,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center',
  },
  content: { padding: spacing[5], paddingBottom: spacing[16] },
  photoBox: {
    height: 120, borderRadius: 14, backgroundColor: colors.gray[50],
    borderWidth: 1.5, borderColor: colors.surface.border, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  textField: {
    backgroundColor: colors.gray[50], borderRadius: 10, padding: spacing[4],
    fontSize: 15, color: colors.surface.heading,
    borderWidth: 1, borderColor: colors.surface.border,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  chip: {
    paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: 8,
    backgroundColor: colors.gray[100], borderWidth: 1.5, borderColor: 'transparent',
  },
  chipActive: { backgroundColor: colors.brand[600], borderColor: colors.brand[600] },
});
