import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  Search,
  MapPin,
  Clock,
  Briefcase,
  GraduationCap,
  BadgeCheck,
  Star,
  Building2,
  Users,
  Banknote,
  Heart,
  Laptop,
  Wrench,
  ShoppingBag,
  Headphones,
  PenTool,
  Calculator,
  Truck,
  Baby,
} from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export const JOB_CATEGORIES: { id: string; label: string }[] = [
  { id: 'tech', label: 'Tech' },
  { id: 'service', label: 'Services' },
  { id: 'sales', label: 'Sales' },
  { id: 'support', label: 'Support' },
  { id: 'design', label: 'Design' },
  { id: 'finance', label: 'Finance' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'domestic', label: 'Domestic' },
];

export type JobType = 'full_time' | 'part_time' | 'freelance' | 'internship';
export type WorkMode = 'onsite' | 'remote' | 'hybrid';

export type Job = {
  id: string;
  title: string;
  category: string;
  type: JobType;
  workMode: WorkMode;
  location: string;
  salary: string;
  experience: string;
  createdAt: string;
  applicantCount: number;
  status: 'open' | 'closed';
  verified: boolean;
  featured: boolean;
  urgent: boolean;
  description: string | null;
  appliedByMe: boolean;
  poster: { id: string; name: string };
};

export type Freelancer = {
  id: string;
  flat: string;
  skills: string[];
  experience: string;
  hourlyRatePaise: number;
  rating: number;
  reviews: number;
  available: boolean;
  bio: string | null;
  phone: string | null;
  availability: string | null;
  user: { id: string; name: string };
};

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const DAY = 86_400_000;
  const day = Math.floor(diff / DAY);
  if (day <= 0) return 'Today';
  if (day === 1) return '1 day ago';
  if (day < 7) return `${day} days ago`;
  const week = Math.floor(day / 7);
  if (week === 1) return '1 week ago';
  if (week < 5) return `${week} weeks ago`;
  const month = Math.floor(day / 30);
  return month <= 1 ? '1 month ago' : `${month} months ago`;
}

/* ════════════════════════════════════════════════════════════════════════
   CATEGORY PRESENTATION (icons/colors are UI-only; ids match jobsStore.JOB_CATEGORIES)
   ═══════════════════════════════════════════════════════════════════════ */

type JobCategoryMeta = {
  id: string;
  name: string;
  icon: typeof Briefcase;
  color: string;
};

const CATEGORIES: JobCategoryMeta[] = [
  { id: 'tech', name: 'Tech', icon: Laptop, color: '#3B82F6' },
  { id: 'service', name: 'Services', icon: Wrench, color: '#F59E0B' },
  { id: 'sales', name: 'Sales', icon: ShoppingBag, color: '#22C55E' },
  { id: 'support', name: 'Support', icon: Headphones, color: '#8B5CF6' },
  { id: 'design', name: 'Design', icon: PenTool, color: '#EC4899' },
  { id: 'finance', name: 'Finance', icon: Calculator, color: '#14B8A6' },
  { id: 'delivery', name: 'Delivery', icon: Truck, color: '#EF4444' },
  { id: 'domestic', name: 'Domestic', icon: Baby, color: '#6366F1' },
];

const TYPE_CONFIG = {
  full_time: { label: 'Full-time', color: colors.brand[600] },
  part_time: { label: 'Part-time', color: colors.success },
  freelance: { label: 'Freelance', color: colors.warning },
  internship: { label: 'Internship', color: colors.info },
};

const WORKMODE_CONFIG = {
  'onsite': { label: 'On-site', color: '#6366F1' },
  'remote': { label: 'Remote', color: '#22C55E' },
  'hybrid': { label: 'Hybrid', color: '#F59E0B' },
};

/* ════════════════════════════════════════════════════════════════════════ */

function JobCard({ job, onPress }: { job: Job; onPress: () => void }) {
  const [saved, setSaved] = useState(false);
  const category = CATEGORIES.find(c => c.id === job.category);
  const Icon = category?.icon || Briefcase;

  return (
    <Pressable onPress={onPress}>
      <Card style={StyleSheet.flatten([styles.jobCard, job.featured && styles.jobCardFeatured])}>
        {job.urgent && (
          <View style={styles.urgentBadge}>
            <Clock size={10} color={colors.background} />
            <Text variant="caption" style={{ color: colors.background, fontSize: 10 }}>Urgent Hiring</Text>
          </View>
        )}

        <HStack gap="md">
          <View style={[styles.companyIcon, { backgroundColor: `${category?.color || colors.brand[600]}20` }]}>
            <Icon size={24} color={category?.color || colors.brand[600]} />
          </View>
          <VStack style={{ flex: 1 }}>
            <HStack style={{ justifyContent: 'space-between' }}>
              <VStack style={{ flex: 1 }}>
                <Text variant="body" style={{ fontWeight: '600' }} numberOfLines={1}>{job.title}</Text>
                <HStack gap="xs" style={{ alignItems: 'center' }}>
                  <Text variant="caption" tone="secondary">{job.poster.name}</Text>
                  {job.verified && <BadgeCheck size={12} color={colors.success} />}
                </HStack>
              </VStack>
              <Pressable
                onPress={(e) => { e.stopPropagation(); setSaved(!saved); }}
                hitSlop={8}
              >
                <Heart
                  size={20}
                  color={saved ? colors.danger : colors.textSecondary}
                  fill={saved ? colors.danger : 'transparent'}
                />
              </Pressable>
            </HStack>

            {/* Tags */}
            <HStack gap="sm" style={{ marginTop: spacing.sm, flexWrap: 'wrap' }}>
              <View style={[styles.typeTag, { backgroundColor: `${TYPE_CONFIG[job.type].color}20` }]}>
                <Text variant="caption" style={{ color: TYPE_CONFIG[job.type].color, fontSize: 10 }}>
                  {TYPE_CONFIG[job.type].label}
                </Text>
              </View>
              <View style={[styles.typeTag, { backgroundColor: `${WORKMODE_CONFIG[job.workMode].color}20` }]}>
                <Text variant="caption" style={{ color: WORKMODE_CONFIG[job.workMode].color, fontSize: 10 }}>
                  {WORKMODE_CONFIG[job.workMode].label}
                </Text>
              </View>
            </HStack>

            {/* Details */}
            <HStack gap="md" style={{ marginTop: spacing.sm }}>
              <HStack gap="xs">
                <Banknote size={12} color={colors.brand[600]} />
                <Text variant="caption" style={{ color: colors.brand[600] }}>{job.salary}</Text>
              </HStack>
              <HStack gap="xs">
                <GraduationCap size={12} color={colors.textSecondary} />
                <Text variant="caption" tone="secondary">{job.experience}</Text>
              </HStack>
            </HStack>

            <HStack gap="xs" style={{ marginTop: spacing.xs }}>
              <MapPin size={12} color={colors.textSecondary} />
              <Text variant="caption" tone="secondary">{job.location}</Text>
            </HStack>
          </VStack>
        </HStack>

        <View style={styles.divider} />

        <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <HStack gap="md">
            <HStack gap="xs">
              <Clock size={12} color={colors.textSecondary} />
              <Text variant="caption" tone="secondary">{formatRelativeTime(job.createdAt)}</Text>
            </HStack>
            {job.applicantCount > 0 && (
              <HStack gap="xs">
                <Users size={12} color={colors.textSecondary} />
                <Text variant="caption" tone="secondary">{job.applicantCount} applied</Text>
              </HStack>
            )}
          </HStack>
          <Button label="Apply" size="sm" onPress={onPress} />
        </HStack>
      </Card>
    </Pressable>
  );
}

function FreelancerCard({ freelancer, onPress }: { freelancer: Freelancer; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.freelancerCard}>
        <HStack gap="md">
          <View style={styles.freelancerAvatar}>
            <Text variant="body" style={{ fontWeight: '700', color: colors.brand[600] }}>
              {freelancer.user.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <VStack style={{ flex: 1 }}>
            <HStack style={{ justifyContent: 'space-between' }}>
              <Text variant="body" style={{ fontWeight: '600' }}>{freelancer.user.name}</Text>
              {freelancer.available && (
                <View style={styles.availableBadge}>
                  <View style={styles.availableDot} />
                  <Text variant="caption" style={{ color: colors.success, fontSize: 10 }}>Available</Text>
                </View>
              )}
            </HStack>
            <Text variant="caption" tone="secondary">{freelancer.flat} • {freelancer.experience}</Text>
            <HStack gap="sm" style={{ marginTop: spacing.xs, flexWrap: 'wrap' }}>
              {freelancer.skills.slice(0, 3).map(skill => (
                <View key={skill} style={styles.skillChip}>
                  <Text variant="caption" style={{ fontSize: 10 }}>{skill}</Text>
                </View>
              ))}
            </HStack>
          </VStack>
        </HStack>

        <View style={styles.divider} />

        <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <HStack gap="md">
            <HStack gap="xs">
              <Star size={12} color={colors.warning} fill={colors.warning} />
              <Text variant="caption">{freelancer.rating} ({freelancer.reviews})</Text>
            </HStack>
            <Text variant="body" style={{ fontWeight: '600', color: colors.brand[600] }}>
              ₹{Math.round(freelancer.hourlyRatePaise / 100)}/hr
            </Text>
          </HStack>
          <Button label="Contact" size="sm" variant="secondary" onPress={onPress} />
        </HStack>
      </Card>
    </Pressable>
  );
}

export default function JobsScreen() {
  const router = useRouter();
  const pinCode = useOnboardingStore((s) => s.pin);
  const userId = useWalletStore((s) => s.userId);
  const [activeTab, setActiveTab] = useState<'jobs' | 'freelancers' | 'posted'>('jobs');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [myPostedJobs, setMyPostedJobs] = useState<Job[]>([]);
  const [myFreelancerProfileId, setMyFreelancerProfileId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!pinCode) return;
    setLoading(true);
    try {
      const userQ = userId ? `&userId=${userId}` : '';
      const [jobsRes, freelancersRes, myJobsRes, myProfileRes] = await Promise.all([
        fetch(`${BASE}/api/mobile/jobs?pinCode=${pinCode}${userQ}`),
        fetch(`${BASE}/api/mobile/jobs/freelancers?pinCode=${pinCode}`),
        userId ? fetch(`${BASE}/api/mobile/jobs?posterId=${userId}${userQ}`) : Promise.resolve(null),
        userId ? fetch(`${BASE}/api/mobile/jobs/freelancers?userId=${userId}`) : Promise.resolve(null),
      ]);
      const jobsData = await jobsRes.json();
      setJobs(jobsRes.ok ? jobsData.jobs : []);
      const freelancersData = await freelancersRes.json();
      setFreelancers(freelancersRes.ok ? freelancersData.freelancers : []);
      if (myJobsRes) {
        const myJobsData = await myJobsRes.json();
        setMyPostedJobs(myJobsRes.ok ? myJobsData.jobs : []);
      }
      if (myProfileRes) {
        const myProfileData = await myProfileRes.json();
        setMyFreelancerProfileId(myProfileRes.ok && myProfileData.freelancers[0] ? myProfileData.freelancers[0].id : null);
      }
    } catch {
      setJobs([]);
      setFreelancers([]);
    } finally {
      setLoading(false);
    }
  }, [pinCode, userId]);

  useEffect(() => { load(); }, [load]);

  const filteredJobs = jobs.filter(j => !selectedCategory || j.category === selectedCategory);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <HStack style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <VStack style={styles.headerTitle}>
          <Text variant="h3" style={{ fontWeight: '700' }}>Jobs</Text>
          <Text variant="caption" tone="secondary">Local opportunities near you</Text>
        </VStack>
        <HStack gap="md">
          <Pressable onPress={() => router.push('/(jobs)/search')}>
            <Search size={22} color={colors.foreground} />
          </Pressable>
          <Pressable onPress={() => router.push('/(jobs)/post')}>
            <Plus size={24} color={colors.brand[600]} />
          </Pressable>
        </HStack>
      </HStack>

      {/* Tabs */}
      <HStack style={styles.tabs}>
        {(['jobs', 'freelancers', 'posted'] as const).map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              variant="caption"
              style={{
                fontWeight: activeTab === tab ? '600' : '400',
                color: activeTab === tab ? colors.brand[600] : colors.textSecondary,
              }}
            >
              {tab === 'jobs' ? 'Find Jobs' : tab === 'freelancers' ? 'Hire Talent' : 'My Posts'}
            </Text>
          </Pressable>
        ))}
      </HStack>

      {/* Categories */}
      {activeTab === 'jobs' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesRowScroll}
          contentContainerStyle={styles.categoriesRow}
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <Pressable
                key={cat.id}
                style={[styles.categoryChip, isSelected && { backgroundColor: cat.color, borderColor: cat.color }]}
                onPress={() => setSelectedCategory(isSelected ? null : cat.id)}
              >
                <Icon size={14} color={isSelected ? colors.background : cat.color} />
                <Text
                  variant="caption"
                  style={{
                    fontWeight: isSelected ? '600' : '400',
                    color: isSelected ? colors.background : colors.foreground,
                  }}
                >
                  {cat.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeTab === 'jobs' && (
          <VStack gap="md" style={styles.section}>
            {filteredJobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onPress={() => router.push(`/(jobs)/job/${job.id}`)}
              />
            ))}

            {filteredJobs.length === 0 && (
              <Card style={styles.emptyCard}>
                <VStack style={{ alignItems: 'center' }}>
                  <Briefcase size={48} color={colors.textSecondary} />
                  <Text variant="body" style={{ fontWeight: '500', marginTop: spacing.md }}>
                    No jobs found
                  </Text>
                  <Text variant="caption" tone="secondary">
                    Try adjusting your filters
                  </Text>
                </VStack>
              </Card>
            )}
          </VStack>
        )}

        {activeTab === 'freelancers' && (
          <VStack gap="md" style={styles.section}>
            <Text variant="body" tone="secondary">
              Hire skilled professionals from your neighborhood
            </Text>

            {freelancers.map(freelancer => (
              <FreelancerCard
                key={freelancer.id}
                freelancer={freelancer}
                onPress={() => router.push(`/(jobs)/freelancer/${freelancer.id}`)}
              />
            ))}

            {!myFreelancerProfileId && (
              <Card style={styles.createProfileCard}>
                <HStack gap="md">
                  <View style={styles.profileIcon}>
                    <Briefcase size={24} color={colors.brand[600]} />
                  </View>
                  <VStack style={{ flex: 1 }}>
                    <Text variant="body" style={{ fontWeight: '600' }}>Offer Your Services</Text>
                    <Text variant="caption" tone="secondary">
                      Create a freelancer profile to get local gigs
                    </Text>
                  </VStack>
                  <Button
                    label="Create"
                    size="sm"
                    onPress={() => router.push('/(jobs)/create-profile')}
                  />
                </HStack>
              </Card>
            )}
          </VStack>
        )}

        {activeTab === 'posted' && (
          <VStack gap="md" style={styles.section}>
            {myPostedJobs.length > 0 ? (
              myPostedJobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onPress={() => router.push(`/(jobs)/job/${job.id}`)}
                />
              ))
            ) : (
              <Card style={styles.emptyCard}>
                <VStack style={{ alignItems: 'center' }}>
                  <Building2 size={48} color={colors.textSecondary} />
                  <Text variant="body" style={{ fontWeight: '500', marginTop: spacing.md }}>
                    No jobs posted yet
                  </Text>
                  <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
                    Post a job to find local talent
                  </Text>
                  <Button
                    label="Post a Job"
                    onPress={() => router.push('/(jobs)/post')}
                    style={{ marginTop: spacing.md }}
                  />
                </VStack>
              </Card>
            )}
          </VStack>
        )}

        <View style={styles.bottomPadding} />
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
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { flex: 1 },
  tabs: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.brand[600],
  },
  categoriesRowScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  categoriesRow: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scroll: { flex: 1 },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  jobCard: {
    padding: spacing.md,
    position: 'relative',
  },
  jobCardFeatured: {
    borderColor: colors.warning,
    borderWidth: 1,
  },
  urgentBadge: {
    position: 'absolute',
    top: 0,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderBottomLeftRadius: radius.sm,
    borderBottomRightRadius: radius.sm,
  },
  companyIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  neighborTag: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  freelancerCard: {
    padding: spacing.md,
  },
  freelancerAvatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  skillChip: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  createProfileCard: {
    padding: spacing.md,
    backgroundColor: colors.brand[50],
    marginTop: spacing.md,
  },
  profileIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    padding: spacing[6],
    alignItems: 'center',
  },
  bottomPadding: { height: 100 },
});
