// PRD §08 — Create Event (community events)
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Clock, MapPin, Tag } from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const CATEGORY_TAGS = [
  'festival', 'sport', 'education', 'health', 'culture',
  'maintenance', 'meeting', 'celebration', 'other',
];

export default function EventCreateScreen() {
  const router    = useRouter();
  const userId    = useWalletStore((s) => s.userId);
  const pinCode   = useOnboardingStore((s) => s.pin);

  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [venue,       setVenue]       = useState('');
  const [date,        setDate]        = useState('');
  const [time,        setTime]        = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [submitting,  setSubmitting]  = useState(false);

  async function handleCreate() {
    if (!title.trim()) { Alert.alert('Title required', 'Enter an event title.'); return; }
    if (!userId || !pinCode) { Alert.alert('Not logged in', 'Please complete onboarding first.'); return; }

    let eventDate: string | null = null;
    if (date.trim()) {
      const raw = time.trim() ? `${date.trim()}T${time.trim()}` : date.trim();
      const parsed = new Date(raw);
      if (isNaN(parsed.getTime())) {
        Alert.alert('Invalid date', 'Enter date as YYYY-MM-DD and time as HH:MM.');
        return;
      }
      eventDate = parsed.toISOString();
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/events`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          authorId:    userId,
          pinCode,
          title:       title.trim(),
          description: description.trim() || null,
          venue:       venue.trim() || null,
          eventDate,
          tags:        selectedTag ? [selectedTag] : [],
        }),
      });
      if (!res.ok) throw new Error('Failed to create event');
      router.back();
    } catch {
      Alert.alert('Error', 'Could not create event. Please try again.');
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
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Create Event</Text>
      </HStack>

      <ScrollView
        contentContainerStyle={{ padding: spacing[4], gap: spacing[4], paddingBottom: spacing[20] }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <VStack gap={1.5}>
          <Text variant="caption" style={{ fontWeight: '700', color: colors.surface.heading }}>
            Event Title *
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Diwali celebrations at clubhouse"
            placeholderTextColor={colors.surface.textSecondary}
            maxLength={100}
            style={styles.input}
          />
        </VStack>

        {/* Description */}
        <VStack gap={1.5}>
          <Text variant="caption" style={{ fontWeight: '700', color: colors.surface.heading }}>
            Description
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Details about the event…"
            placeholderTextColor={colors.surface.textSecondary}
            multiline
            numberOfLines={4}
            maxLength={500}
            style={[styles.input, styles.multiline]}
          />
        </VStack>

        {/* Venue */}
        <VStack gap={1.5}>
          <HStack gap={1.5} align="center">
            <MapPin size={14} color={colors.brand[600]} />
            <Text variant="caption" style={{ fontWeight: '700', color: colors.surface.heading }}>
              Venue
            </Text>
          </HStack>
          <TextInput
            value={venue}
            onChangeText={setVenue}
            placeholder="e.g. Clubhouse, Gate 2 lawn"
            placeholderTextColor={colors.surface.textSecondary}
            maxLength={100}
            style={styles.input}
          />
        </VStack>

        {/* Date + Time */}
        <HStack gap={3}>
          <VStack gap={1.5} style={{ flex: 1 }}>
            <HStack gap={1.5} align="center">
              <Calendar size={14} color={colors.brand[600]} />
              <Text variant="caption" style={{ fontWeight: '700', color: colors.surface.heading }}>
                Date
              </Text>
            </HStack>
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.surface.textSecondary}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
              style={styles.input}
            />
          </VStack>
          <VStack gap={1.5} style={{ flex: 1 }}>
            <HStack gap={1.5} align="center">
              <Clock size={14} color={colors.brand[600]} />
              <Text variant="caption" style={{ fontWeight: '700', color: colors.surface.heading }}>
                Time
              </Text>
            </HStack>
            <TextInput
              value={time}
              onChangeText={setTime}
              placeholder="HH:MM"
              placeholderTextColor={colors.surface.textSecondary}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
              style={styles.input}
            />
          </VStack>
        </HStack>

        {/* Category */}
        <VStack gap={1.5}>
          <HStack gap={1.5} align="center">
            <Tag size={14} color={colors.brand[600]} />
            <Text variant="caption" style={{ fontWeight: '700', color: colors.surface.heading }}>
              Category
            </Text>
          </HStack>
          <View style={styles.tagWrap}>
            {CATEGORY_TAGS.map((t) => (
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
          label={submitting ? 'Creating…' : 'Create Event'}
          onPress={handleCreate}
          disabled={submitting || !title.trim()}
          style={{ marginTop: spacing[2] }}
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
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  tagWrap:   { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  chip: {
    paddingHorizontal: spacing[3], paddingVertical: spacing[1.5],
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.surface.border,
    backgroundColor: colors.gray[50] ?? colors.gray[100],
  },
  chipSelected: {
    borderColor: colors.brand[400],
    backgroundColor: colors.brand[50] ?? '#EEF4FB',
  },
});
