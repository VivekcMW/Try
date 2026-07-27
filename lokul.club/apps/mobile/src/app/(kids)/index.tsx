import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Star,
  Palette,
  Music,
  BookOpen,
  Dumbbell,
  Code,
  Languages,
  Gamepad2,
  Drama,
  GraduationCap,
  Baby,
  PartyPopper,
} from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

/* ════════════════════════════════════════════════════════════════════════
   CATEGORY METADATA (static reference data — icons aren't serializable,
   so this stays local to the UI layer, not the backend)
   ═══════════════════════════════════════════════════════════════════════ */

export type ActivityCategory = {
  id: string;
  name: string;
  icon: typeof Palette;
  color: string;
};

export const CATEGORIES: ActivityCategory[] = [
  { id: 'art', name: 'Art & Craft', icon: Palette, color: '#EC4899' },
  { id: 'music', name: 'Music', icon: Music, color: '#8B5CF6' },
  { id: 'academics', name: 'Academics', icon: BookOpen, color: '#3B82F6' },
  { id: 'sports', name: 'Sports', icon: Dumbbell, color: '#10B981' },
  { id: 'coding', name: 'Coding', icon: Code, color: '#F59E0B' },
  { id: 'language', name: 'Languages', icon: Languages, color: '#6366F1' },
  { id: 'dance', name: 'Dance & Drama', icon: Drama, color: '#EF4444' },
  { id: 'games', name: 'Games', icon: Gamepad2, color: '#14B8A6' },
];

export type Activity = {
  id: string;
  name: string;
  category: string;
  ageGroup: string;
  schedule: string;
  duration: string;
  location: string | null;
  description: string | null;
  totalSpots: number;
  spotsLeft: number;
  pricePaise: number;
  priceType: 'session' | 'month';
  rating: number;
  reviews: number;
  featured: boolean;
  host: { id: string; name: string };
};

export type Playdate = {
  id: string;
  title: string;
  ageGroup: string;
  dateLabel: string;
  timeLabel: string;
  location: string;
  notes: string | null;
  totalSpots: number;
  spotsLeft: number;
  host: { id: string; name: string };
  attendees: { id: string; kidName: string }[];
};

export type Tutor = {
  id: string;
  flat: string;
  subjects: string[];
  grades: string;
  experience: string;
  pricePerHourPaise: number;
  rating: number;
  reviews: number;
  available: boolean;
  bio: string | null;
  phone: string | null;
  availability: string | null;
  user: { id: string; name: string };
};

/* ════════════════════════════════════════════════════════════════════════ */

function ActivityCard({ activity, onPress }: { activity: Activity; onPress: () => void }) {
  const category = CATEGORIES.find(c => c.id === activity.category);
  const Icon = category?.icon || Palette;
  const spotsPercentage = (activity.spotsLeft / activity.totalSpots) * 100;

  return (
    <Pressable onPress={onPress}>
      <Card style={[styles.activityCard, activity.featured && styles.activityCardFeatured]}>
        {activity.featured && (
          <View style={styles.featuredBadge}>
            <Star size={10} color={colors.surface.background} fill={colors.surface.background} />
            <Text variant="caption" style={{ color: colors.surface.background, fontWeight: '700' }}>Popular</Text>
          </View>
        )}

        <HStack gap={spacing.md}>
          <View style={[styles.activityIcon, { backgroundColor: `${category?.color || colors.brand[600]}20` }]}>
            <Icon size={24} color={category?.color || colors.brand[600]} />
          </View>
          <VStack style={{ flex: 1 }}>
            <HStack style={styles.activityHeader}>
              <Text variant="body" style={{ fontWeight: '600' }}>{activity.name}</Text>
              <View style={styles.neighborBadge}>
                <Text variant="caption" style={{ color: colors.success }}>Neighbor</Text>
              </View>
            </HStack>
            <Text variant="caption" tone="secondary">{activity.host.name}</Text>

            <HStack gap={spacing.md} style={styles.activityMeta}>
              <HStack gap={spacing.xs}>
                <Baby size={12} color={colors.textSecondary} />
                <Text variant="caption" tone="secondary">{activity.ageGroup}</Text>
              </HStack>
              <HStack gap={spacing.xs}>
                <Calendar size={12} color={colors.textSecondary} />
                <Text variant="caption" tone="secondary">{activity.schedule}</Text>
              </HStack>
            </HStack>
          </VStack>
        </HStack>

        <View style={styles.divider} />

        <HStack style={styles.activityFooter}>
          <VStack>
            <Text variant="body" style={{ color: colors.brand[600], fontWeight: '700' }}>
              ₹{Math.round(activity.pricePaise / 100)}/{activity.priceType === 'session' ? 'session' : 'mo'}
            </Text>
            <HStack gap={spacing.xs}>
              <Star size={12} color={colors.warning} fill={colors.warning} />
              <Text variant="caption">{activity.rating} ({activity.reviews})</Text>
            </HStack>
          </VStack>
          <VStack style={{ alignItems: 'flex-end' }}>
            <Text
              variant="caption"
              style={{ color: spotsPercentage <= 25 ? colors.danger : colors.success, fontWeight: '500' }}
            >
              {activity.spotsLeft} spots left
            </Text>
            <Button label="Enroll" size="sm" onPress={onPress} />
          </VStack>
        </HStack>
      </Card>
    </Pressable>
  );
}

function PlaydateCard({ playdate, onPress }: { playdate: Playdate; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.playdateCard}>
        <HStack gap={spacing.md}>
          <View style={styles.playdateDate}>
            <Text variant="h3" style={{ color: colors.brand[600], fontWeight: '700' }}>
              {playdate.dateLabel.split(' ')[1]}
            </Text>
            <Text variant="caption" style={{ color: colors.brand[600] }}>
              {playdate.dateLabel.split(' ')[0]}
            </Text>
          </View>
          <VStack style={{ flex: 1 }}>
            <Text variant="body" style={{ fontWeight: '600' }}>{playdate.title}</Text>
            <Text variant="caption" tone="secondary">
              Hosted by {playdate.host.name}
            </Text>
            <HStack gap={spacing.md} style={{ marginTop: spacing.xs }}>
              <HStack gap={spacing.xs}>
                <Clock size={12} color={colors.textSecondary} />
                <Text variant="caption" tone="secondary">{playdate.timeLabel}</Text>
              </HStack>
              <HStack gap={spacing.xs}>
                <MapPin size={12} color={colors.textSecondary} />
                <Text variant="caption" tone="secondary">{playdate.location}</Text>
              </HStack>
            </HStack>
            <HStack gap={spacing.xs} style={{ marginTop: spacing.xs }}>
              <Baby size={12} color={colors.textSecondary} />
              <Text variant="caption" tone="secondary">{playdate.ageGroup}</Text>
            </HStack>
          </VStack>
          <VStack style={{ alignItems: 'center' }}>
            <Text variant="caption" style={{ color: colors.success, fontWeight: '500' }}>
              {playdate.spotsLeft} left
            </Text>
            <Button label="Join" size="sm" variant="secondary" onPress={onPress} />
          </VStack>
        </HStack>
      </Card>
    </Pressable>
  );
}

function TutorCard({ tutor, onPress }: { tutor: Tutor; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.tutorCard}>
        <HStack gap={spacing.md}>
          <View style={styles.tutorAvatar}>
            <Text variant="body" style={{ color: colors.brand[600], fontWeight: '700' }}>
              {tutor.user.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <VStack style={{ flex: 1 }}>
            <Text variant="body" style={{ fontWeight: '600' }}>{tutor.user.name}</Text>
            <Text variant="caption" tone="secondary">{tutor.flat} • {tutor.experience}</Text>
            <HStack gap={spacing.sm} style={{ marginTop: spacing.xs }}>
              {tutor.subjects.map(sub => (
                <View key={sub} style={styles.subjectChip}>
                  <Text variant="caption">{sub}</Text>
                </View>
              ))}
            </HStack>
            <Text variant="caption" tone="secondary" style={{ marginTop: spacing.xs }}>
              {tutor.grades}
            </Text>
          </VStack>
          <VStack style={{ alignItems: 'flex-end' }}>
            <HStack gap={spacing.xs}>
              <Star size={12} color={colors.warning} fill={colors.warning} />
              <Text variant="caption" style={{ fontWeight: '500' }}>{tutor.rating}</Text>
            </HStack>
            <Text variant="body" style={{ color: colors.brand[600], fontWeight: '600' }}>
              ₹{Math.round(tutor.pricePerHourPaise / 100)}/hr
            </Text>
          </VStack>
        </HStack>
      </Card>
    </Pressable>
  );
}

export default function KidsActivityScreen() {
  const router = useRouter();
  const pinCode = useOnboardingStore((s) => s.pin);
  const [activeTab, setActiveTab] = useState<'activities' | 'playdates' | 'tutors'>('activities');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [playdates, setPlaydates] = useState<Playdate[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);

  const load = useCallback(async () => {
    if (!pinCode) return;
    setLoading(true);
    try {
      const [activitiesRes, playdatesRes, tutorsRes] = await Promise.all([
        fetch(`${BASE}/api/mobile/kids/activities?pinCode=${pinCode}`),
        fetch(`${BASE}/api/mobile/kids/playdates?pinCode=${pinCode}`),
        fetch(`${BASE}/api/mobile/kids/tutors?pinCode=${pinCode}`),
      ]);
      const activitiesData = await activitiesRes.json();
      setActivities(activitiesRes.ok ? activitiesData.activities : []);
      const playdatesData = await playdatesRes.json();
      setPlaydates(playdatesRes.ok ? playdatesData.playdates : []);
      const tutorsData = await tutorsRes.json();
      setTutors(tutorsRes.ok ? tutorsData.tutors : []);
    } catch {
      setActivities([]);
      setPlaydates([]);
      setTutors([]);
    } finally {
      setLoading(false);
    }
  }, [pinCode]);

  useEffect(() => { load(); }, [load]);

  const filteredActivities = activities.filter(a =>
    !selectedCategory || a.category === selectedCategory
  );

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
          <Text variant="h3" style={{ fontWeight: '700' }}>Kids Hub</Text>
          <Text variant="caption" tone="secondary">Activities, playdates & tutoring</Text>
        </VStack>
        <Pressable onPress={() => router.push('/(kids)/add')}>
          <Plus size={24} color={colors.brand[600]} />
        </Pressable>
      </HStack>

      {/* Tabs */}
      <HStack style={styles.tabs}>
        {(['activities', 'playdates', 'tutors'] as const).map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              variant="body"
              style={{
                fontWeight: activeTab === tab ? '600' : '400',
                color: activeTab === tab ? colors.brand[600] : colors.textSecondary,
              }}
            >
              {tab === 'activities' ? 'Activities' : tab === 'playdates' ? 'Playdates' : 'Tutors'}
            </Text>
          </Pressable>
        ))}
      </HStack>

      {activeTab === 'activities' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
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
                <Icon size={16} color={isSelected ? colors.surface.background : cat.color} />
                <Text
                  variant="caption"
                  style={{
                    fontWeight: isSelected ? '600' : '400',
                    color: isSelected ? colors.surface.background : colors.foreground,
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
        {activeTab === 'activities' && (
          <VStack gap={spacing.md} style={styles.section}>
            {filteredActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onPress={() => router.push(`/(kids)/activity/${activity.id}`)}
              />
            ))}
          </VStack>
        )}

        {activeTab === 'playdates' && (
          <VStack gap={spacing.md} style={styles.section}>
            <HStack style={styles.sectionHeader}>
              <Text variant="bodyLg" style={{ fontWeight: '600' }}>Upcoming Playdates</Text>
              <Button
                label="Host"
                size="sm"
                variant="secondary"
                onPress={() => router.push('/(kids)/host-playdate')}
              />
            </HStack>

            {playdates.map((playdate) => (
              <PlaydateCard
                key={playdate.id}
                playdate={playdate}
                onPress={() => router.push(`/(kids)/playdate/${playdate.id}`)}
              />
            ))}

            <Card style={styles.createPlaydateCard}>
              <VStack style={{ alignItems: 'center' }}>
                <PartyPopper size={32} color={colors.brand[600]} />
                <Text variant="body" style={{ fontWeight: '600', marginTop: spacing.sm }}>
                  Host a Playdate
                </Text>
                <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
                  Organize fun activities for kids in your community
                </Text>
                <View style={{ marginTop: spacing.md }}>
                  <Button
                    label="Create Playdate"
                    onPress={() => router.push('/(kids)/host-playdate')}
                  />
                </View>
              </VStack>
            </Card>
          </VStack>
        )}

        {activeTab === 'tutors' && (
          <VStack gap={spacing.md} style={styles.section}>
            <Text variant="bodyLg" style={{ fontWeight: '600' }}>Neighborhood Tutors</Text>
            <Text variant="caption" tone="secondary">
              Qualified tutors from your community
            </Text>

            {tutors.map((tutor) => (
              <TutorCard
                key={tutor.id}
                tutor={tutor}
                onPress={() => router.push(`/(kids)/tutor/${tutor.id}`)}
              />
            ))}

            <Card style={styles.becomeTutorCard}>
              <HStack gap={spacing.md}>
                <View style={styles.tutorIcon}>
                  <GraduationCap size={24} color={colors.brand[600]} />
                </View>
                <VStack style={{ flex: 1 }}>
                  <Text variant="body" style={{ fontWeight: '600' }}>Become a Tutor</Text>
                  <Text variant="caption" tone="secondary">
                    Share your knowledge with neighborhood kids
                  </Text>
                </VStack>
                <Button label="Apply" size="sm" variant="secondary" onPress={() => router.push('/(kids)/become-tutor')} />
              </HStack>
            </Card>
          </VStack>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.background },
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
    paddingHorizontal: spacing.lg,
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
  categoriesRow: {
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
  sectionHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  activityCard: {
    padding: spacing.md,
    position: 'relative',
  },
  activityCardFeatured: {
    borderColor: colors.warning,
    borderWidth: 1,
  },
  featuredBadge: {
    position: 'absolute',
    top: 0,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderBottomLeftRadius: radius.sm,
    borderBottomRightRadius: radius.sm,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityHeader: {
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  neighborBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  activityMeta: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  activityFooter: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  playdateCard: {
    padding: spacing.md,
  },
  playdateDate: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand[50],
    borderRadius: radius.lg,
    padding: spacing.sm,
  },
  createPlaydateCard: {
    padding: spacing[6],
  },
  tutorCard: {
    padding: spacing.md,
  },
  tutorAvatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectChip: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  becomeTutorCard: {
    padding: spacing.md,
    backgroundColor: colors.brand[50],
    marginTop: spacing.md,
  },
  tutorIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.surface.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomPadding: { height: 100 },
});
