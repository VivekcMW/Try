import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Banknote,
  BadgeCheck,
  Briefcase,
  Building2,
  Clock,
  GraduationCap,
  MapPin,
  Users,
} from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { useWalletStore } from '@/store/walletStore';
import { formatRelativeTime, type Job } from '../index';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const TYPE_LABEL: Record<string, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  freelance: 'Freelance',
  internship: 'Internship',
};

const WORKMODE_LABEL: Record<string, string> = {
  onsite: 'On-site',
  remote: 'Remote',
  hybrid: 'Hybrid',
};

export default function JobDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = useWalletStore((s) => s.userId);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const userQ = userId ? `?userId=${userId}` : '';
      const res = await fetch(`${BASE}/api/mobile/jobs/${id}${userQ}`);
      const data = await res.json();
      setJob(res.ok ? data.job : null);
    } catch {
      setJob(null);
    } finally {
      setLoading(false);
    }
  }, [id, userId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <HStack style={styles.header} gap="md">
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ArrowLeft size={24} color={colors.foreground} />
          </Pressable>
          <Text variant="h3" style={{ fontWeight: '700' }}>Job</Text>
        </HStack>
        <View style={styles.notFound}>
          <Briefcase size={48} color={colors.textSecondary} />
          <Text variant="body" style={{ fontWeight: '600', marginTop: spacing.md }}>
            Job not found
          </Text>
          <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
            This listing may have been removed.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  async function handleApply() {
    if (!job || job.appliedByMe) return;
    if (!userId) {
      Alert.alert('Not signed in', 'Please complete onboarding first.');
      return;
    }
    setApplying(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/jobs/${job.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      setJob({ ...job, applicantCount: data.applicantCount, appliedByMe: true });
      Alert.alert('Applied', `Your application for "${job.title}" has been submitted.`);
    } catch {
      Alert.alert('Error', 'Could not submit your application — please try again.');
    } finally {
      setApplying(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack style={styles.header} gap="md">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }} numberOfLines={1}>Job Details</Text>
      </HStack>

      <ScrollView contentContainerStyle={styles.scroll}>
        <VStack gap="md">
          <Text variant="h2" style={{ fontWeight: '800' }}>{job.title}</Text>

          <HStack gap="xs" style={{ alignItems: 'center' }}>
            <Building2 size={16} color={colors.textSecondary} />
            <Text variant="body" tone="secondary">{job.poster.name}</Text>
            {job.verified && <BadgeCheck size={14} color={colors.success} />}
          </HStack>

          <HStack gap="sm" style={{ flexWrap: 'wrap' }}>
            <View style={styles.tag}>
              <Text variant="caption" style={{ color: colors.brand[600] }}>{TYPE_LABEL[job.type]}</Text>
            </View>
            <View style={styles.tag}>
              <Text variant="caption" style={{ color: colors.brand[600] }}>{WORKMODE_LABEL[job.workMode]}</Text>
            </View>
          </HStack>

          <Card padding={4} elevation="xs" bordered>
            <VStack gap="sm">
              <Row icon={<Banknote size={16} color={colors.brand[600]} />} label="Budget" value={job.salary} />
              <Row icon={<GraduationCap size={16} color={colors.textSecondary} />} label="Experience" value={job.experience} />
              <Row icon={<MapPin size={16} color={colors.textSecondary} />} label="Location" value={job.location} />
              <Row icon={<Clock size={16} color={colors.textSecondary} />} label="Posted" value={formatRelativeTime(job.createdAt)} />
              <Row icon={<Users size={16} color={colors.textSecondary} />} label="Applicants" value={String(job.applicantCount)} />
            </VStack>
          </Card>

          {job.description && (
            <VStack gap="sm">
              <Text variant="label" tone="secondary">Description</Text>
              <Text variant="body">{job.description}</Text>
            </VStack>
          )}
        </VStack>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={job.appliedByMe ? 'Applied ✓' : 'Apply'}
          onPress={handleApply}
          loading={applying}
          disabled={job.appliedByMe}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

function Row({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
      <HStack gap="xs" style={{ alignItems: 'center' }}>
        {icon}
        <Text variant="caption" tone="secondary">{label}</Text>
      </HStack>
      <Text variant="caption" style={{ fontWeight: '600' }}>{value}</Text>
    </HStack>
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
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: 4,
  },
});
