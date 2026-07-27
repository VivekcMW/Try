/**
 * Agent detail
 * Route: /(realestate)/agent/[id]
 */
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, BadgeCheck, Building, MessageCircle, Phone, Star } from 'lucide-react-native';
import { Badge, Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type ApiAgent = {
  id: string;
  specialization: string[];
  experience: string;
  ratingAvg: number | null;
  ratingCount: number;
  verified: boolean;
  user: { id: string; name: string };
};

type ApiListing = { id: string; title: string; location: string };

export default function AgentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [agent, setAgent] = useState<ApiAgent | null>(null);
  const [listings, setListings] = useState<ApiListing[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/realestate/agents/${id}`);
      const data = await res.json();
      setAgent(res.ok ? data.agent : null);
      setListings(data.listings ?? []);
    } catch {
      setAgent(null);
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

  if (!agent) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <HStack style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ArrowLeft size={24} color={colors.foreground} />
          </Pressable>
          <Text variant="h3" style={{ fontWeight: '700' }}>Agent not found</Text>
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
        <Text variant="h3" style={{ fontWeight: '700' }}>{agent.user.name}</Text>
      </HStack>

      <ScrollView contentContainerStyle={styles.content}>
        <VStack gap="lg">
          <Card style={styles.card}>
            <HStack gap="md">
              <View style={styles.avatar}>
                <Text variant="body" style={{ fontWeight: '700', color: colors.brand[600] }}>
                  {agent.user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </Text>
              </View>
              <VStack style={{ flex: 1 }}>
                <HStack gap="xs">
                  <Text variant="body" style={{ fontWeight: '600' }}>{agent.user.name}</Text>
                  {agent.verified && <BadgeCheck size={14} color={colors.success} />}
                </HStack>
                <Text variant="caption" tone="secondary">{agent.experience}</Text>
                <HStack gap="xs" style={{ marginTop: spacing.xs }}>
                  <Star size={13} color={colors.warning} fill={colors.warning} />
                  <Text variant="caption" style={{ fontWeight: '500' }}>{agent.ratingAvg?.toFixed(1) ?? 'New'} ({agent.ratingCount} reviews)</Text>
                </HStack>
              </VStack>
            </HStack>
          </Card>

          <Card style={styles.card}>
            <Text variant="label" tone="secondary" style={{ marginBottom: spacing.sm }}>Specializes in</Text>
            <HStack gap="sm" style={{ flexWrap: 'wrap' }}>
              {agent.specialization.map((s) => (
                <Badge key={s} label={s} tone="brand" />
              ))}
            </HStack>
          </Card>

          <Card style={styles.card}>
            <HStack gap="sm" style={{ alignItems: 'center' }}>
              <Building size={16} color={colors.textSecondary} />
              <Text variant="body" style={{ fontWeight: '500' }}>{listings.length} active listings</Text>
            </HStack>
          </Card>

          {listings.length > 0 && (
            <VStack gap="sm">
              <Text variant="label" tone="secondary">Current listings</Text>
              {listings.map((p) => (
                <Pressable key={p.id} onPress={() => router.push(`/(realestate)/property/${p.id}`)}>
                  <Card style={styles.card}>
                    <Text variant="body" style={{ fontWeight: '600' }}>{p.title}</Text>
                    <Text variant="caption" tone="secondary">{p.location}</Text>
                  </Card>
                </Pressable>
              ))}
            </VStack>
          )}

          <HStack gap="md">
            <Button
              label="Call"
              variant="secondary"
              leftIcon={<Phone size={16} color={colors.brand[600]} />}
              onPress={() => Alert.alert('Call', `Calling ${agent.user.name}…`)}
              fullWidth
            />
            <Button
              label="Message"
              leftIcon={<MessageCircle size={16} color="#fff" />}
              onPress={() => Alert.alert('Message sent', `${agent.user.name} will get back to you shortly.`)}
              fullWidth
            />
          </HStack>
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
    borderRadius: 16,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
