/**
 * AdSlot — fetches and renders a contextual native ad.
 * Respects Lokul Plus (ad-free) subscription.
 *
 * Usage:
 *   <AdSlot placement="feed" pinCode="411028" />
 *   <AdSlot placement="explore" size="banner" />
 *   <AdSlot placement="marketplace" pinCode={pin} />
 */
import { useCallback, useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { ExternalLink, X } from 'lucide-react-native';
import { HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { useSubscriptionStore } from '@/store/subscriptionStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export type AdPlacement = 'feed' | 'explore' | 'marketplace' | 'notifications' | 'stories' | 'header';
export type AdSize      = 'banner' | 'card' | 'inline' | 'background';

interface Ad {
  id: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  imageUrl: string | null;
  sponsorName: string;
  placement: AdPlacement;
}

// Seed ads used when API is unavailable / in E2E
const SEED_ADS: Ad[] = [
  {
    id: 'ad-001',
    title: 'Get free pest control this month',
    body: 'HyperClean Pest Services — 200+ societies served near Pune.',
    ctaLabel: 'Book free visit',
    ctaUrl: 'https://example.com/hyperclean',
    imageUrl: null,
    sponsorName: 'HyperClean',
    placement: 'feed',
  },
  {
    id: 'ad-002',
    title: 'Solar rooftop — ₹0 down, save ₹3,000/mo',
    body: 'SunSave Energy — Serving your PIN code. MNRE approved.',
    ctaLabel: 'Get free estimate',
    ctaUrl: 'https://example.com/sunsave',
    imageUrl: null,
    sponsorName: 'SunSave Energy',
    placement: 'explore',
  },
  {
    id: 'ad-003',
    title: 'Open a savings account in 5 minutes',
    body: 'Finova Bank — Zero-balance account. No branch visit needed.',
    ctaLabel: 'Open account',
    ctaUrl: 'https://example.com/finova',
    imageUrl: null,
    sponsorName: 'Finova Bank',
    placement: 'marketplace',
  },
  {
    id: 'ad-005',
    title: 'Home essentials delivered same day',
    body: 'GrocerEase — serving your locality. First order 20% off.',
    ctaLabel: 'Order now',
    ctaUrl: 'https://example.com/grocerease',
    imageUrl: null,
    sponsorName: 'GrocerEase',
    placement: 'header',
  },
];

interface AdSlotProps {
  placement: AdPlacement;
  pinCode?: string;
  size?: AdSize;
}

export function AdSlot({ placement, pinCode, size = 'inline' }: AdSlotProps) {
  const isAdFree = useSubscriptionStore((s) => s.canAccess('ad_free'));
  const [ad,        setAd]        = useState<Ad | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const loadAd = useCallback(async () => {
    try {
      const pin = pinCode ? `&pinCode=${pinCode}` : '';
      const res  = await fetch(`${BASE}/api/mobile/ads?placement=${placement}${pin}`);
      if (res.ok) {
        const data = await res.json();
        setAd(data.ad ?? null);
      } else {
        setAd(SEED_ADS.find((a) => a.placement === placement) ?? SEED_ADS[0]);
      }
    } catch {
      setAd(SEED_ADS.find((a) => a.placement === placement) ?? SEED_ADS[0]);
    }
  }, [placement, pinCode]);

  useEffect(() => { loadAd(); }, [loadAd]);

  // Ad-free subscribers see nothing
  if (isAdFree) return null;
  if (dismissed || !ad) return null;

  const handlePress = () => {
    if (!ad.ctaUrl || ad.ctaUrl.includes('example.com')) return;
    Linking.openURL(ad.ctaUrl);
    fetch(`${BASE}/api/mobile/ads/${ad.id}/click`, { method: 'POST' }).catch(() => {});
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
        <Pressable onPress={() => setDismissed(true)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Dismiss ad">
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
        <Pressable onPress={() => setDismissed(true)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Dismiss ad">
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

        <Pressable onPress={() => setDismissed(true)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Dismiss">
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
