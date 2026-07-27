import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Baby, Clock, MapPin, Users } from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing } from '@lokul/ui-tokens';
import { useWalletStore } from '@/store/walletStore';
import { type Playdate } from '../index';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export default function PlaydateDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = useWalletStore((s) => s.userId);
  const [playdate, setPlaydate] = useState<Playdate | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/kids/playdates/${id}`);
      const data = await res.json();
      setPlaydate(res.ok ? data.playdate : null);
    } catch {
      setPlaydate(null);
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

  async function handleJoin() {
    if (!playdate) return;
    if (!userId) {
      Alert.alert('Not signed in', 'Please complete onboarding first.');
      return;
    }
    setJoining(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/kids/playdates/${playdate.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.status === 409) {
        Alert.alert('Playdate full', 'Sorry, this playdate has no spots left.');
        return;
      }
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      setPlaydate(data.playdate);
      Alert.alert('You\'re in!', 'You have joined this playdate.');
    } catch {
      Alert.alert('Error', 'Could not join — please try again.');
    } finally {
      setJoining(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700', flex: 1, textAlign: 'center' }} numberOfLines={1}>
          {playdate?.title ?? 'Playdate'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {!playdate ? (
        <View style={styles.notFound}>
          <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
            This playdate could not be found. It may have been removed.
          </Text>
          <Button label="Go back" onPress={() => router.back()} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <VStack gap={4}>
            <Text variant="h2" style={{ fontWeight: '700' }}>{playdate.title}</Text>
            <Text variant="body" tone="secondary">
              Hosted by {playdate.host.name}
            </Text>

            <Card padding={4} elevation="xs" bordered>
              <VStack gap={2.5}>
                <Row label="Date" value={playdate.dateLabel} />
                <Row label="Time" value={playdate.timeLabel} />
                <Row label="Location" value={playdate.location} />
                <Row label="Age group" value={playdate.ageGroup} />
                <Row label="Spots left" value={`${playdate.spotsLeft} of ${playdate.totalSpots}`} bold />
              </VStack>
            </Card>

            {playdate.notes && (
              <Card padding={4} elevation="none" bordered>
                <Text variant="body" tone="secondary">{playdate.notes}</Text>
              </Card>
            )}

            <HStack gap={2} align="center">
              <Clock size={14} color={colors.textSecondary} />
              <Text variant="caption" tone="secondary">{playdate.timeLabel}</Text>
              <MapPin size={14} color={colors.textSecondary} />
              <Text variant="caption" tone="secondary">{playdate.location}</Text>
            </HStack>

            <VStack gap={2}>
              <HStack gap={1} align="center">
                <Users size={14} color={colors.textSecondary} />
                <Text variant="label" tone="secondary">Kids attending ({playdate.attendees.length})</Text>
              </HStack>
              <HStack gap={2} wrap style={{ flexWrap: 'wrap' }}>
                {playdate.attendees.map((attendee) => (
                  <View key={attendee.id} style={styles.kidChip}>
                    <Baby size={12} color={colors.brand[600]} />
                    <Text variant="caption">{attendee.kidName}</Text>
                  </View>
                ))}
              </HStack>
            </VStack>

            <Button
              label={playdate.spotsLeft > 0 ? (joining ? 'Joining…' : 'Join Playdate') : 'Fully Booked'}
              disabled={playdate.spotsLeft <= 0 || joining}
              loading={joining}
              onPress={handleJoin}
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
  kidChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.brand[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
  },
});
