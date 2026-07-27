import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle, Clock, MapPin, Star } from 'lucide-react-native';
import { Avatar, Badge, Button, Card, HStack, Text, VStack } from '@/components/ui';
import { AdSlot } from '@/components/AdSlot';
import { useWalletStore } from '@/store/walletStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { colors, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type ApiMerchant = {
  id: string; name: string; bio?: string; rating?: number; reviewCount?: number;
  priceLabel?: string; verified?: boolean; responseTime?: string;
  societiesServed?: string[]; category?: string;
  owner?: { id: string; name: string; avatarUrl?: string };
  ownerId?: string;
};

export default function MerchantProfileScreen() {
  const { id }  = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const userId  = useWalletStore((s) => s.userId);
  const pinCode = useOnboardingStore((s) => s.pin);
  const [merchant, setMerchant] = useState<ApiMerchant | null>(null);
  const [loading,  setLoading]  = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/api/mobile/merchants/${id}`);
      const data = await res.json();
      setMerchant(data);
    } catch { /* noop */ } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      </SafeAreaView>
    );
  }

  if (!merchant) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text variant="body" style={{ padding: spacing[6] }}>Provider not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack gap={3} align="center" style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Provider Profile</Text>
      </HStack>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing[16] }}>
        {/* Hero */}
        <VStack gap={3} align="center" style={styles.hero}>
          <Avatar name={merchant.name} size="xl" />
          <Text variant="h3" style={{ color: colors.surface.heading, textAlign: 'center' }}>
            {merchant.name}
          </Text>
          <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
            {merchant.priceLabel}
          </Text>
          <HStack gap={2} style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
            {merchant.verified && (
              <Badge label="Verified" tone="success"
                leftIcon={<CheckCircle size={11} color={colors.semantic.success} />} />
            )}
          </HStack>
        </VStack>

        {/* Stats row */}
        <Card padding={4} elevation="sm" style={styles.statsCard}>
          <HStack gap={0} style={{ justifyContent: 'space-around' }}>
            <VStack gap={0} align="center">
              <HStack gap={1} align="center">
                <Star size={14} color="#F59E0B" fill="#F59E0B" />
                <Text variant="h3" style={{ color: colors.surface.heading }}>{merchant.rating?.toFixed(1) ?? '—'}</Text>
              </HStack>
              <Text variant="caption" tone="secondary">Rating</Text>
            </VStack>
            <View style={styles.statDivider} />
            <VStack gap={0} align="center">
              <Text variant="h3" style={{ color: colors.surface.heading }}>{merchant.reviewCount ?? 0}</Text>
              <Text variant="caption" tone="secondary">Reviews</Text>
            </VStack>
          </HStack>
        </Card>

        {/* About */}
        <VStack gap={2} style={styles.section}>
          <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>About</Text>
          <Text variant="body" style={{ color: colors.surface.heading, lineHeight: 22 }}>
            {merchant.bio ?? `${merchant.name} is a trusted service provider in Kumar Sienna, verified by the community.`}
          </Text>
        </VStack>

        {/* In-feed ad */}
        <View style={{ marginHorizontal: spacing[4], marginTop: spacing[3] }}>
          <AdSlot placement="marketplace" pinCode={pinCode ?? undefined} />
        </View>

        {/* Details */}
        <VStack gap={2} style={styles.section}>
          <HStack gap={2} align="center">
              <Text variant="caption" tone="secondary" style={{ width: 100 }}>Starting at</Text>
              <Text variant="body" style={{ fontWeight: '700', color: colors.brand[600] }}>
                {merchant.priceLabel ?? 'Contact for price'}
              </Text>
            </HStack>
          {!!merchant.responseTime && (
            <HStack gap={2} align="center">
              <Clock size={14} color={colors.gray[400]} />
              <Text variant="caption" tone="secondary">Responds in {merchant.responseTime}</Text>
            </HStack>
          )}
          {merchant.societiesServed && merchant.societiesServed.length > 0 && (
            <HStack gap={2} align="center">
              <MapPin size={14} color={colors.gray[400]} />
              <Text variant="caption" tone="secondary">{merchant.societiesServed.join(', ')}</Text>
            </HStack>
          )}
        </VStack>

        {/* CTA */}
        <View style={styles.section}>
          <VStack gap={3}>
            <Button
              label="Book Now"
              onPress={() => router.push(`/(marketplace)/book/${merchant.id}` as never)}
              fullWidth
            />
            <Button
              label="Message Provider"
              variant="secondary"
              onPress={async () => {
                if (!userId) return;
                const recipientId = merchant.owner?.id ?? merchant.ownerId;
                if (!recipientId) return;
                try {
                  const res = await fetch(`${BASE}/api/mobile/chat/threads`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, recipientId }),
                  });
                  const data = await res.json();
                  if (data.id) {
                    router.push(`/(chat)/thread/${data.id}` as never);
                  } else {
                    Alert.alert('Error', 'Could not start conversation — please try again.');
                  }
                } catch {
                  Alert.alert('Error', 'Could not start conversation — please try again.');
                }
              }}
              fullWidth
            />
          </VStack>
        </View>
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
  statsCard: { marginHorizontal: spacing[4], marginTop: spacing[4] },
  statDivider: { width: 0.5, height: '60%', backgroundColor: colors.surface.border, alignSelf: 'center' },
  section: { paddingHorizontal: spacing[5], paddingTop: spacing[4] },
});
