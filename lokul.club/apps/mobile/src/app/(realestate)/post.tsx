/**
 * Post a Property
 * Route: /(realestate)/post
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
import { PROPERTY_TYPES, type PropertyDealType } from './index';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type BuildingType = 'apartment' | 'house' | 'villa' | 'plot' | 'pg';

const BUILDING_TYPES: { id: BuildingType; label: string }[] = [
  { id: 'apartment', label: 'Apartment' },
  { id: 'house', label: 'House' },
  { id: 'villa', label: 'Villa' },
  { id: 'plot', label: 'Plot' },
  { id: 'pg', label: 'PG' },
];

export default function PostPropertyScreen() {
  const router = useRouter();
  const userId = useWalletStore((s) => s.userId);
  const pinCode = useOnboardingStore((s) => s.pin);

  const [dealType, setDealType] = useState<PropertyDealType>('sale');
  const [buildingType, setBuildingType] = useState<BuildingType>('apartment');
  const [title, setTitle] = useState('');
  const [bhk, setBhk] = useState('');
  const [area, setArea] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    const areaNum = Number(area.trim());
    const priceNum = Number(price.trim());

    if (!trimmedTitle || !location.trim()) {
      Alert.alert('Missing info', 'Please add a title and location.');
      return;
    }
    if (!area.trim() || Number.isNaN(areaNum) || areaNum <= 0) {
      Alert.alert('Invalid area', 'Please enter a valid area in sq.ft.');
      return;
    }
    if (!price.trim() || Number.isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Invalid price', 'Please enter a valid price.');
      return;
    }
    if (!userId || !pinCode) {
      Alert.alert('Not signed in', 'Please complete onboarding first.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/realestate/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: userId,
          title: trimmedTitle,
          dealType,
          buildingType,
          bhk: bhk.trim() || undefined,
          areaSqft: areaNum,
          pricePaise: Math.round(priceNum * 100),
          priceUnit: dealType === 'sale' ? undefined : '/month',
          location: location.trim(),
          description: description.trim() || undefined,
          pinCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error('failed');
      router.replace(`/(realestate)/property/${data.property.id}`);
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
        <Text variant="h3" style={{ fontWeight: '700' }}>List Your Property</Text>
      </HStack>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <VStack gap="lg">
          <VStack gap="xs">
            <Text variant="label" tone="secondary">Listing type</Text>
            <View style={styles.chipsWrap}>
              {PROPERTY_TYPES.map((t) => (
                <Pressable
                  key={t.id}
                  onPress={() => setDealType(t.id as PropertyDealType)}
                  style={[styles.chip, dealType === t.id && styles.chipActive]}
                >
                  <Text variant="caption" style={{ fontWeight: '600', color: dealType === t.id ? '#fff' : colors.foreground }}>
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </VStack>

          <VStack gap="xs">
            <Text variant="label" tone="secondary">Property type</Text>
            <View style={styles.chipsWrap}>
              {BUILDING_TYPES.map((t) => (
                <Pressable
                  key={t.id}
                  onPress={() => setBuildingType(t.id)}
                  style={[styles.chip, buildingType === t.id && styles.chipActive]}
                >
                  <Text variant="caption" style={{ fontWeight: '600', color: buildingType === t.id ? '#fff' : colors.foreground }}>
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </VStack>

          <VStack gap="xs">
            <Text variant="label" tone="secondary">Title</Text>
            <View style={styles.inputRow}>
              <TextInput style={styles.inputFlat} placeholder="e.g. 3 BHK Apartment for Sale" placeholderTextColor={colors.textDisabled} value={title} onChangeText={setTitle} />
            </View>
          </VStack>

          <VStack gap="xs">
            <Text variant="label" tone="secondary">Configuration (optional)</Text>
            <View style={styles.inputRow}>
              <TextInput style={styles.inputFlat} placeholder="e.g. 3 BHK" placeholderTextColor={colors.textDisabled} value={bhk} onChangeText={setBhk} />
            </View>
          </VStack>

          <HStack gap="md">
            <VStack gap="xs" style={{ flex: 1 }}>
              <Text variant="label" tone="secondary">Area (sq.ft)</Text>
              <View style={styles.inputRow}>
                <TextInput style={styles.inputFlat} placeholder="1200" placeholderTextColor={colors.textDisabled} value={area} onChangeText={setArea} keyboardType="numeric" />
              </View>
            </VStack>
            <VStack gap="xs" style={{ flex: 1 }}>
              <Text variant="label" tone="secondary">Price (₹{dealType === 'sale' ? '' : '/month'})</Text>
              <View style={styles.inputRow}>
                <TextInput style={styles.inputFlat} placeholder="0" placeholderTextColor={colors.textDisabled} value={price} onChangeText={setPrice} keyboardType="numeric" />
              </View>
            </VStack>
          </HStack>

          <VStack gap="xs">
            <Text variant="label" tone="secondary">Location</Text>
            <View style={styles.inputRow}>
              <TextInput style={styles.inputFlat} placeholder="e.g. Block B, Harmony Heights" placeholderTextColor={colors.textDisabled} value={location} onChangeText={setLocation} />
            </View>
          </VStack>

          <VStack gap="xs">
            <Text variant="label" tone="secondary">Description (optional)</Text>
            <View style={[styles.inputRow, styles.textAreaRow]}>
              <TextInput
                style={[styles.inputFlat, styles.textArea]}
                placeholder="Describe the property, amenities, etc."
                placeholderTextColor={colors.textDisabled}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </View>
          </VStack>

          <Button label={saving ? 'Posting…' : 'Post Listing'} onPress={handleSubmit} disabled={saving} fullWidth />
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
