// Sports Hub — Create League
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import { Button, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { SPORTS } from '@/data/sports-catalog';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export default function CreateLeagueScreen() {
  const router = useRouter();
  const pinCode = useOnboardingStore((s) => s.pin);
  const userId = useWalletStore((s) => s.userId);

  const [name, setName] = useState('');
  const [sport, setSport] = useState(SPORTS[0].id);
  const [format, setFormat] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [entryFee, setEntryFee] = useState('');
  const [prize, setPrize] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxTeams, setMaxTeams] = useState('8');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!name.trim() || !format.trim() || !venue.trim() || !startDate.trim() || !endDate.trim()) {
      Alert.alert('Missing details', 'Please fill in name, format, venue, and start/end dates.');
      return;
    }
    const maxTeamsNum = Number.parseInt(maxTeams, 10);
    if (!Number.isFinite(maxTeamsNum) || maxTeamsNum < 2) {
      Alert.alert('Invalid team count', 'Max teams must be a number of 2 or more.');
      return;
    }
    if (!userId || !pinCode) {
      Alert.alert('Not signed in', 'Please complete onboarding first.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/sports/leagues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: userId,
          name: name.trim(),
          sport,
          format: format.trim(),
          description: description.trim(),
          venue: venue.trim(),
          entryFeePaise: (Number.parseInt(entryFee, 10) || 0) * 100,
          prize: prize.trim() || undefined,
          startDate: startDate.trim(),
          endDate: endDate.trim(),
          maxTeams: maxTeamsNum,
          pinCode,
        }),
      });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      router.replace({ pathname: '/(sports)/league/[id]', params: { id: data.league.id } });
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
        <Text variant="h3" style={{ fontWeight: '700' }}>Create League</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <VStack gap={4}>
          <VStack gap={1.5}>
            <Text variant="caption" style={{ fontWeight: '700' }}>League name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Lokul Premier League"
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

          <VStack gap={1.5}>
            <Text variant="caption" style={{ fontWeight: '700' }}>Format</Text>
            <TextInput
              value={format}
              onChangeText={setFormat}
              placeholder="e.g. T10, 5-a-side, Singles & Doubles"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
            />
          </VStack>

          <VStack gap={1.5}>
            <Text variant="caption" style={{ fontWeight: '700' }}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="What should teams know before signing up?"
              placeholderTextColor={colors.textSecondary}
              multiline
              style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
            />
          </VStack>

          <VStack gap={1.5}>
            <Text variant="caption" style={{ fontWeight: '700' }}>Venue</Text>
            <TextInput
              value={venue}
              onChangeText={setVenue}
              placeholder="e.g. Community Ground"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
            />
          </VStack>

          <View style={styles.row}>
            <VStack gap={1.5} style={{ flex: 1 }}>
              <Text variant="caption" style={{ fontWeight: '700' }}>Start date</Text>
              <TextInput
                value={startDate}
                onChangeText={setStartDate}
                placeholder="e.g. Jul 1"
                placeholderTextColor={colors.textSecondary}
                style={styles.input}
              />
            </VStack>
            <VStack gap={1.5} style={{ flex: 1 }}>
              <Text variant="caption" style={{ fontWeight: '700' }}>End date</Text>
              <TextInput
                value={endDate}
                onChangeText={setEndDate}
                placeholder="e.g. Jul 31"
                placeholderTextColor={colors.textSecondary}
                style={styles.input}
              />
            </VStack>
          </View>

          <View style={styles.row}>
            <VStack gap={1.5} style={{ flex: 1 }}>
              <Text variant="caption" style={{ fontWeight: '700' }}>Entry fee (₹)</Text>
              <TextInput
                value={entryFee}
                onChangeText={setEntryFee}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                style={styles.input}
              />
            </VStack>
            <VStack gap={1.5} style={{ flex: 1 }}>
              <Text variant="caption" style={{ fontWeight: '700' }}>Max teams</Text>
              <TextInput
                value={maxTeams}
                onChangeText={setMaxTeams}
                placeholder="8"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                style={styles.input}
              />
            </VStack>
          </View>

          <VStack gap={1.5}>
            <Text variant="caption" style={{ fontWeight: '700' }}>Prize</Text>
            <TextInput
              value={prize}
              onChangeText={setPrize}
              placeholder="e.g. ₹25,000"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
            />
          </VStack>
        </VStack>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={submitting ? 'Creating…' : 'Create League'}
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
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing[6],
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
