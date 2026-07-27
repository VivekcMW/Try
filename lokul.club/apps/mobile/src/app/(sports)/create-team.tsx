// Sports Hub — Create Team
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import { Button, Card, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { SPORTS } from '@/data/sports-catalog';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { type League } from './index';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export default function CreateTeamScreen() {
  const router = useRouter();
  const { leagueId: leagueIdParam } = useLocalSearchParams<{ leagueId?: string }>();
  const pinCode = useOnboardingStore((s) => s.pin);
  const userId = useWalletStore((s) => s.userId);
  const onboardingName = useOnboardingStore((s) => s.name);
  const onboardingFlat = useOnboardingStore((s) => s.flat);
  const [leagues, setLeagues] = useState<League[]>([]);

  useEffect(() => {
    if (!pinCode) return;
    fetch(`${BASE}/api/mobile/sports/leagues?pinCode=${pinCode}`)
      .then((res) => res.json())
      .then((data) => setLeagues(data.leagues ?? []))
      .catch(() => setLeagues([]));
  }, [pinCode]);

  const preselectedLeague = leagues.find((l) => l.id === leagueIdParam);

  const [name, setName] = useState('');
  const [sport, setSport] = useState(preselectedLeague?.sport ?? SPORTS[0].id);
  const [leagueId, setLeagueId] = useState<string | null>(preselectedLeague?.id ?? null);
  const [captain, setCaptain] = useState(onboardingName);
  const [captainFlat, setCaptainFlat] = useState(onboardingFlat);
  const [maxMembers, setMaxMembers] = useState('12');
  const [lookingForPlayers, setLookingForPlayers] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!name.trim() || !captain.trim()) {
      Alert.alert('Missing details', 'Please fill in a team name and captain name.');
      return;
    }
    const maxMembersNum = Number.parseInt(maxMembers, 10);
    if (!Number.isFinite(maxMembersNum) || maxMembersNum < 1) {
      Alert.alert('Invalid roster size', 'Max members must be a number of 1 or more.');
      return;
    }
    if (!userId || !pinCode) {
      Alert.alert('Not signed in', 'Please complete onboarding first.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/sports/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: userId,
          name: name.trim(),
          sport,
          leagueId,
          captain: captain.trim(),
          captainFlat: captainFlat.trim(),
          maxMembers: maxMembersNum,
          lookingForPlayers,
          pinCode,
        }),
      });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      router.replace({ pathname: '/(sports)/team/[id]', params: { id: data.team.id } });
    } catch {
      Alert.alert('Error', 'Could not create the team — please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>Create Team</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <VStack gap={4}>
          <VStack gap={1.5}>
            <Text variant="caption" style={{ fontWeight: '700' }}>Team name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Block A United"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
            />
          </VStack>

          <VStack gap={2}>
            <Text variant="caption" style={{ fontWeight: '700' }}>Sport</Text>
            <View style={styles.chipRow}>
              {SPORTS.map((s) => {
                const active = sport === s.id;
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => setSport(s.id)}
                    style={[styles.chip, active && { borderColor: s.color, backgroundColor: `${s.color}20` }]}
                  >
                    <Text variant="caption" style={{ fontWeight: '600', color: active ? s.color : colors.foreground }}>
                      {s.name}
                    </Text>
                    {active && <Check size={12} color={s.color} strokeWidth={3} />}
                  </Pressable>
                );
              })}
            </View>
          </VStack>

          <VStack gap={2}>
            <Text variant="caption" style={{ fontWeight: '700' }}>League (optional)</Text>
            {leagues.length === 0 ? (
              <Card padding={3} elevation="none" bordered>
                <Text variant="caption" tone="secondary">
                  No leagues yet — this team will be an independent/social team. You can create a league first if you want to register it into one.
                </Text>
              </Card>
            ) : (
              <View style={styles.chipRow}>
                <Pressable
                  onPress={() => setLeagueId(null)}
                  style={[styles.chip, leagueId === null && styles.chipActive]}
                >
                  <Text variant="caption" style={{ fontWeight: '600', color: leagueId === null ? colors.brand[600] : colors.foreground }}>
                    None
                  </Text>
                </Pressable>
                {leagues.map((l) => {
                  const active = leagueId === l.id;
                  return (
                    <Pressable
                      key={l.id}
                      onPress={() => setLeagueId(l.id)}
                      style={[styles.chip, active && styles.chipActive]}
                    >
                      <Text variant="caption" style={{ fontWeight: '600', color: active ? colors.brand[600] : colors.foreground }}>
                        {l.name}
                      </Text>
                      {active && <Check size={12} color={colors.brand[600]} strokeWidth={3} />}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </VStack>

          <View style={styles.row}>
            <VStack gap={1.5} style={{ flex: 1 }}>
              <Text variant="caption" style={{ fontWeight: '700' }}>Captain</Text>
              <TextInput
                value={captain}
                onChangeText={setCaptain}
                placeholder="Your name"
                placeholderTextColor={colors.textSecondary}
                style={styles.input}
              />
            </VStack>
            <VStack gap={1.5} style={{ flex: 1 }}>
              <Text variant="caption" style={{ fontWeight: '700' }}>Flat / unit</Text>
              <TextInput
                value={captainFlat}
                onChangeText={setCaptainFlat}
                placeholder="e.g. A-301"
                placeholderTextColor={colors.textSecondary}
                style={styles.input}
              />
            </VStack>
          </View>

          <VStack gap={1.5}>
            <Text variant="caption" style={{ fontWeight: '700' }}>Max roster size</Text>
            <TextInput
              value={maxMembers}
              onChangeText={setMaxMembers}
              placeholder="12"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              style={styles.input}
            />
          </VStack>

          <Pressable onPress={() => setLookingForPlayers((v) => !v)} style={styles.toggleRow}>
            <View style={[styles.checkbox, lookingForPlayers && { backgroundColor: colors.brand[600], borderColor: colors.brand[600] }]}>
              {lookingForPlayers && <Check size={13} color="#fff" strokeWidth={3} />}
            </View>
            <VStack gap={0.5} style={{ flex: 1 }}>
              <Text variant="body" style={{ fontWeight: '600' }}>Recruiting players</Text>
              <Text variant="caption" tone="secondary">Let neighbors know this team is looking for more members</Text>
            </VStack>
          </Pressable>
        </VStack>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={submitting ? 'Creating…' : 'Create Team'}
          onPress={submit}
          loading={submitting}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceMuted },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing.lg, paddingBottom: spacing[10] },
  row: { flexDirection: 'row', gap: spacing.md },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.foreground,
    backgroundColor: colors.background,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipActive: { borderColor: colors.brand[600], backgroundColor: colors.brand[50] },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing[6],
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
