// PRD §05 — Peer role public profile page
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MessageCircle, Star, ShoppingBag, Zap } from 'lucide-react-native';
import { Badge, Button, Card, HStack, Text, VStack } from '@/components/ui';
import { PlusGate } from '@/components/PlusGate';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type Listing = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  pricePaise: number;
  priceUnit: string;
  ratingAvg: number;
  ratingCount: number;
  isActive: boolean;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
    kycTier: string;
    trustScore: number;
  };
};

export default function PeerProfilePage() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router   = useRouter();
  const myId     = useWalletStore((s) => s.userId);
  const pinCode  = useOnboardingStore((s) => s.pin);
  const canBoost = useSubscriptionStore((s) => s.canAccess('sponsored_posts'));
  const [listing,  setListing]  = useState<Listing | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [ordered,  setOrdered]  = useState(false);

  const load = useCallback(async () => {
    if (!pinCode) return;
    setLoading(true);
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res = await fetch(`${BASE}/api/mobile/service-listings?pinCode=${pinCode}`, { signal: ctrl.signal });
      const data = await res.json();
      const list = Array.isArray(data?.items) ? data.items : [];
      const found = list.find((l: Listing) => l.user?.id === userId);
      setListing(found ?? null);
    } catch { /* aborted or failed */ } finally {
      clearTimeout(to);
      setLoading(false);
    }
  }, [pinCode, userId]);

  useEffect(() => { load(); }, [load]);

  async function placeOrder() {
    if (!listing || !myId) return;
    setOrdering(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: myId,
          sellerId: listing.user.id,
          listingId: listing.id,
          pricePaise: listing.pricePaise,
        }),
      });
      if (!res.ok) { Alert.alert('Order failed', 'Please try again.'); return; }
      setOrdered(true);
    } catch { Alert.alert('Network error', 'Please try again.'); } finally {
      setOrdering(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.brand[600]} />
        </View>
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={s.safe}>
        <Pressable onPress={() => router.back()} style={{ padding: spacing[4] }}>
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="body" tone="secondary" style={{ textAlign: 'center', marginTop: spacing[10] }}>Profile not found.</Text>
      </SafeAreaView>
    );
  }

  const u = listing.user;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <HStack gap={3} align="center" style={s.topBar}>
        <Pressable onPress={() => router.back()} style={s.backBtn} accessibilityRole="button">
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Profile</Text>
      </HStack>

      <ScrollView contentContainerStyle={{ padding: spacing[4], gap: spacing[4], paddingBottom: spacing[16] }}>
        {/* Profile header */}
        <Card padding={4} elevation="sm">
          <VStack gap={3} align="center" style={{ alignItems: 'center' }}>
            <View style={s.avatar}>
              <Text style={{ fontSize: 32 }}>{u.name.charAt(0).toUpperCase()}</Text>
            </View>
            <VStack gap={1} style={{ alignItems: 'center' }}>
              <Text variant="h2" style={{ fontWeight: '800', textAlign: 'center' }}>{u.name}</Text>
              <HStack gap={2} align="center">
                <Badge label={u.kycTier.toUpperCase()} tone={u.kycTier === 'gold' ? 'warning' : u.kycTier === 'silver' ? 'neutral' : 'neutral'} />
                <HStack gap={1} align="center">
                  <Star size={12} color="#F59E0B" fill="#F59E0B" />
                  <Text variant="caption" style={{ color: '#F59E0B', fontWeight: '700' }}>
                    {u.trustScore.toFixed(0)} trust
                  </Text>
                </HStack>
              </HStack>
            </VStack>
          </VStack>
        </Card>

        {/* Listing card */}
        <Card padding={4} elevation="xs" bordered>
          <VStack gap={2}>
            <HStack justify="between" align="center">
              <Text variant="body" style={{ fontWeight: '800', color: colors.surface.heading }}>{listing.title}</Text>
              <Badge label={listing.category.toUpperCase()} tone="info" />
            </HStack>

            {listing.description && (
              <Text variant="caption" tone="secondary">{listing.description}</Text>
            )}

            <HStack justify="between" align="center">
              <HStack gap={1} align="center">
                <Star size={14} color="#F59E0B" fill="#F59E0B" />
                <Text variant="caption" style={{ fontWeight: '700' }}>
                  {listing.ratingAvg.toFixed(1)} ({listing.ratingCount} reviews)
                </Text>
              </HStack>
              <Text variant="h3" style={{ fontWeight: '800', color: colors.brand[700] }}>
                ₹{(listing.pricePaise / 100).toFixed(0)}<Text variant="caption" tone="secondary">/{listing.priceUnit}</Text>
              </Text>
            </HStack>
          </VStack>
        </Card>

        {/* Actions: for visitors */}
        {myId !== userId && (
          <VStack gap={2}>
            {ordered ? (
              <Card padding={4} elevation="xs">
                <HStack gap={2} align="center" style={{ justifyContent: 'center' }}>
                  <ShoppingBag size={20} color={colors.brand[600]} />
                  <Text variant="body" style={{ color: colors.brand[700], fontWeight: '700' }}>Order placed!</Text>
                </HStack>
              </Card>
            ) : (
              <Button
                label={`Book ${listing.title}`}
                onPress={placeOrder}
                loading={ordering}
                fullWidth
              />
            )}
            <Button
              label="Send message"
              variant="secondary"
              leftIcon={<MessageCircle size={16} color={colors.brand[700]} />}
              onPress={() => router.push(`/(chat)/dm/${userId}` as never)}
              fullWidth
            />
          </VStack>
        )}

        {/* Boost listing: for listing owner */}
        {myId === userId && (
          <PlusGate
            feature="sponsored_posts"
            title="Boost your listing"
            subtitle="Get featured at the top of search results with Lokul Business."
          >
            <Pressable
              onPress={() => Alert.alert('Listing Boosted!', 'Your listing will appear as "Promoted" for 7 days.')}
              style={s.boostBtn}
              accessibilityRole="button"
            >
              <Zap size={16} color="#B45309" />
              <Text style={{ fontWeight: '700', color: '#B45309', fontSize: 14 }}>Boost this listing</Text>
              <Badge label="BUSINESS" tone="warning" style={{ marginLeft: 'auto' } as any} />
            </Pressable>
          </PlusGate>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.surface.background },
  topBar:  { paddingHorizontal: spacing[4], paddingVertical: spacing[3] },
  backBtn: { padding: spacing[1] },
  avatar:  {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.brand[100],
    alignItems: 'center', justifyContent: 'center',
  },
  boostBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[2],
    backgroundColor: '#FEF3C7', borderRadius: 12, padding: spacing[3],
    borderWidth: 1.5, borderColor: '#F59E0B',
  },
});
