import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Button, Card, HStack, Input, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { CATEGORIES } from './index';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export default function AddActivityScreen() {
  const router = useRouter();
  const pinCode = useOnboardingStore((s) => s.pin);
  const userId = useWalletStore((s) => s.userId);

  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]!.id);
  const [ageGroup, setAgeGroup] = useState('');
  const [schedule, setSchedule] = useState('');
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('');
  const [totalSpots, setTotalSpots] = useState('8');
  const [price, setPrice] = useState('');
  const [priceType, setPriceType] = useState<'session' | 'month'>('session');
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!name.trim() || !ageGroup.trim() || !schedule.trim() || !price.trim()) {
      Alert.alert('Missing info', 'Please fill in name, age group, schedule and price.');
      return;
    }
    const spots = parseInt(totalSpots, 10);
    const priceNum = parseFloat(price);
    if (!Number.isFinite(spots) || spots <= 0) {
      Alert.alert('Invalid spots', 'Total spots must be a positive number.');
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      Alert.alert('Invalid price', 'Please enter a valid price.');
      return;
    }
    if (!userId || !pinCode) {
      Alert.alert('Not signed in', 'Please complete onboarding first.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/kids/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostId: userId,
          name: name.trim(),
          category,
          ageGroup: ageGroup.trim(),
          schedule: schedule.trim(),
          duration: duration.trim() || undefined,
          location: location.trim() || undefined,
          totalSpots: spots,
          pricePaise: Math.round(priceNum * 100),
          priceType,
          pinCode,
        }),
      });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      router.replace(`/(kids)/activity/${data.activity.id}`);
    } catch {
      Alert.alert('Error', 'Could not create the activity — please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>Add an Activity</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <VStack gap={4}>
          <Input label="Activity name" placeholder="e.g. Watercolor Painting" value={name} onChangeText={setName} />

          <Text variant="label" tone="secondary">Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            {CATEGORIES.map((cat) => {
              const selected = category === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setCategory(cat.id)}
                  style={[styles.categoryChip, selected && { backgroundColor: cat.color, borderColor: cat.color }]}
                >
                  <Text variant="caption" style={{ color: selected ? '#ffffff' : colors.foreground, fontWeight: selected ? '600' : '400' }}>
                    {cat.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Input label="Age group" placeholder="e.g. 5-12 years" value={ageGroup} onChangeText={setAgeGroup} />
          <Input label="Schedule" placeholder="e.g. Sat & Sun" value={schedule} onChangeText={setSchedule} />
          <Input label="Duration" placeholder="e.g. 1.5 hours" value={duration} onChangeText={setDuration} />
          <Input label="Location (optional)" placeholder="e.g. Clubhouse hall" value={location} onChangeText={setLocation} />
          <Input
            label="Total spots"
            placeholder="8"
            value={totalSpots}
            onChangeText={setTotalSpots}
            keyboardType="number-pad"
          />
          <Input
            label="Price (₹)"
            placeholder="e.g. 400"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />

          <Text variant="label" tone="secondary">Billed per</Text>
          <HStack gap={2}>
            {(['session', 'month'] as const).map((pt) => {
              const active = priceType === pt;
              return (
                <Pressable
                  key={pt}
                  onPress={() => setPriceType(pt)}
                  style={[styles.pill, active && styles.pillActive]}
                >
                  <Text variant="caption" style={{ color: active ? '#fff' : colors.foreground, fontWeight: '600' }}>
                    {pt === 'session' ? 'Per session' : 'Per month'}
                  </Text>
                </Pressable>
              );
            })}
          </HStack>

          <Card padding={4} elevation="none" bordered style={{ marginTop: spacing.sm }}>
            <Text variant="caption" tone="secondary">
              Your activity will be listed to the whole community and marked as hosted by a neighbor.
            </Text>
          </Card>

          <Button
            label={submitting ? 'Creating…' : 'Create Activity'}
            onPress={submit}
            loading={submitting}
            fullWidth
          />
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.surface.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surface.border,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing[5], paddingBottom: spacing[10] },
  categoryRow: { gap: spacing.sm, paddingVertical: spacing.xs },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.background,
  },
  pillActive: { backgroundColor: colors.brand[600], borderColor: colors.brand[600] },
});
