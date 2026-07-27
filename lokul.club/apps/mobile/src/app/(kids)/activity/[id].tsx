import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Baby, Calendar, Clock, MapPin, Star } from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { useWalletStore } from '@/store/walletStore';
import { CATEGORIES, type Activity } from '../index';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export default function ActivityDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = useWalletStore((s) => s.userId);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const category = CATEGORIES.find((c) => c.id === activity?.category);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/kids/activities/${id}`);
      const data = await res.json();
      setActivity(res.ok ? data.activity : null);
    } catch {
      setActivity(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleEnroll() {
    if (!activity) return;
    if (!userId) {
      Alert.alert('Not signed in', 'Please complete onboarding first.');
      return;
    }
    setEnrolling(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/kids/activities/${activity.id}/enroll`, { method: 'POST' });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      setActivity(data.activity);
      Alert.alert('Enrolled!', `You're enrolled in ${activity.name}.`);
    } catch {
      Alert.alert('Error', 'Could not enroll — please try again.');
    } finally {
      setEnrolling(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700', flex: 1, textAlign: 'center' }} numberOfLines={1}>
          {activity?.name ?? 'Activity'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {!activity ? (
        <View style={styles.notFound}>
          <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
            This activity could not be found. It may have been removed.
          </Text>
          <Button label="Go back" onPress={() => router.back()} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <VStack gap={4}>
            {activity.featured && (
              <View style={styles.featuredBadge}>
                <Star size={12} color={colors.surface.background} fill={colors.surface.background} />
                <Text variant="caption" style={{ color: colors.surface.background, fontWeight: '700' }}>
                  Popular
                </Text>
              </View>
            )}

            <Text variant="h2" style={{ fontWeight: '700' }}>{activity.name}</Text>
            {category && (
              <Text variant="body" tone="secondary">{category.name}</Text>
            )}

            <Card padding={4} elevation="xs" bordered>
              <VStack gap={2.5}>
                <Row label="Instructor" value={activity.host.name} />
                <Row label="Age group" value={activity.ageGroup} />
                <Row label="Schedule" value={activity.schedule} />
                <Row label="Duration" value={activity.duration} />
                {activity.location && <Row label="Location" value={activity.location} />}
                <Row label="Price" value={`₹${Math.round(activity.pricePaise / 100)}/${activity.priceType === 'session' ? 'session' : 'mo'}`} bold />
                <Row label="Spots left" value={`${activity.spotsLeft} of ${activity.totalSpots}`} />
              </VStack>
            </Card>

            {activity.description && (
              <Card padding={4} elevation="none" bordered>
                <Text variant="body" tone="secondary">{activity.description}</Text>
              </Card>
            )}

            <HStack gap={4} align="center">
              <HStack gap={1} align="center">
                <Star size={14} color={colors.warning} fill={colors.warning} />
                <Text variant="caption">{activity.rating} ({activity.reviews} reviews)</Text>
              </HStack>
              <HStack gap={1} align="center">
                <Baby size={14} color={colors.textSecondary} />
                <Text variant="caption" tone="secondary">Hosted by a neighbor</Text>
              </HStack>
            </HStack>

            <HStack gap={4} align="center">
              <Calendar size={14} color={colors.textSecondary} />
              <Text variant="caption" tone="secondary">{activity.schedule}</Text>
              <Clock size={14} color={colors.textSecondary} />
              <Text variant="caption" tone="secondary">{activity.duration}</Text>
              {activity.location && (
                <>
                  <MapPin size={14} color={colors.textSecondary} />
                  <Text variant="caption" tone="secondary">{activity.location}</Text>
                </>
              )}
            </HStack>

            <Button
              label={activity.spotsLeft > 0 ? (enrolling ? 'Enrolling…' : 'Enroll now') : 'Fully booked'}
              disabled={activity.spotsLeft <= 0 || enrolling}
              loading={enrolling}
              fullWidth
              onPress={handleEnroll}
            />
          </VStack>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function Row({ label, value, bold }: { readonly label: string; readonly value: string; readonly bold?: boolean }) {
  return (
    <HStack gap={2} align="center" style={{ justifyContent: 'space-between' }}>
      <Text variant="caption" tone="secondary">{label}</Text>
      <Text variant="caption" style={{ fontWeight: bold ? '800' : '600', color: bold ? colors.brand[700] : colors.surface.foreground }}>
        {value}
      </Text>
    </HStack>
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
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[4],
    padding: spacing[6],
  },
  featuredBadge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
});
