/**
 * Pet sitter detail
 * Route: /(pets)/sitter/[id]
 */
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MessageCircle, Star } from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type ApiSitter = {
  id: string;
  petTypes: string[];
  experience: string;
  bio: string | null;
  pricePerDayPaise: number;
  available: boolean;
  ratingAvg: number | null;
  ratingCount: number;
  user: { id: string; name: string };
};

export default function SitterDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [sitter, setSitter] = useState<ApiSitter | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/pets/sitters/${id}`);
      const data = await res.json();
      setSitter(res.ok ? data.sitter : null);
    } catch {
      setSitter(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      </SafeAreaView>
    );
  }

  if (!sitter) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <HStack style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ArrowLeft size={24} color={colors.foreground} />
          </Pressable>
          <Text variant="h3" style={{ fontWeight: '700' }}>Sitter not found</Text>
        </HStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>{sitter.user.name}</Text>
      </HStack>

      <ScrollView contentContainerStyle={styles.content}>
        <VStack gap="lg">
          <Card style={styles.card}>
            <HStack gap="md">
              <View style={styles.avatar}>
                <Text variant="body" style={{ fontWeight: '700', color: colors.brand[600] }}>
                  {sitter.user.name.split(' ').map((n) => n[0]).join('')}
                </Text>
              </View>
              <VStack style={{ flex: 1 }}>
                <Text variant="body" style={{ fontWeight: '600' }}>{sitter.user.name}</Text>
                <Text variant="caption" tone="secondary">{sitter.experience}</Text>
                <HStack gap="xs" style={{ marginTop: spacing.xs }}>
                  <Star size={13} color={colors.warning} fill={colors.warning} />
                  <Text variant="caption" style={{ fontWeight: '500' }}>
                    {sitter.ratingAvg?.toFixed(1) ?? 'New'}{sitter.ratingCount > 0 ? ` (${sitter.ratingCount})` : ''}
                  </Text>
                </HStack>
              </VStack>
            </HStack>
          </Card>

          {sitter.bio && (
            <Card style={styles.card}>
              <Text variant="label" tone="secondary" style={{ marginBottom: spacing.xs }}>About</Text>
              <Text variant="body">{sitter.bio}</Text>
            </Card>
          )}

          <Card style={styles.card}>
            <HStack style={{ justifyContent: 'space-between' }}>
              <Text variant="caption" tone="secondary">Cares for</Text>
              <Text variant="body" style={{ fontWeight: '500' }}>{sitter.petTypes.join(', ')}</Text>
            </HStack>
            <HStack style={{ justifyContent: 'space-between', marginTop: spacing.sm }}>
              <Text variant="caption" tone="secondary">Rate</Text>
              <Text variant="body" style={{ fontWeight: '700', color: colors.brand[600] }}>₹{Math.round(sitter.pricePerDayPaise / 100)}/day</Text>
            </HStack>
          </Card>

          <Button
            label={sitter.available ? 'Request Booking' : 'Currently Unavailable'}
            disabled={!sitter.available}
            leftIcon={<MessageCircle size={16} color="#fff" />}
            onPress={() => Alert.alert('Request sent', `${sitter.user.name} will confirm availability shortly.`)}
            fullWidth
          />
        </VStack>
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
  content: { padding: spacing.lg, paddingBottom: 100 },
  card: { padding: spacing.md },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
