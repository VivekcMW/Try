import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MessageCircle, ShieldCheck } from 'lucide-react-native';
import { Avatar, Badge, Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type Tier = 'bronze' | 'silver' | 'gold';

type Profile = {
  name: string;
  bio: string;
  tier: Tier;
  flat?: string;
  tower?: string;
  interests?: string[];
  postCount?: number;
};

type ApiUser = {
  id: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  kycTier: Tier;
  trustScore: number;
  role: string;
  _count?: { posts: number; ordersGiven: number; ordersReceived: number };
};

// Stub resident profiles — kept only as an offline/demo fallback for ids that
// genuinely aren't in the real backend (the real user model has no flat/tower/
// interests fields, so those extra bits only ever come from this seed data).
const PROFILES: Record<string, Profile> = {
  r1: { name: 'Priya Sharma', flat: 'A-401', tower: 'Tower A', tier: 'gold', bio: 'RWA committee member, yoga enthusiast.', interests: ['Events', 'Fitness', 'Community'] },
  r2: { name: 'Vikram Joshi', flat: 'B-201', tower: 'Tower B', tier: 'silver', bio: 'Software engineer, loves cooking.', interests: ['Tech', 'Food'] },
  r3: { name: 'Anita Desai', flat: 'A-305', tower: 'Tower A', tier: 'gold', bio: 'Retired teacher, active in community drives.', interests: ['Education', 'Community'] },
  r4: { name: 'Rohan Mehta', flat: 'C-102', tower: 'Tower C', tier: 'bronze', bio: 'New resident, just moved in.', interests: ['Gaming', 'Music'] },
};

const TIER_COLORS: Record<string, string> = {
  bronze: '#CD7F32', silver: '#9CA3AF', gold: '#F59E0B',
};

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [profile,  setProfile]  = useState<Profile | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/users/${id}`);
      if (res.ok) {
        const data: ApiUser = await res.json();
        setProfile({
          name: data.name,
          bio: data.bio ?? '',
          tier: data.kycTier ?? 'bronze',
          postCount: data._count?.posts ?? 0,
        });
        setNotFound(false);
      } else {
        const seed = PROFILES[id];
        if (seed) { setProfile(seed); setNotFound(false); }
        else setNotFound(true);
      }
    } catch {
      const seed = PROFILES[id];
      if (seed) { setProfile(seed); setNotFound(false); }
      else setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <HStack gap={3} align="center" style={styles.topBar}>
          <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/explore')} style={styles.backBtn} accessibilityRole="button">
            <ArrowLeft size={20} color={colors.surface.heading} />
          </Pressable>
          <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Resident Profile</Text>
        </HStack>
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      </SafeAreaView>
    );
  }

  if (notFound || !profile) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <HStack gap={3} align="center" style={styles.topBar}>
          <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/explore')} style={styles.backBtn} accessibilityRole="button">
            <ArrowLeft size={20} color={colors.surface.heading} />
          </Pressable>
          <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Resident Profile</Text>
        </HStack>
        <Text variant="body" tone="secondary" style={{ textAlign: 'center', marginTop: spacing[12] }}>
          This resident could not be found.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack gap={3} align="center" style={styles.topBar}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/explore')} style={styles.backBtn} accessibilityRole="button">
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Resident Profile</Text>
      </HStack>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing[16] }}>
        {/* Hero */}
        <VStack gap={3} align="center" style={styles.hero}>
          <Avatar name={profile.name} size="xl" />
          <Text variant="h3" style={{ color: colors.surface.heading }}>{profile.name}</Text>
          <HStack gap={2} align="center">
            {(profile.flat || profile.tower) ? (
              <>
                <Text variant="caption" tone="secondary">{profile.flat} · {profile.tower}</Text>
                <View style={styles.dot} />
              </>
            ) : null}
            <Text variant="caption" style={{ color: TIER_COLORS[profile.tier], fontWeight: '700', textTransform: 'capitalize' }}>
              {profile.tier}
            </Text>
          </HStack>
          <Badge
            label="Verified Resident"
            tone="success"
            leftIcon={<ShieldCheck size={11} color={colors.semantic.success} />}
          />
        </VStack>

        {/* Bio */}
        {profile.bio ? (
          <VStack gap={2} style={styles.section}>
            <Text variant="caption" style={{ fontWeight: '700', color: colors.gray[500] }}>ABOUT</Text>
            <Text variant="body" style={{ color: colors.surface.heading, lineHeight: 22 }}>{profile.bio}</Text>
          </VStack>
        ) : null}

        {/* Interests (demo profiles only — not on the real user model) */}
        {profile.interests && profile.interests.length > 0 && (
          <VStack gap={2} style={styles.section}>
            <Text variant="caption" style={{ fontWeight: '700', color: colors.gray[500] }}>INTERESTS</Text>
            <HStack gap={2} style={{ flexWrap: 'wrap' }}>
              {profile.interests.map((interest) => (
                <View key={interest} style={styles.interestChip}>
                  <Text variant="caption" style={{ fontWeight: '600', color: colors.brand[700] }}>
                    {interest}
                  </Text>
                </View>
              ))}
            </HStack>
          </VStack>
        )}

        {/* Post count (real users only) */}
        {profile.postCount != null && (
          <VStack gap={2} style={styles.section}>
            <Text variant="caption" style={{ fontWeight: '700', color: colors.gray[500] }}>ACTIVITY</Text>
            <Text variant="body" style={{ color: colors.surface.heading }}>
              {profile.postCount} post{profile.postCount === 1 ? '' : 's'} shared
            </Text>
          </VStack>
        )}

        {/* Actions */}
        <VStack gap={2} style={styles.section}>
          <Button
            label="Send Message"
            onPress={() => router.push(`/(chat)/thread/${id}` as any)}
            fullWidth
          />
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.background },
  topBar: {
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    borderBottomWidth: 0.5, borderBottomColor: colors.surface.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center',
  },
  hero: {
    paddingVertical: spacing[6], paddingHorizontal: spacing[5],
    borderBottomWidth: 0.5, borderBottomColor: colors.surface.border,
  },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.gray[300] },
  section: { paddingHorizontal: spacing[5], paddingTop: spacing[4] },
  interestChip: {
    paddingHorizontal: spacing[3], paddingVertical: spacing[1.5],
    backgroundColor: colors.brand[50], borderRadius: 20,
    borderWidth: 1, borderColor: colors.brand[200],
  },
});
