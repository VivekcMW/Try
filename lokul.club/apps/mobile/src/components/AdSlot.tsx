/**
 * AdSlot — fetches and renders a real, approved ad from the ad-serving API.
 * Respects Lokul Plus (ad-free) subscription. Renders nothing if there's no
 * eligible ad, the ad was hidden on this device, or the request fails — ads
 * must never break the feed.
 *
 * Usage:
 *   <AdSlot placement="feed" pinCode="411028" />
 *   <AdSlot placement="marketplace" size="card" pinCode={pin} />
 *   <AdSlot placement="header" size="background" pinCode={pin} />
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExternalLink, X } from 'lucide-react-native';
import { HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { useSubscriptionStore } from '@/store/subscriptionStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';
const HIDDEN_ADS_KEY = 'lokul_hidden_ad_creatives';

export type AdPlacement = 'feed' | 'explore' | 'marketplace' | 'notifications' | 'stories' | 'header';
export type AdSize      = 'banner' | 'card' | 'inline' | 'background';

// Local placement names → backend AdCreative.placement enum.
const PLACEMENT_MAP: Record<AdPlacement, 'feed_post' | 'search_slot' | 'story' | 'banner'> = {
  feed:          'feed_post',
  marketplace:   'search_slot',
  explore:       'search_slot',
  stories:       'story',
  header:        'banner',
  notifications: 'banner',
};

interface SlotItem {
  creativeId: string;
  headline: string;
  body: string;
  mediaUrl: string | null;
  ctaLabel: string;
  ctaUrl: string;
  advertiserName: string;
  label: string;
}

interface Ad {
  id: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  imageUrl: string | null;
  sponsorName: string;
}

async function readHidden(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(HIDDEN_ADS_KEY);
    return new Set<string>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

async function persistHidden(creativeId: string) {
  const hidden = await readHidden();
  hidden.add(creativeId);
  await AsyncStorage.setItem(HIDDEN_ADS_KEY, JSON.stringify([...hidden]));
}

function trackEvent(creativeId: string, event: 'impression' | 'click' | 'hide') {
  fetch(`${BASE}/api/mobile/ads/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creativeId, event }),
  }).catch(() => {});
}

interface AdSlotProps {
  placement: AdPlacement;
  pinCode?: string;
  size?: AdSize;
}

export function AdSlot({ placement, pinCode, size = 'inline' }: AdSlotProps) {
  const isAdFree = useSubscriptionStore((s) => s.canAccess('ad_free'));
  const [ad,        setAd]        = useState<Ad | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const impressed = useRef(false);

  const loadAd = useCallback(async () => {
    if (!pinCode || !/^\d{6}$/.test(pinCode)) return;
    try {
      const backendPlacement = PLACEMENT_MAP[placement];
      const res = await fetch(`${BASE}/api/mobile/ads/slot?placement=${backendPlacement}&pin=${pinCode}`);
      if (!res.ok) return;
      const data: { item: SlotItem | null } = await res.json();
      if (!data.item) return;
      const hidden = await readHidden();
      if (hidden.has(data.item.creativeId)) return;
      setAd({
        id: data.item.creativeId,
        title: data.item.headline,
        body: data.item.body,
        ctaLabel: data.item.ctaLabel,
        ctaUrl: data.item.ctaUrl,
        imageUrl: data.item.mediaUrl,
        sponsorName: data.item.advertiserName,
      });
    } catch {
      // ads must never break the feed
    }
  }, [placement, pinCode]);

  useEffect(() => { loadAd(); }, [loadAd]);

  useEffect(() => {
    if (!ad || impressed.current) return;
    impressed.current = true;
    trackEvent(ad.id, 'impression');
  }, [ad]);

  // Ad-free subscribers see nothing
  if (isAdFree) return null;
  if (dismissed || !ad) return null;

  const handlePress = () => {
    if (!ad.ctaUrl) return;
    trackEvent(ad.id, 'click');
    Linking.openURL(ad.ctaUrl).catch(() => {});
  };

  const handleDismiss = () => {
    trackEvent(ad.id, 'hide');
    persistHidden(ad.id).catch(() => {});
    setDismissed(true);
  };

  if (size === 'background') {
    return (
      <Pressable onPress={handlePress} style={styles.backgroundStrip} accessibilityRole="button">
        <HStack gap={1.5} align="center" style={{ flex: 1 }}>
          <View style={styles.sponsorDot} />
          <Text variant="caption" tone="secondary" numberOfLines={1} style={{ flex: 1 }}>
            Sponsored by {ad.sponsorName}
          </Text>
        </HStack>
        <Pressable onPress={handleDismiss} hitSlop={8} accessibilityRole="button" accessibilityLabel="Dismiss ad">
          <X size={12} color={colors.gray[400]} />
        </Pressable>
      </Pressable>
    );
  }

  if (size === 'banner') {
    return (
      <View style={styles.banner}>
        <HStack gap={2} align="center" style={{ flex: 1 }}>
          <View style={styles.sponsorDot} />
          <Text variant="caption" style={{ flex: 1, color: colors.surface.heading, fontWeight: '600' }}>
            {ad.title}
          </Text>
          <Pressable
            onPress={handlePress}
            style={styles.bannerCta}
            accessibilityRole="button"
          >
            <Text style={{ color: colors.brand[600], fontSize: 11, fontWeight: '700' }}>
              {ad.ctaLabel}
            </Text>
          </Pressable>
        </HStack>
        <Pressable onPress={handleDismiss} hitSlop={8} accessibilityRole="button" accessibilityLabel="Dismiss ad">
          <X size={14} color={colors.gray[400]} />
        </Pressable>
      </View>
    );
  }

  // default: inline card
  return (
    <Pressable onPress={handlePress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]} accessibilityRole="button">
      <HStack gap={3} align="start">
        {/* Ad avatar / thumbnail */}
        <View style={styles.adThumb}>
          <Text style={{ color: colors.brand[600], fontWeight: '800', fontSize: 13 }}>
            {ad.sponsorName.charAt(0)}
          </Text>
        </View>

        <VStack gap={0.5} style={{ flex: 1 }}>
          <HStack gap={1.5} align="center">
            <View style={styles.sponsoredPill}>
              <Text style={{ color: colors.gray[500], fontSize: 9, fontWeight: '700' }}>SPONSORED</Text>
            </View>
            <Text variant="caption" tone="secondary">{ad.sponsorName}</Text>
          </HStack>
          <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
            {ad.title}
          </Text>
          <Text variant="caption" tone="secondary" numberOfLines={2}>
            {ad.body}
          </Text>
          <HStack gap={1} align="center" style={{ marginTop: spacing[1.5] }}>
            <Text style={{ color: colors.brand[600], fontSize: 12, fontWeight: '700' }}>
              {ad.ctaLabel}
            </Text>
            <ExternalLink size={11} color={colors.brand[600]} />
          </HStack>
        </VStack>

        <Pressable onPress={handleDismiss} hitSlop={10} accessibilityRole="button" accessibilityLabel="Dismiss">
          <X size={16} color={colors.gray[400]} />
        </Pressable>
      </HStack>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.surfaceMuted,
    borderRadius: radius.xl,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.surface.surfaceMuted,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.surface.border,
  },
  backgroundStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: `${colors.brand[600]}0A`,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[1],
  },
  sponsorDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: colors.brand[400],
  },
  bannerCta: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    backgroundColor: `${colors.brand[600]}15`,
    borderRadius: radius.full,
  },
  adThumb: {
    width: 40, height: 40, borderRadius: radius.md,
    backgroundColor: `${colors.brand[600]}15`,
    alignItems: 'center', justifyContent: 'center',
  },
  sponsoredPill: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: 4, paddingVertical: 1,
    borderRadius: 3,
  },
});
