// PRD §09 — Report Lost / Found item
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, Package } from 'lucide-react-native';
import { Button, HStack, Text, VStack } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const CATEGORIES = [
  'keys', 'wallet', 'phone', 'bag', 'jewellery',
  'documents', 'pet', 'cycle', 'other',
];

export default function CreateLostFoundScreen() {
  const router   = useRouter();
  const userId   = useWalletStore((s) => s.userId);
  const pinCode  = useOnboardingStore((s) => s.pin);

  const [itemType,   setItemType]   = useState<'lost' | 'found'>('lost');
  const [title,      setTitle]      = useState('');
  const [description,setDescription]= useState('');
  const [location,   setLocation]   = useState('');
  const [category,   setCategory]   = useState('');
  const [contact,    setContact]    = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handlePost() {
    if (!title.trim()) { Alert.alert('Title required', 'Describe the item briefly.'); return; }
    if (!userId || !pinCode) { Alert.alert('Not logged in', 'Please complete onboarding first.'); return; }

    const body = [
      title.trim(),
      description.trim() ? `\n${description.trim()}` : '',
      location.trim() ? `\n📍 Last seen: ${location.trim()}` : '',
      contact.trim()  ? `\n📞 Contact: ${contact.trim()}` : '',
    ].join('');

    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/posts`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          userId,
          pinCode,
          type:     'lost',
          postBody: body,
          tags:     [itemType, category].filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error('Failed to post item');
      router.back();
    } catch {
      Alert.alert('Error', 'Could not post item. Please try again.');
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
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Report Item</Text>
      </HStack>

      <ScrollView
        contentContainerStyle={{ padding: spacing[4], gap: spacing[4], paddingBottom: spacing[20] }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Lost / Found toggle */}
        <VStack gap={1.5}>
          <Text variant="caption" style={{ fontWeight: '700', color: colors.surface.heading }}>
            Type *
          </Text>
          <HStack gap={3}>
            {(['lost', 'found'] as const).map((t) => (
              <Pressable
                key={t}
                onPress={() => setItemType(t)}
                style={[styles.typeBtn, itemType === t && styles.typeBtnSelected]}
                accessibilityRole="radio"
                accessibilityState={{ checked: itemType === t }}
              >
                {t === 'lost'
                  ? <Search size={16} color={itemType === t ? colors.brand[600] : colors.surface.textSecondary} />
                  : <Package size={16} color={itemType === t ? colors.brand[600] : colors.surface.textSecondary} />
                }
                <Text
                  variant="body"
                  style={{
                    fontWeight: '700',
                    textTransform: 'capitalize',
                    color: itemType === t ? colors.brand[700] : colors.surface.textSecondary,
                  }}
                >
                  {t === 'lost' ? 'I lost something' : 'I found something'}
                </Text>
              </Pressable>
            ))}
          </HStack>
        </VStack>

        {/* Title */}
        <VStack gap={1.5}>
          <Text variant="caption" style={{ fontWeight: '700', color: colors.surface.heading }}>
            Item Name / Description *
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={itemType === 'lost' ? 'e.g. Black wallet with Axis card' : 'e.g. Silver keys found near Gate 1'}
            placeholderTextColor={colors.surface.textSecondary}
            maxLength={120}
            style={styles.input}
          />
        </VStack>

        {/* More details */}
        <VStack gap={1.5}>
          <Text variant="caption" style={{ fontWeight: '700', color: colors.surface.heading }}>
            More Details
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Any distinctive features, colour, brand…"
            placeholderTextColor={colors.surface.textSecondary}
            multiline
            numberOfLines={3}
            maxLength={300}
            style={[styles.input, styles.multiline]}
          />
        </VStack>

        {/* Location */}
        <VStack gap={1.5}>
          <Text variant="caption" style={{ fontWeight: '700', color: colors.surface.heading }}>
            Location
          </Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder={itemType === 'lost' ? 'Where did you last have it?' : 'Where did you find it?'}
            placeholderTextColor={colors.surface.textSecondary}
            maxLength={100}
            style={styles.input}
          />
        </VStack>

        {/* Category */}
        <VStack gap={1.5}>
          <Text variant="caption" style={{ fontWeight: '700', color: colors.surface.heading }}>
            Category
          </Text>
          <View style={styles.tagWrap}>
            {CATEGORIES.map((c) => (
              <Pressable
                key={c}
                onPress={() => setCategory(category === c ? '' : c)}
                style={[styles.chip, category === c && styles.chipSelected]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: category === c }}
              >
                <Text
                  variant="caption"
                  style={{
                    fontWeight: '600',
                    textTransform: 'capitalize',
                    color: category === c ? colors.brand[700] : colors.surface.textSecondary,
                  }}
                >
                  {c}
                </Text>
              </Pressable>
            ))}
          </View>
        </VStack>

        {/* Contact */}
        <VStack gap={1.5}>
          <Text variant="caption" style={{ fontWeight: '700', color: colors.surface.heading }}>
            Contact Number
          </Text>
          <TextInput
            value={contact}
            onChangeText={setContact}
            placeholder="Your phone number (optional)"
            placeholderTextColor={colors.surface.textSecondary}
            keyboardType="phone-pad"
            maxLength={15}
            style={styles.input}
          />
        </VStack>

        <Button
          label={submitting ? 'Posting…' : `Post ${itemType === 'lost' ? 'Lost' : 'Found'} Item`}
          onPress={handlePost}
          disabled={submitting || !title.trim()}
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
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  typeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing[2],
    padding: spacing[3], borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.surface.border,
    justifyContent: 'center',
  },
  typeBtnSelected: {
    borderColor: colors.brand[400],
    backgroundColor: colors.brand[50] ?? '#EEF4FB',
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
