import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Button, HStack, Input, Text, VStack } from '@/components/ui';
import { colors, spacing } from '@lokul/ui-tokens';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export default function CreateFreelancerProfileScreen() {
  const router = useRouter();
  const pinCode = useOnboardingStore((s) => s.pin);
  const userId = useWalletStore((s) => s.userId);
  const onboardingFlat = useOnboardingStore((s) => s.flat);

  const [flat, setFlat] = useState(onboardingFlat || '');
  const [skillsInput, setSkillsInput] = useState('');
  const [rate, setRate] = useState('');
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');
  const [availability, setAvailability] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    const skills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (skills.length === 0) {
      Alert.alert('Missing skills', 'Please add at least one skill.');
      return;
    }
    const hourlyRate = Number(rate);
    if (!rate.trim() || Number.isNaN(hourlyRate) || hourlyRate <= 0) {
      Alert.alert('Invalid rate', 'Please enter a valid hourly rate.');
      return;
    }
    if (!userId || !pinCode) {
      Alert.alert('Not signed in', 'Please complete onboarding first.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/jobs/freelancers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          flat: flat.trim() || undefined,
          skills,
          experience: experience.trim() || undefined,
          hourlyRatePaise: Math.round(hourlyRate * 100),
          bio: bio.trim() || undefined,
          availability: availability.trim() || undefined,
          pinCode,
        }),
      });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();

      Alert.alert('Profile created', 'Your freelancer profile is now live.', [
        { text: 'OK', onPress: () => router.replace(`/(jobs)/freelancer/${data.freelancer.id}`) },
      ]);
    } catch {
      Alert.alert('Error', 'Could not create your profile — please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack style={styles.header} gap="md">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>Create Freelancer Profile</Text>
      </HStack>

      <ScrollView contentContainerStyle={styles.scroll}>
        <VStack gap="lg">
          <Input label="Flat / unit" placeholder="e.g. B-303" value={flat} onChangeText={setFlat} />
          <Input
            label="Skills"
            placeholder="e.g. Web Development, React, Node.js (comma separated)"
            value={skillsInput}
            onChangeText={setSkillsInput}
          />
          <Input
            label="Hourly rate (₹)"
            placeholder="e.g. 500"
            value={rate}
            onChangeText={setRate}
            keyboardType="numeric"
          />
          <Input
            label="Experience"
            placeholder="e.g. 5 years"
            value={experience}
            onChangeText={setExperience}
          />
          <Input
            label="Availability"
            placeholder="e.g. Weekdays 9am-6pm"
            value={availability}
            onChangeText={setAvailability}
          />
          <Input
            label="Bio"
            placeholder="Tell people about your work..."
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            containerStyle={{ minHeight: 100 }}
          />

          <Button
            label="Create Profile"
            onPress={handleSubmit}
            loading={submitting}
            fullWidth
          />
        </VStack>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scroll: { padding: spacing.lg, paddingBottom: spacing[10] },
});
