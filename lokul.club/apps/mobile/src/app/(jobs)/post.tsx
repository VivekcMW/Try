import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Button, HStack, Input, Text, VStack } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { JOB_CATEGORIES, type JobType, type WorkMode } from './index';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const JOB_TYPES: { id: JobType; label: string }[] = [
  { id: 'full_time', label: 'Full-time' },
  { id: 'part_time', label: 'Part-time' },
  { id: 'freelance', label: 'Freelance' },
  { id: 'internship', label: 'Internship' },
];

const WORK_MODES: { id: WorkMode; label: string }[] = [
  { id: 'onsite', label: 'On-site' },
  { id: 'remote', label: 'Remote' },
  { id: 'hybrid', label: 'Hybrid' },
];

function ChipRow<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <HStack gap="sm" style={{ flexWrap: 'wrap' }}>
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <Pressable
            key={opt.id}
            onPress={() => onChange(opt.id)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text
              variant="caption"
              style={{ color: active ? colors.background : colors.foreground, fontWeight: active ? '600' : '400' }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </HStack>
  );
}

export default function PostJobScreen() {
  const router = useRouter();
  const pinCode = useOnboardingStore((s) => s.pin);
  const userId = useWalletStore((s) => s.userId);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(JOB_CATEGORIES[0]!.id);
  const [type, setType] = useState<JobType>('full_time');
  const [workMode, setWorkMode] = useState<WorkMode>('onsite');
  const [description, setDescription] = useState('');
  const [salary, setSalary] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!title.trim()) {
      Alert.alert('Missing title', 'Please enter a job title.');
      return;
    }
    if (!salary.trim()) {
      Alert.alert('Missing budget', 'Please enter a budget or pay range.');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Missing location', 'Please enter a location.');
      return;
    }
    if (!userId || !pinCode) {
      Alert.alert('Not signed in', 'Please complete onboarding first.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          posterId: userId,
          title: title.trim(),
          category,
          type,
          workMode,
          location: location.trim(),
          salary: salary.trim(),
          description: description.trim() || undefined,
          pinCode,
        }),
      });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();

      Alert.alert('Job posted', 'Your job listing is now live.', [
        { text: 'OK', onPress: () => router.replace(`/(jobs)/job/${data.job.id}`) },
      ]);
    } catch {
      Alert.alert('Error', 'Could not post the job — please try again.');
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
        <Text variant="h3" style={{ fontWeight: '700' }}>Post a Job</Text>
      </HStack>

      <ScrollView contentContainerStyle={styles.scroll}>
        <VStack gap="lg">
          <Input
            label="Job title"
            placeholder="e.g. Frontend Developer"
            value={title}
            onChangeText={setTitle}
          />

          <VStack gap="sm">
            <Text variant="label" tone="secondary">Category</Text>
            <ChipRow
              options={JOB_CATEGORIES}
              value={category}
              onChange={setCategory}
            />
          </VStack>

          <VStack gap="sm">
            <Text variant="label" tone="secondary">Job type</Text>
            <ChipRow options={JOB_TYPES} value={type} onChange={setType} />
          </VStack>

          <VStack gap="sm">
            <Text variant="label" tone="secondary">Work mode</Text>
            <ChipRow options={WORK_MODES} value={workMode} onChange={setWorkMode} />
          </VStack>

          <Input
            label="Budget / pay range"
            placeholder="e.g. ₹15,000/month"
            value={salary}
            onChangeText={setSalary}
          />

          <Input
            label="Location"
            placeholder="e.g. Same Society, B Wing"
            value={location}
            onChangeText={setLocation}
          />

          <Input
            label="Description"
            placeholder="Describe the role, responsibilities, requirements..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            containerStyle={{ minHeight: 100 }}
          />

          <Button
            label="Post Job"
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
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.brand[600],
    borderColor: colors.brand[600],
  },
});
