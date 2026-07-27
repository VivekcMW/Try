import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle, Clock, HandHeart, MapPin, Users } from 'lucide-react-native';
import { Badge, Button, Card, HStack, Text, VStack } from '@/components/ui';
import { useWalletStore } from '@/store/walletStore';
import { colors, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type Responder = { id: string; respondedAt: string; user: { id: string; name: string; avatarUrl: string | null } };
type ApiIncident = {
  id: string; category: string; severity: string; body: string;
  status: 'open' | 'ack' | 'resolved'; createdAt: string; resolvedAt: string | null;
  author: { id: string; name: string };
  responders: Responder[];
};

const SEVERITY_TONE: Record<string, 'danger' | 'warning' | 'neutral'> = {
  high: 'danger', medium: 'warning', low: 'neutral',
};
const STATUS_TONE: Record<string, 'danger' | 'warning' | 'success'> = {
  open: 'danger', ack: 'warning', resolved: 'success',
};

export default function IncidentDetailScreen() {
  const { id }   = useLocalSearchParams<{ id: string }>();
  const router   = useRouter();
  const userId   = useWalletStore((s) => s.userId);
  const [incident, setIncident] = useState<ApiIncident | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [helping,  setHelping]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/api/mobile/sos/${id}`);
      const data = await res.json();
      setIncident(data);
    } catch { setIncident(null); } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleRespond = async () => {
    if (!userId || !id) return;
    setHelping(true);
    try {
      await fetch(`${BASE}/api/mobile/sos/${id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      await load();
    } catch {
      Alert.alert('Error', 'Could not record your response. Please try again.');
    } finally { setHelping(false); }
  };

  const handleResolve = async () => {
    if (!userId || !id) return;
    try {
      await fetch(`${BASE}/api/mobile/sos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved', requesterId: userId }),
      });
      await load();
    } catch { /* noop */ }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!incident) return null;

  const alreadyResponded = incident.responders.some((r) => r.user.id === userId);
  const isAuthor  = incident.author.id === userId;
  const isActive  = incident.status !== 'resolved';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack gap={3} align="center" style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Incident Detail</Text>
        <Badge label={incident.status.toUpperCase()} tone={STATUS_TONE[incident.status] ?? 'neutral'} variant="soft" />
      </HStack>

      <ScrollView contentContainerStyle={styles.content}>
        <HStack gap={2} style={{ marginBottom: spacing[4] }}>
          <Badge label={incident.severity.toUpperCase()} tone={SEVERITY_TONE[incident.severity] ?? 'neutral'} variant="soft" />
          <Badge label={incident.category.replace('_', ' ')} tone="neutral" variant="soft" />
        </HStack>

        {/* Info card */}
        <Card padding={4} elevation="sm" style={{ marginBottom: spacing[4] }}>
          <VStack gap={3}>
            <HStack gap={2} align="center">
              <Clock size={16} color={colors.gray[400]} />
              <Text variant="body" tone="secondary">{new Date(incident.createdAt).toLocaleString()}</Text>
            </HStack>
            <HStack gap={2} align="center">
              <Users size={16} color={colors.gray[400]} />
              <Text variant="body" tone="secondary">Reported by {incident.author.name}</Text>
            </HStack>
            {incident.resolvedAt && (
              <HStack gap={2} align="center">
                <CheckCircle size={16} color={colors.semantic.success} />
                <Text variant="body" tone="secondary">
                  Resolved {new Date(incident.resolvedAt).toLocaleString()}
                </Text>
              </HStack>
            )}
          </VStack>
        </Card>

        {/* Description */}
        <Card padding={4} elevation="sm" style={{ marginBottom: spacing[4] }}>
          <Text variant="caption" style={{ fontWeight: '700', color: colors.gray[500], marginBottom: spacing[2] }}>
            DESCRIPTION
          </Text>
          <Text variant="body" style={{ color: colors.surface.heading, lineHeight: 22 }}>
            {incident.body}
          </Text>
        </Card>

        {/* Responders */}
        <Card padding={4} elevation="sm" style={{ marginBottom: spacing[4] }}>
          <Text variant="caption" style={{ fontWeight: '700', color: colors.gray[500], marginBottom: spacing[2] }}>
            RESPONDERS ({incident.responders.length})
          </Text>
          {incident.responders.length === 0 ? (
            <Text variant="body" tone="secondary">No responders yet</Text>
          ) : (
            <VStack gap={2}>
              {incident.responders.map((r) => (
                <HStack key={r.id} gap={2} align="center">
                  <CheckCircle size={14} color={colors.semantic.success} />
                  <Text variant="body">{r.user.name}</Text>
                  <Text variant="caption" tone="secondary" style={{ marginLeft: 'auto' }}>
                    {new Date(r.respondedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </HStack>
              ))}
            </VStack>
          )}
        </Card>

        {/* Actions */}
        {isActive && !isAuthor && !alreadyResponded && (
          <Button
            label="I'm nearby — I'll help"
            variant="primary"
            leftIcon={<HandHeart size={16} color="#fff" />}
            loading={helping}
            onPress={handleRespond}
            style={{ marginBottom: spacing[3] }}
          />
        )}
        {isActive && isAuthor && (
          <Button label="Mark as Resolved" variant="secondary" onPress={handleResolve} style={{ marginBottom: spacing[3] }} />
        )}
        {alreadyResponded && isActive && (
          <Card padding={3} elevation="none" style={{ backgroundColor: colors.semantic?.success + '18', marginBottom: spacing[3] }}>
            <HStack gap={2} align="center">
              <CheckCircle size={16} color={colors.semantic.success} />
              <Text variant="body" style={{ color: colors.semantic.success, fontWeight: '600' }}>
                You&apos;ve marked yourself as a responder
              </Text>
            </HStack>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.surface.background },
  topBar: { paddingHorizontal: spacing[4], paddingTop: spacing[5], paddingBottom: spacing[3] },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center',
  },
  content: { paddingHorizontal: spacing[4], paddingBottom: spacing[16] },
});

