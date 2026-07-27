// Sports Hub — Create / Edit Player Profile
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import { Button, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { AVAILABILITY_DAYS, SKILL_LEVELS, SPORTS, type SkillLevel } from '@/data/sports-catalog';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { type PlayerProfile } from './index';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export default function CreateProfileScreen() {
  const router = useRouter();
  const pinCode = useOnboardingStore((s) => s.pin);
  const userId = useWalletStore((s) => s.userId);
  const onboardingFlat = useOnboardingStore((s) => s.flat);
  const [myProfile, setMyProfile] = useState<PlayerProfile | null>(null);

  useEffect(() => {
    if (!userId) return;
    fetch(`${BASE}/api/mobile/sports/players?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => setMyProfile(data.profile ?? null))
      .catch(() => setMyProfile(null));
  }, [userId]);

  const [flat, setFlat] = useState(myProfile?.flat ?? onboardingFlat);
  const [sports, setSports] = useState<string[]>(myProfile?.sports ?? []);
  const [skill, setSkill] = useState<SkillLevel>(myProfile?.skill ?? 'beginner');
  const [available, setAvailable] = useState<string[]>(myProfile?.available ?? []);
  const [bio, setBio] = useState(myProfile?.bio ?? '');
  const [lookingToJoin, setLookingToJoin] = useState(myProfile?.lookingToJoin ?? true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (myProfile) {
      setFlat(myProfile.flat);
      setSports(myProfile.sports);
      setSkill(myProfile.skill);
      setAvailable(myProfile.available);
      setBio(myProfile.bio ?? '');
      setLookingToJoin(myProfile.lookingToJoin);
    }
  }, [myProfile]);

  const toggleSport = (sportName: string) =>
    setSports((s) => (s.includes(sportName) ? s.filter((x) => x !== sportName) : [...s, sportName]));

  const toggleDay = (day: string) =>
    setAvailable((s) => (s.includes(day) ? s.filter((x) => x !== day) : [...s, day]));

  const submit = async () => {
    if (sports.length === 0) {
      Alert.alert('Missing details', 'Please pick at least one sport.');
      return;
    }
    if (!userId || !pinCode) {
      Alert.alert('Not signed in', 'Please complete onboarding first.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/sports/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          flat: flat.trim(),
          sports,
          skill,
          lookingToJoin,
          available,
          bio: bio.trim() || undefined,
          pinCode,
        }),
      });
      if (!res.ok) throw new Error('failed');
      router.back();
    } catch {
      Alert.alert('Error', 'Could not save your profile — please try again.');
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
        <Text variant="h3" style={{ fontWeight: '700' }}>{myProfile ? 'Edit Profile' : 'Create Profile'}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <VStack gap={4}>
          <VStack gap={1.5}>
            <Text variant="caption" style={{ fontWeight: '700' }}>Flat / unit</Text>
            <TextInput
              value={flat}
              onChangeText={setFlat}
              placeholder="e.g. C-404"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
            />
          </VStack>

          <VStack gap={2}>
            <Text variant="caption" style={{ fontWeight: '700' }}>Sports you play</Text>
            <View style={styles.chipRow}>
              {SPORTS.map((s) => {
                const active = sports.includes(s.name);
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => toggleSport(s.name)}
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
            <Text variant="caption" style={{ fontWeight: '700' }}>Skill level</Text>
            <View style={styles.chipRow}>
              {SKILL_LEVELS.map((s) => {
                const active = skill === s.id;
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => setSkill(s.id)}
                    style={[styles.chip, active && { borderColor: s.color, backgroundColor: `${s.color}20` }]}
                  >
                    <Text variant="caption" style={{ fontWeight: '600', color: active ? s.color : colors.foreground }}>
                      {s.label}
                    </Text>
                    {active && <Check size={12} color={s.color} strokeWidth={3} />}
                  </Pressable>
                );
              })}
            </View>
          </VStack>

          <VStack gap={2}>
            <Text variant="caption" style={{ fontWeight: '700' }}>Availability</Text>
            <View style={styles.chipRow}>
              {AVAILABILITY_DAYS.map((day) => {
                const active = available.includes(day);
                return (
                  <Pressable
                    key={day}
                    onPress={() => toggleDay(day)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text variant="caption" style={{ fontWeight: '600', color: active ? colors.brand[600] : colors.foreground }}>
                      {day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </VStack>

          <VStack gap={1.5}>
            <Text variant="caption" style={{ fontWeight: '700' }}>Bio</Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Tell neighbors a bit about how you like to play"
              placeholderTextColor={colors.textSecondary}
              multiline
              style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
            />
          </VStack>

          <Pressable onPress={() => setLookingToJoin((v) => !v)} style={styles.toggleRow}>
            <View style={[styles.checkbox, lookingToJoin && { backgroundColor: colors.brand[600], borderColor: colors.brand[600] }]}>
              {lookingToJoin && <Check size={13} color="#fff" strokeWidth={3} />}
            </View>
            <VStack gap={0.5} style={{ flex: 1 }}>
              <Text variant="body" style={{ fontWeight: '600' }}>Looking to join a team</Text>
              <Text variant="caption" tone="secondary">Show up in "Looking to Play" so team captains can find you</Text>
            </VStack>
          </Pressable>
        </VStack>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={submitting ? 'Saving…' : myProfile ? 'Save Changes' : 'Create Profile'}
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
