import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MapPin, PackageX } from 'lucide-react-native';
import { Badge, Button, Card, HStack, Text, VStack } from '@/components/ui';
import { useWalletStore } from '@/store/walletStore';
import { colors, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const COND_TONE: Record<string, 'success' | 'warning' | 'neutral'> = {
  new: 'success', like_new: 'success', good: 'warning', fair: 'neutral', poor: 'neutral',
};

type ApiClassified = {
  id: string; title: string; description?: string; priceRs?: number;
  category: string; condition?: string; status: string;
  createdAt: string;
  seller: { id: string; name?: string | null; flat?: string | null };
};

function TopBar({ onBack }: { onBack: () => void }) {
  return (
    <HStack gap={3} align="center" style={styles.topBar}>
      <Pressable onPress={onBack} style={styles.backBtn} accessibilityRole="button" hitSlop={10}>
        <ArrowLeft size={20} color={colors.surface.heading} />
      </Pressable>
      <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Listing</Text>
    </HStack>
  );
}

export default function ListingDetailScreen() {
  const { id }  = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const userId  = useWalletStore((s) => s.userId);
  const [listing, setListing] = useState<ApiClassified | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [marking, setMarking] = useState(false);
  const [chatting, setChatting] = useState(false);
  const [offering, setOffering] = useState(false);

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(classifieds)' as never);
  }, [router]);

  const load = useCallback(async () => {
    if (!id) { setError('Invalid listing'); setLoading(false); return; }
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(`${BASE}/api/mobile/classifieds/${id}`, { signal: controller.signal });
      if (!res.ok) {
        setListing(null);
        setError(res.status === 404 ? 'Listing not found' : 'Could not load listing');
        return;
      }
      const data = await res.json();
      if (!data || !data.id) {
        setListing(null);
        setError('Listing not found');
        return;
      }
      setListing(data);
    } catch {
      setListing(null);
      setError('Network error. Please try again.');
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const markSold = async () => {
    if (!listing || !userId) return;
    setMarking(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/classifieds/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'sold', userId }),
      });
      if (res.ok) setListing((prev) => prev ? { ...prev, status: 'sold' } : prev);
    } catch {} finally { setMarking(false); }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <TopBar onBack={goBack} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.brand[600]} />
        </View>
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <TopBar onBack={goBack} />
        <View style={styles.center}>
          <VStack gap={3} align="center" style={{ paddingHorizontal: spacing[6] }}>
            <PackageX size={48} color={colors.gray[400]} />
            <Text variant="h3" style={{ color: colors.surface.heading, textAlign: 'center' }}>
              {error ?? 'Listing unavailable'}
            </Text>
            <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
              The seller may have removed this listing, or it has expired.
            </Text>
            <HStack gap={3}>
              <Button label="Retry" variant="ghost" onPress={load} />
              <Button label="Go back" onPress={goBack} />
            </HStack>
          </VStack>
        </View>
      </SafeAreaView>
    );
  }

  const sellerName = listing.seller?.name ?? 'Seller';
  const sellerId   = listing.seller?.id;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar onBack={goBack} />

      <ScrollView contentContainerStyle={{ paddingBottom: spacing[20] }}>
        {/* Placeholder image */}
        <View style={styles.imagePlaceholder}>
          <Text style={{ color: colors.gray[400], fontSize: 13 }}>No photo added</Text>
        </View>

        <VStack gap={4} style={{ padding: spacing[5] }}>
          {/* Title + price */}
          <VStack gap={1}>
            <Text variant="h3" style={{ color: colors.surface.heading }}>{listing.title}</Text>
            <Text style={{ fontSize: 24, fontWeight: '900', color: colors.brand[600] }}>
              {!listing.priceRs ? 'FREE' : `₹${listing.priceRs.toLocaleString()}`}
            </Text>
          </VStack>

          {/* Badges */}
          <HStack gap={2}>
            <Badge
              label={(listing.condition ?? 'used').replace('_', ' ')}
              tone={COND_TONE[listing.condition ?? ''] ?? 'neutral'}
            />
            <Badge label={listing.category} tone="neutral" />
            <Badge
              label={listing.status}
              tone={listing.status === 'active' ? 'success' : 'neutral'}
            />
          </HStack>

          {/* Description */}
          {listing.description ? (
            <Card padding={4} elevation="sm">
              <Text variant="caption" style={{ fontWeight: '700', color: colors.gray[500], marginBottom: spacing[2] }}>
                DESCRIPTION
              </Text>
              <Text variant="body" style={{ color: colors.surface.heading, lineHeight: 22 }}>
                {listing.description}
              </Text>
            </Card>
          ) : null}

          {/* Seller */}
          <Card padding={4} elevation="sm">
            <Text variant="caption" style={{ fontWeight: '700', color: colors.gray[500], marginBottom: spacing[2] }}>
              SELLER
            </Text>
            <VStack gap={1.5}>
              <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
                {sellerName}
              </Text>
              {listing.seller?.flat && (
                <HStack gap={2} align="center">
                  <MapPin size={14} color={colors.gray[400]} />
                  <Text variant="caption" tone="secondary">{listing.seller.flat}</Text>
                </HStack>
              )}
              <Text variant="caption" tone="secondary">
                Listed {new Date(listing.createdAt).toLocaleDateString()}
              </Text>
            </VStack>
          </Card>
        </VStack>
      </ScrollView>

      {/* Action bar */}
      <View style={styles.actionBar}>
        {sellerId && sellerId !== userId && (
          <Button
            label="Chat with Seller"
            onPress={() => router.push(`/(chat)/thread/${sellerId}` as never)}
            variant="ghost"
            fullWidth
          />
        )}
        {sellerId === userId && listing.status === 'active' && (
          <Button label={marking ? 'Marking…' : 'Mark Sold'} fullWidth onPress={markSold} disabled={marking} />
        )}
        {sellerId !== userId && (listing.priceRs ?? 0) > 0 && (
          <Button label="Make Offer" fullWidth onPress={() => {}} />
        )}
      </View>
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
  imagePlaceholder: {
    height: 220, backgroundColor: colors.gray[100],
    alignItems: 'center', justifyContent: 'center',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  actionBar: {
    flexDirection: 'row', gap: spacing[3],
    padding: spacing[4], borderTopWidth: 0.5, borderTopColor: colors.surface.border,
    backgroundColor: colors.surface.background,
  },
});
