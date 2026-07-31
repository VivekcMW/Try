// PRD §08 — Stories row (24h) with real API
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Zap } from 'lucide-react-native';
import { Text } from './Text';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { colors, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export type ApiStory = {
  id: string;
  mediaUrl: string | null;
  caption: string | null;
  expiresAt: string;
  author: { id: string; name: string; avatarUrl: string | null };
  _viewedByMe: boolean;
};

type SponsoredStory = {
  kind: 'sponsored';
  id: string;
  advertiser: string;
  ctaUrl: string;
  initial: string;
};

interface Props {
  readonly onStoryPress?: (story: ApiStory) => void;
}

export function StoriesRow({ onStoryPress }: Props) {
  const router   = useRouter();
  const pinCode  = useOnboardingStore((s) => s.pin);
  const userId   = useOnboardingStore((s) => s.phone);
  const adFree   = useSubscriptionStore((s) => s.canAccess('ad_free'));
  const [stories, setStories] = useState<ApiStory[]>([]);
  const [sponsored, setSponsored] = useState<SponsoredStory | null>(null);
  const [loading, setLoading] = useState(true);
  const hasLoaded = useRef(false);

  const load = useCallback(async () => {
    if (!pinCode) return;
    // Only show spinner on initial load — don't flash when re-fetching
    if (!hasLoaded.current) setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/stories?pinCode=${pinCode}&viewerId=${userId}`);
      const data = await res.json();
      setStories(data.stories ?? []);
    } catch {
      setStories([]);
    } finally {
      setLoading(false);
      hasLoaded.current = true;
    }
    // Fetch sponsored story ad (skip if ad-free)
    if (!adFree && pinCode && /^\d{6}$/.test(pinCode)) {
      try {
        const adRes = await fetch(`${BASE}/api/mobile/ads/slot?placement=story&pin=${pinCode}`);
        if (adRes.ok) {
          const adData: { item: { creativeId: string; advertiserName: string; ctaUrl: string } | null } = await adRes.json();
          if (adData.item) {
            setSponsored({
              kind: 'sponsored',
              id: adData.item.creativeId,
              advertiser: adData.item.advertiserName,
              ctaUrl: adData.item.ctaUrl,
              initial: adData.item.advertiserName.charAt(0).toUpperCase(),
            });
            fetch(`${BASE}/api/mobile/ads/event`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ creativeId: adData.item.creativeId, event: 'impression' }),
            }).catch(() => {});
          }
        }
      } catch { /* no-op */ }
    }
  }, [pinCode, userId, adFree]);

  useEffect(() => { load(); }, [load]);

  if (loading && stories.length === 0) {
    return (
      <View style={s.wrap}>
        <ActivityIndicator size="small" color={colors.brand[500]} style={{ margin: spacing[3] }} />
      </View>
    );
  }

  if (!loading && stories.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.row}
    >
      {/* Add story button */}
      <Pressable
        onPress={() => router.push('/(feed)/create-story' as never)}
        style={s.addBtn}
        accessibilityRole="button"
        accessibilityLabel="Create story"
      >
        <View style={s.addRing}>
          <Plus size={20} color={colors.brand[700]} />
        </View>
        <Text variant="caption" style={s.label} numberOfLines={1}>Your story</Text>
      </Pressable>

      {stories.map((story, idx) => {
        const initials = story.author.name.charAt(0).toUpperCase();
        const viewed   = story._viewedByMe;
        const handlePress = () => {
          if (onStoryPress) {
            onStoryPress(story);
          } else {
            router.push({
              pathname: '/(feed)/story/[id]',
              params: { id: story.id, storyId: story.id, stories: JSON.stringify(stories) },
            } as never);
          }
        };
        return (
          <>
            <Pressable
              key={story.id}
              onPress={handlePress}
              style={s.item}
              accessibilityRole="button"
            >
              <View style={[s.ring, viewed ? s.ringViewed : s.ringUnviewed]}>
                <View style={s.avatar}>
                  <Text style={s.initial}>{initials}</Text>
                </View>
              </View>
              <Text variant="caption" style={s.label} numberOfLines={1}>
                {story.author.name.split(' ')[0]}
              </Text>
            </Pressable>
            {/* Insert sponsored story after 2nd organic story */}
            {idx === 1 && sponsored ? (
              <Pressable
                key="sponsored"
                onPress={() => {
                  fetch(`${BASE}/api/mobile/ads/event`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ creativeId: sponsored.id, event: 'click' }),
                  }).catch(() => {});
                  if (sponsored.ctaUrl) Linking.openURL(sponsored.ctaUrl).catch(() => {});
                }}
                style={s.item}
                accessibilityRole="button"
                accessibilityLabel={`Sponsored story by ${sponsored.advertiser}`}
              >
                <View style={[s.ring, s.ringSponsor]}>
                  <View style={[s.avatar, s.avatarSponsor]}>
                    <Zap size={18} color="#92400e" />
                  </View>
                </View>
                <Text variant="caption" style={[s.label, s.labelSponsor]} numberOfLines={1}>
                  Sponsored
                </Text>
              </Pressable>
            ) : null}
          </>
        );
      })}
    </ScrollView>
  );
}

const AVATAR_SIZE = 56;

const s = StyleSheet.create({
  wrap:      { height: 90, justifyContent: 'center' },
  row:       { paddingHorizontal: spacing[4], paddingVertical: spacing[2], gap: spacing[3] },
  item:      { alignItems: 'center', width: 64 },
  ring:      {
    width: AVATAR_SIZE + 6,
    height: AVATAR_SIZE + 6,
    borderRadius: (AVATAR_SIZE + 6) / 2,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringUnviewed: { borderWidth: 2.5, borderColor: colors.brand[600] },
  ringViewed:   { borderWidth: 2, borderColor: colors.gray[300] },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.brand[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { fontSize: 22, fontWeight: '700', color: colors.brand[700] },
  label:   { fontSize: 11, marginTop: spacing[1], color: colors.surface.textSecondary, maxWidth: 64, textAlign: 'center' },
  addBtn: { alignItems: 'center', width: 64 },
  addRing: {
    width: AVATAR_SIZE + 6,
    height: AVATAR_SIZE + 6,
    borderRadius: (AVATAR_SIZE + 6) / 2,
    backgroundColor: colors.brand[50],
    borderWidth: 2,
    borderColor: colors.brand[200],
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringSponsor: { borderWidth: 2.5, borderColor: '#F59E0B' },
  avatarSponsor: { backgroundColor: '#FEF3C7' },
  labelSponsor: { color: '#B45309', fontWeight: '700' },
});
