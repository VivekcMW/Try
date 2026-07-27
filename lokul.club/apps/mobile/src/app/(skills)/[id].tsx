/**
 * Skill Offer detail
 * Route: /(skills)/[id]
 */
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Clock, MapPin, Star, Users } from 'lucide-react-native';
import { Card, HStack, Text, VStack, Button } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { useWalletStore } from '@/store/walletStore';
import { SKILL_CATEGORIES } from './index';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const MODE_LABEL: Record<string, string> = {
  teach: 'Teaching',
  learn: 'Learning',
  exchange: 'Exchange',
};

type ApiSkillOffer = {
  id: string;
  skill: string;
  category: string;
  description: string;
  experience: string;
  mode: string;
  availability: string;
  pricePaise: number | null;
  responseCount: number;
  ratingAvg: number | null;
  ratingCount: number;
  sessionsCompleted: number;
  owner: { id: string; name: string };
};

export default function SkillDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = useWalletStore((s) => s.userId);
  const [offer, setOffer] = useState<ApiSkillOffer | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const requesterQuery = userId ? `?requesterId=${userId}` : '';
      const res = await fetch(`${BASE}/api/mobile/skills/${id}${requesterQuery}`);
      const data = await res.json();
      setOffer(res.ok ? data.offer : null);
      setConnected(!!data.connected);
    } catch {
      setOffer(null);
    } finally {
      setLoading(false);
    }
  }, [id, userId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      </SafeAreaView>
    );
  }

  if (!offer) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <HStack style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ArrowLeft size={24} color={colors.foreground} />
          </Pressable>
          <Text variant="h3" style={{ fontWeight: '700' }}>Skill not found</Text>
        </HStack>
        <VStack style={styles.notFound} gap="sm">
          <Text variant="body" tone="secondary">This skill post no longer exists.</Text>
          <Button label="Back to Skill Exchange" onPress={() => router.back()} />
        </VStack>
      </SafeAreaView>
    );
  }

  const category = SKILL_CATEGORIES.find((c) => c.id === offer.category);
  const isMine = offer.owner.id === userId;

  const handleConnect = async () => {
    if (!userId) return;
    if (connected) {
      Alert.alert('Already requested', `You've already sent a connection request for "${offer.skill}".`);
      return;
    }
    try {
      await fetch(`${BASE}/api/mobile/skills/${offer.id}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requesterId: userId }),
      });
      setConnected(true);
      Alert.alert(
        'Request sent',
        `${offer.owner.name} has been notified of your interest in "${offer.skill}". They'll reach out to coordinate details.`,
      );
    } catch {
      Alert.alert('Failed', 'Could not send the request. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <VStack style={styles.headerTitle}>
          <Text variant="h3" style={{ fontWeight: '700' }} numberOfLines={1}>{offer.skill}</Text>
          <Text variant="caption" tone="secondary">{category?.name ?? offer.category}</Text>
        </VStack>
      </HStack>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.body}>
        <VStack gap="lg">
          <Card style={styles.card}>
            <HStack gap="md" style={{ marginBottom: spacing.sm }}>
              <View style={styles.avatar}>
                <Text variant="body" style={{ fontWeight: '700', color: colors.brand[600] }}>
                  {offer.owner.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </Text>
              </View>
              <VStack style={{ flex: 1 }}>
                <Text variant="body" style={{ fontWeight: '600' }}>{offer.owner.name}</Text>
              </VStack>
              <View style={styles.modeBadge}>
                <Text variant="caption" style={{ color: colors.brand[600], fontWeight: '600' }}>
                  {MODE_LABEL[offer.mode] ?? offer.mode}
                </Text>
              </View>
            </HStack>

            <HStack style={styles.statsRow}>
              <HStack gap="xs">
                <Star size={14} color={colors.semantic.warning} fill={colors.semantic.warning} />
                <Text variant="caption" style={{ fontWeight: '500' }}>{offer.ratingAvg?.toFixed(1) ?? 'New'}</Text>
                {offer.ratingCount > 0 && <Text variant="caption" tone="secondary">({offer.ratingCount})</Text>}
              </HStack>
              <HStack gap="xs">
                <Users size={14} color={colors.textSecondary} />
                <Text variant="caption" tone="secondary">{offer.sessionsCompleted} sessions</Text>
              </HStack>
              <HStack gap="xs">
                <Clock size={14} color={colors.textSecondary} />
                <Text variant="caption" tone="secondary">{offer.availability}</Text>
              </HStack>
            </HStack>
          </Card>

          <Card style={styles.card}>
            <Text variant="label" tone="secondary" style={{ marginBottom: spacing.xs }}>Description</Text>
            <Text variant="body">{offer.description}</Text>
          </Card>

          <Card style={styles.card}>
            <VStack gap="sm">
              <HStack style={{ justifyContent: 'space-between' }}>
                <Text variant="caption" tone="secondary">Experience</Text>
                <Text variant="body" style={{ fontWeight: '500' }}>{offer.experience}</Text>
              </HStack>
              <HStack style={{ justifyContent: 'space-between' }}>
                <Text variant="caption" tone="secondary">Price</Text>
                {offer.pricePaise ? (
                  <Text variant="body" style={{ fontWeight: '700', color: colors.brand[600] }}>₹{Math.round(offer.pricePaise / 100)}/session</Text>
                ) : (
                  <Text variant="body" style={{ fontWeight: '600', color: '#8B5CF6' }}>Free / Exchange</Text>
                )}
              </HStack>
              <HStack style={{ justifyContent: 'space-between' }}>
                <Text variant="caption" tone="secondary">Connection requests</Text>
                <Text variant="body" style={{ fontWeight: '500' }}>{offer.responseCount}</Text>
              </HStack>
            </VStack>
          </Card>

          {isMine ? (
            <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
              This is your own post — you'll see connection requests here as neighbours reach out.
            </Text>
          ) : (
            <Button
              label={connected ? 'Request Sent' : 'Connect'}
              variant={connected ? 'secondary' : 'primary'}
              disabled={connected}
              onPress={handleConnect}
              fullWidth
            />
          )}
        </VStack>
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
  scroll: { flex: 1 },
  body: { padding: spacing.lg },
  card: { padding: spacing.md },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.brand[50],
    alignSelf: 'flex-start',
  },
  statsRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.lg,
    flexWrap: 'wrap',
  },
  notFound: { padding: spacing.lg, alignItems: 'center' },
  bottomPadding: { height: 100 },
});
