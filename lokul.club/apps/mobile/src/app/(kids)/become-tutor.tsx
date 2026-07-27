import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Button, Card, Input, Text, VStack } from '@/components/ui';
import { colors, spacing } from '@lokul/ui-tokens';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export default function BecomeTutorScreen() {
  const router = useRouter();
  const pinCode = useOnboardingStore((s) => s.pin);
  const userId = useWalletStore((s) => s.userId);

  const [flat, setFlat] = useState('');
  const [subjects, setSubjects] = useState('');
  const [grades, setGrades] = useState('');
  const [experience, setExperience] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [availability, setAvailability] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    const subjectList = subjects
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (!flat.trim() || subjectList.length === 0 || !grades.trim() || !experience.trim() || !pricePerHour.trim()) {
      Alert.alert('Missing info', 'Please fill in flat, subjects, grades, experience and rate.');
      return;
    }
    const rate = parseFloat(pricePerHour);
    if (!Number.isFinite(rate) || rate < 0) {
      Alert.alert('Invalid rate', 'Please enter a valid hourly rate.');
      return;
    }
    if (!userId || !pinCode) {
      Alert.alert('Not signed in', 'Please complete onboarding first.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/kids/tutors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          flat: flat.trim(),
          subjects: subjectList,
          grades: grades.trim(),
          experience: experience.trim(),
          pricePerHourPaise: Math.round(rate * 100),
          bio: bio.trim() || undefined,
          phone: phone.trim() || undefined,
          availability: availability.trim() || undefined,
          pinCode,
        }),
      });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      router.replace(`/(kids)/tutor/${data.tutor.id}`);
    } catch {
      Alert.alert('Error', 'Could not save your tutor profile — please try again.');
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
        <Text variant="h3" style={{ fontWeight: '700' }}>Become a Tutor</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <VStack gap={4}>
          <Input label="Flat / block" placeholder="e.g. B-401" value={flat} onChangeText={setFlat} />
          <Input
            label="Subjects"
            placeholder="e.g. Math, Science"
            helper="Separate multiple subjects with commas"
            value={subjects}
            onChangeText={setSubjects}
          />
          <Input label="Grades taught" placeholder="e.g. Class 6-10" value={grades} onChangeText={setGrades} />
          <Input label="Experience" placeholder="e.g. 15+ years" value={experience} onChangeText={setExperience} />
          <Input
            label="Hourly rate (₹)"
            placeholder="e.g. 500"
            value={pricePerHour}
            onChangeText={setPricePerHour}
            keyboardType="decimal-pad"
          />
          <Input label="Availability (optional)" placeholder="e.g. Weekday evenings" value={availability} onChangeText={setAvailability} />
          <Input label="Phone (optional)" placeholder="e.g. 9876543210" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Input label="Bio (optional)" placeholder="Tell parents about your teaching style" value={bio} onChangeText={setBio} multiline />

          <Card padding={4} elevation="none" bordered>
            <Text variant="caption" tone="secondary">
              Submitting again later will update your existing tutor profile instead of creating a new one.
            </Text>
          </Card>

          <Button
            label={submitting ? 'Saving…' : 'Submit Application'}
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
});
