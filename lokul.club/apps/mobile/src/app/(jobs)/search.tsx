import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search as SearchIcon, Star } from 'lucide-react-native';
import { Card, HStack, Input, Text, VStack } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { useOnboardingStore } from '@/store/onboardingStore';
import { formatRelativeTime, type Job, type Freelancer } from './index';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export default function JobsSearchScreen() {
  const router = useRouter();
  const pinCode = useOnboardingStore((s) => s.pin);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    if (!pinCode) return;
    try {
      const [jobsRes, freelancersRes] = await Promise.all([
        fetch(`${BASE}/api/mobile/jobs?pinCode=${pinCode}`),
        fetch(`${BASE}/api/mobile/jobs/freelancers?pinCode=${pinCode}`),
      ]);
      const jobsData = await jobsRes.json();
      setJobs(jobsRes.ok ? jobsData.jobs : []);
      const freelancersData = await freelancersRes.json();
      setFreelancers(freelancersRes.ok ? freelancersData.freelancers : []);
    } catch {
      setJobs([]);
      setFreelancers([]);
    }
  }, [pinCode]);

  useEffect(() => { load(); }, [load]);

  const q = query.trim().toLowerCase();

  const matchedJobs = useMemo(() => {
    if (!q) return [];
    return jobs.filter((j) =>
      j.title.toLowerCase().includes(q) ||
      j.category.toLowerCase().includes(q) ||
      j.poster.name.toLowerCase().includes(q),
    );
  }, [jobs, q]);

  const matchedFreelancers = useMemo(() => {
    if (!q) return [];
    return freelancers.filter((f) =>
      f.user.name.toLowerCase().includes(q) ||
      f.skills.some((skill) => skill.toLowerCase().includes(q)),
    );
  }, [freelancers, q]);

  const hasResults = matchedJobs.length > 0 || matchedFreelancers.length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack style={styles.header} gap="md">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Input
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="Search jobs, skills, companies..."
            leftIcon={<SearchIcon size={18} color={colors.textSecondary} />}
          />
        </View>
      </HStack>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.section} keyboardShouldPersistTaps="handled">
        {!q && (
          <Text variant="body" tone="secondary" style={{ textAlign: 'center', marginTop: spacing.xl }}>
            Start typing to search jobs and freelancers.
          </Text>
        )}

        {q && !hasResults && (
          <VStack style={{ alignItems: 'center', marginTop: spacing.xl }} gap="sm">
            <SearchIcon size={40} color={colors.textSecondary} />
            <Text variant="body" style={{ fontWeight: '500' }}>No results for "{query}"</Text>
            <Text variant="caption" tone="secondary">Try a different keyword</Text>
          </VStack>
        )}

        {matchedJobs.length > 0 && (
          <VStack gap="sm" style={{ marginBottom: spacing.lg }}>
            <Text variant="label" tone="secondary">JOBS</Text>
            {matchedJobs.map((job) => (
              <Pressable key={job.id} onPress={() => router.push(`/(jobs)/job/${job.id}`)}>
                <Card style={styles.resultCard}>
                  <HStack style={{ justifyContent: 'space-between' }}>
                    <VStack style={{ flex: 1 }}>
                      <Text variant="body" style={{ fontWeight: '600' }}>{job.title}</Text>
                      <Text variant="caption" tone="secondary">{job.poster.name} • {job.salary}</Text>
                    </VStack>
                    <Text variant="caption" tone="secondary">{formatRelativeTime(job.createdAt)}</Text>
                  </HStack>
                </Card>
              </Pressable>
            ))}
          </VStack>
        )}

        {matchedFreelancers.length > 0 && (
          <VStack gap="sm">
            <Text variant="label" tone="secondary">FREELANCERS</Text>
            {matchedFreelancers.map((freelancer) => (
              <Pressable key={freelancer.id} onPress={() => router.push(`/(jobs)/freelancer/${freelancer.id}`)}>
                <Card style={styles.resultCard}>
                  <HStack style={{ justifyContent: 'space-between' }}>
                    <VStack style={{ flex: 1 }}>
                      <Text variant="body" style={{ fontWeight: '600' }}>{freelancer.user.name}</Text>
                      <Text variant="caption" tone="secondary">{freelancer.skills.join(', ')}</Text>
                    </VStack>
                    <HStack gap="xs" style={{ alignItems: 'center' }}>
                      <Star size={12} color={colors.warning} fill={colors.warning} />
                      <Text variant="caption">{freelancer.rating}</Text>
                    </HStack>
                  </HStack>
                </Card>
              </Pressable>
            ))}
          </VStack>
        )}
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
  scroll: { flex: 1 },
  section: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing[10] },
  resultCard: { padding: spacing.md },
});
