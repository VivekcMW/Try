// PRD §03 — Safety feed (real API, geo-aware) with Ably WebSocket push
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AlertTriangle, ChevronRight, Plus, ShieldCheck } from 'lucide-react-native';
import { Badge, Card, HStack, Text, VStack } from '@/components/ui';
import { CATEGORY_META } from '@/data/safety-seed';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { getAblyClient } from '@/lib/ably';
import { colors, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type ApiIncident = {
  id: string; category: string; severity: string; body: string;
  status: 'open' | 'ack' | 'resolved'; createdAt: string;
  author: { name: string };
  responders: { id: string }[];
};

const SEVERITY_TONE: Record<string, 'danger' | 'warning' | 'neutral'> = {
  high: 'danger', medium: 'warning', low: 'neutral',
};

function IncidentCard({ item, onPress }: { readonly item: ApiIncident; readonly onPress: () => void }) {
  const tone      = SEVERITY_TONE[item.severity] ?? 'neutral';
  const diffMins  = Math.floor((Date.now() - new Date(item.createdAt).getTime()) / 60_000);
  const timeLabel = diffMins < 60 ? `${diffMins}m ago` : `${Math.floor(diffMins / 60)}h ago`;
  const isActive  = item.status !== 'resolved';
  const catMeta   = CATEGORY_META[item.category as keyof typeof CATEGORY_META];
  const CatIcon   = catMeta?.Icon ?? AlertTriangle;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.75 }]}>
      <Card padding={4} elevation="sm" style={styles.card}>
        <HStack gap={3} align="start">
          <View style={[styles.iconBox, { backgroundColor: tone === 'danger' ? colors.semantic.dangerBg : colors.semantic.warningBg }]}>
            <CatIcon size={20} color={tone === 'danger' ? colors.semantic.danger : colors.semantic.warning} />
          </View>
          <VStack gap={1} style={{ flex: 1 }}>
            <HStack gap={2} align="center">
              <Badge label={item.severity.toUpperCase()} tone={tone} size="sm" variant="soft" />
              {isActive
                ? <Badge label="LIVE" tone="danger" size="sm" variant="solid" />
                : <Badge label="Resolved" tone="neutral" size="sm" variant="soft" />
              }
              <Text variant="caption" tone="secondary" style={{ marginLeft: 'auto' }}>{timeLabel}</Text>
            </HStack>
            <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
              {item.category.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </Text>
            <Text variant="caption" tone="secondary" numberOfLines={2}>{item.body}</Text>
            <HStack gap={3} style={{ marginTop: spacing[1] }}>
              <Text variant="caption" tone="secondary">By {item.author.name}</Text>
              <Text variant="caption" tone="secondary">{item.responders.length} responder{item.responders.length === 1 ? '' : 's'}</Text>
            </HStack>
          </VStack>
          <ChevronRight size={16} color={colors.surface.textSecondary} />
        </HStack>
      </Card>
    </Pressable>
  );
}

export default function SafetyScreen() {
  const router  = useRouter();
  const pinCode = useOnboardingStore((s) => s.pin);
  const userId  = useWalletStore((s) => s.userId);
  const [incidents, setIncidents] = useState<ApiIncident[]>([]);
  const [loading,   setLoading]   = useState(true);
  // Track whether the list was already loaded for stable FlatList keys
  const loadedRef = useRef(false);

  const load = useCallback(async () => {
    if (!pinCode) { setLoading(false); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/api/mobile/sos?pinCode=${pinCode}&status=all&limit=30`);
      const data = await res.json();
      setIncidents(data.items ?? []);
      loadedRef.current = true;
    } catch { setIncidents([]); } finally { setLoading(false); }
  }, [pinCode]);

  // Initial load + Ably real-time subscription for new SOS alerts in this pinCode
  useEffect(() => {
    load();
    if (!pinCode || !userId) return;

    let subscribed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let channel: any = null;

    try {
      const client = getAblyClient(userId);
      channel = client.channels.get(`sos:${pinCode}`);
      channel.subscribe('incident', (msg: { data: ApiIncident }) => {
        const incoming = msg.data;
        setIncidents((prev) => {
          if (prev.some((i) => i.id === incoming.id)) return prev;
          return [incoming, ...prev];
        });
      });
      subscribed = true;
    } catch {
      // Ably not configured — poll every 15s as fallback
      const interval = setInterval(load, 15_000);
      return () => clearInterval(interval);
    }

    return () => {
      if (subscribed && channel) channel.unsubscribe();
    };
  }, [pinCode, userId, load]);

  const active   = incidents.filter((i) => i.status !== 'resolved');
  const resolved = incidents.filter((i) => i.status === 'resolved');
  const allItems = [...active, ...resolved];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <HStack gap={3} align="center" style={styles.header}>
        <ShieldCheck size={22} color={colors.brand[600]} />
        <Text variant="h3" style={{ color: colors.surface.heading, flex: 1 }}>Safety</Text>
        <Pressable
          onPress={() => router.push('/(safety)/alert-compose' as never)}
          style={styles.reportBtn}
          accessibilityRole="button"
        >
          <Plus size={16} color="#fff" />
          <Text variant="caption" style={{ color: '#fff', fontWeight: '700' }}>Report</Text>
        </Pressable>
      </HStack>

      {/* SOS Button */}
      <Pressable
        onPress={() => router.push('/(safety)/sos-active' as never)}
        style={styles.sosBtn}
        accessibilityRole="button"
        accessibilityLabel="Trigger SOS"
      >
        <AlertTriangle size={22} color="#fff" />
        <VStack gap={0.5}>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>SOS — I need help now</Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Alert neighbors within 500m</Text>
        </VStack>
      </Pressable>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={allItems}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onRefresh={load}
          refreshing={loading}
          ListHeaderComponent={
            active.length > 0 ? (
              <Text variant="caption" style={{ color: colors.semantic.danger, fontWeight: '700', paddingHorizontal: spacing[5], marginBottom: spacing[2] }}>
                {active.length} ACTIVE ALERT{active.length > 1 ? 'S' : ''}
              </Text>
            ) : (
              <HStack gap={2} align="center" style={styles.allClearBanner}>
                <ShieldCheck size={16} color={colors.semantic.success} />
                <Text variant="caption" style={{ color: colors.semantic.success, fontWeight: '600' }}>
                  All clear — no active safety incidents
                </Text>
              </HStack>
            )
          }
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: spacing[5], marginBottom: spacing[3] }}>
              <IncidentCard item={item} onPress={() => router.push(`/(safety)/incident/${item.id}` as never)} />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  header: {
    paddingHorizontal: spacing[5], paddingVertical: spacing[4],
    backgroundColor: colors.surface.background,
    borderBottomWidth: 0.5, borderBottomColor: colors.surface.border,
  },
  reportBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[1],
    backgroundColor: colors.brand[600],
    paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: 20,
  },
  sosBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[3],
    margin: spacing[4], marginBottom: spacing[2],
    backgroundColor: colors.semantic.danger,
    padding: spacing[4], borderRadius: 16,
    shadowColor: colors.semantic.danger,
    shadowOpacity: 0.4, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 5,
  },
  list: { paddingTop: spacing[3], paddingBottom: spacing[10] },
  card: { marginBottom: 0 },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  allClearBanner: {
    marginHorizontal: spacing[5], marginBottom: spacing[3],
    backgroundColor: '#DCFCE7', borderRadius: 10, padding: spacing[3],
  },
});
