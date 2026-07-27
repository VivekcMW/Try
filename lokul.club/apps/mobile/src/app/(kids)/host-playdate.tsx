import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Button, Card, Input, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

function buildDateStrip(): string[] {
  const days: string[] = [];
  for (let i = 0; i < 10; i++) {
    const d = new Date(Date.now() + i * 86_400_000);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function formatDay(dateStr: string): { day: string; date: string; label: string } {
  const d = new Date(dateStr + 'T00:00:00');
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return { day: dayNames[d.getDay()]!, date: String(d.getDate()), label: `${monthNames[d.getMonth()]} ${d.getDate()}` };
}

const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'];

export default function HostPlaydateScreen() {
  const router = useRouter();
  const pinCode = useOnboardingStore((s) => s.pin);
  const userId = useWalletStore((s) => s.userId);

  const DATE_STRIP = buildDateStrip();
  const [title, setTitle] = useState('');
  const [childName, setChildName] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [selectedDate, setSelectedDate] = useState(DATE_STRIP[0]!);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [totalSpots, setTotalSpots] = useState('6');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!title.trim() || !childName.trim() || !ageGroup.trim() || !location.trim() || !selectedTime) {
      Alert.alert('Missing info', 'Please fill in title, child name, age group, time and location.');
      return;
    }
    const spots = parseInt(totalSpots, 10);
    if (!Number.isFinite(spots) || spots <= 0) {
      Alert.alert('Invalid spots', 'Total spots must be a positive number.');
      return;
    }
    if (!userId || !pinCode) {
      Alert.alert('Not signed in', 'Please complete onboarding first.');
      return;
    }

    setSubmitting(true);
    try {
      const { label } = formatDay(selectedDate);
      const res = await fetch(`${BASE}/api/mobile/kids/playdates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostId: userId,
          title: title.trim(),
          childName: childName.trim(),
          ageGroup: ageGroup.trim(),
          dateLabel: label,
          timeLabel: selectedTime,
          location: location.trim(),
          totalSpots: spots,
          notes: notes.trim() || undefined,
          pinCode,
        }),
      });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      router.replace(`/(kids)/playdate/${data.playdate.id}`);
    } catch {
      Alert.alert('Error', 'Could not create the playdate — please try again.');
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
        <Text variant="h3" style={{ fontWeight: '700' }}>Host a Playdate</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <VStack gap={4}>
          <Input label="Playdate title" placeholder="e.g. Board Games Afternoon" value={title} onChangeText={setTitle} />
          <Input label="Your child's name" placeholder="e.g. Arjun" value={childName} onChangeText={setChildName} />
          <Input label="Age group" placeholder="e.g. 6-10 years" value={ageGroup} onChangeText={setAgeGroup} />

          <Text variant="label" tone="secondary">Pick a date</Text>
          <View style={styles.dateStrip}>
            {DATE_STRIP.map((d) => {
              const { day, date } = formatDay(d);
              const active = selectedDate === d;
              return (
                <Pressable key={d} onPress={() => setSelectedDate(d)} style={[styles.dateChip, active && styles.dateChipActive]}>
                  <Text variant="caption" style={{ color: active ? '#fff' : colors.surface.textSecondary, fontWeight: '600' }}>{day}</Text>
                  <Text variant="body" style={{ color: active ? '#fff' : colors.surface.foreground, fontWeight: '800' }}>{date}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text variant="label" tone="secondary">Pick a time</Text>
          <View style={styles.timeGrid}>
            {TIME_SLOTS.map((t) => {
              const active = selectedTime === t;
              return (
                <Pressable key={t} onPress={() => setSelectedTime(t)} style={[styles.timeChip, active && styles.timeChipActive]}>
                  <Text variant="caption" style={{ fontWeight: '700', color: active ? '#fff' : colors.surface.foreground }}>
                    {t}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Input label="Location" placeholder="e.g. Clubhouse" value={location} onChangeText={setLocation} />
          <Input
            label="Max attendees"
            placeholder="6"
            value={totalSpots}
            onChangeText={setTotalSpots}
            keyboardType="number-pad"
          />
          <Input
            label="Notes (optional)"
            placeholder="Anything guests should know"
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          <Card padding={4} elevation="none" bordered>
            <Text variant="caption" tone="secondary">
              You'll be the first attendee — neighbors can join until spots run out.
            </Text>
          </Card>

          <Button
            label={submitting ? 'Creating…' : 'Create Playdate'}
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
  dateStrip: { flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' },
  dateChip: {
    flexBasis: '13%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: spacing[2],
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.background,
    gap: 2,
  },
  dateChipActive: { backgroundColor: colors.brand[600], borderColor: colors.brand[600] },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  timeChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.background,
  },
  timeChipActive: { backgroundColor: colors.brand[600], borderColor: colors.brand[600] },
});
