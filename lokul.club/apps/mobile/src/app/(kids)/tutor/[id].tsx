import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Phone, Star } from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing } from '@lokul/ui-tokens';
import { type Tutor } from '../index';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export default function TutorDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/kids/tutors/${id}`);
      const data = await res.json();
      setTutor(res.ok ? data.tutor : null);
    } catch {
      setTutor(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      </SafeAreaView>
    );
  }

  function handleContact() {
    if (!tutor) return;
    if (tutor.phone) {
      Linking.openURL(`tel:${tutor.phone}`).catch(() => {
        Alert.alert('Error', 'Could not open the phone dialer.');
      });
    } else {
      Alert.alert('Contact', `Reach out to ${tutor.user.name} through the community directory.`);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700', flex: 1, textAlign: 'center' }} numberOfLines={1}>
          {tutor?.user.name ?? 'Tutor'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {!tutor ? (
        <View style={styles.notFound}>
          <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
            This tutor profile could not be found. It may have been removed.
          </Text>
          <Button label="Go back" onPress={() => router.back()} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <VStack gap={4}>
            <View style={styles.avatar}>
              <Text variant="h2" style={{ color: colors.brand[600], fontWeight: '700' }}>
                {tutor.user.name.split(' ').map((n) => n[0]).join('')}
              </Text>
            </View>
            <Text variant="h2" style={{ fontWeight: '700' }}>{tutor.user.name}</Text>
            <Text variant="body" tone="secondary">{tutor.flat} • {tutor.experience}</Text>

            <HStack gap={2} align="center">
              <Star size={16} color={colors.warning} fill={colors.warning} />
              <Text variant="body" style={{ fontWeight: '600' }}>{tutor.rating}</Text>
              <Text variant="caption" tone="secondary">({tutor.reviews} reviews)</Text>
            </HStack>

            <HStack gap={2} wrap style={{ flexWrap: 'wrap' }}>
              {tutor.subjects.map((sub) => (
                <View key={sub} style={styles.subjectChip}>
                  <Text variant="caption">{sub}</Text>
                </View>
              ))}
            </HStack>

            <Card padding={4} elevation="xs" bordered>
              <VStack gap={2.5}>
                <Row label="Grades" value={tutor.grades} />
                <Row label="Experience" value={tutor.experience} />
                {tutor.availability && <Row label="Availability" value={tutor.availability} />}
                <Row label="Rate" value={`₹${Math.round(tutor.pricePerHourPaise / 100)}/hr`} bold />
                <Row label="Status" value={tutor.available ? 'Available' : 'Unavailable'} />
              </VStack>
            </Card>

            {tutor.bio && (
              <Card padding={4} elevation="none" bordered>
                <Text variant="body" tone="secondary">{tutor.bio}</Text>
              </Card>
            )}

            <Button
              label="Contact Tutor"
              leftIcon={<Phone size={16} color="#ffffff" />}
              onPress={handleContact}
              fullWidth
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
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectChip: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
  },
});
