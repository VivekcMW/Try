import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Network, ShieldCheck, Users } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Avatar, Button, Card, HStack, Text, VStack } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { useVerificationStore } from '@/store/verificationStore';
import { colors, spacing } from '@lokul/ui-tokens';

// Try to import SVG — Expo includes react-native-svg by default
let Svg: React.ComponentType<any> | null = null;
let SvgCircle: React.ComponentType<any> | null = null;
let SvgLine: React.ComponentType<any> | null = null;
let SvgText: React.ComponentType<any> | null = null;
try {
  const svg = require('react-native-svg');
  Svg       = svg.Svg ?? svg.default;
  SvgCircle = svg.Circle;
  SvgLine   = svg.Line;
  SvgText   = svg.Text;
} catch { /* fallback */ }

type NeighbourEntry = {
  id: string;
  name: string;
  avatarUrl: string | null;
  alreadyVouched: boolean;
  /** how many this neighbour has vouched for, if returned */
  vouchedFor?: string[];
};

type VouchGraphNode = { id: string; name: string; x: number; y: number; isMe: boolean };
type VouchGraphEdge = { from: string; to: string };

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export default function VouchScreen() {
  const { t } = useTranslation(['onboarding', 'common']);
  const router = useRouter();
  const pin    = useOnboardingStore((s) => s.pin);
  const userId = useWalletStore((s) => s.userId);
  const tier   = useVerificationStore((s) => s.tier);

  const [tab,        setTab]       = useState<'list' | 'network'>('list');
  const [neighbours, setNeighbours] = useState<NeighbourEntry[]>([]);
  const [loading, setLoading]       = useState(true);
  const [vouching, setVouching]     = useState<string | null>(null);

  const fetchNeighbours = useCallback(async () => {
    setLoading(true);
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 8000);
    try {
      const params = new URLSearchParams({ pin });
      if (userId) params.set('requesterId', userId);
      const res = await fetch(`${BASE}/api/mobile/vouch?${params.toString()}`, { signal: ctrl.signal });
      if (res.ok) {
        const data = await res.json();
        setNeighbours(Array.isArray(data) ? data : []);
      }
    } catch {
      // Silently ignore; show empty state
    } finally {
      clearTimeout(to);
      setLoading(false);
    }
  }, [pin, userId]);

  useEffect(() => { void fetchNeighbours(); }, [fetchNeighbours]);

  const handleVouch = async (voucheeId: string) => {
    if (!userId || vouching) return;
    setVouching(voucheeId);
    try {
      const res = await fetch(`${BASE}/api/mobile/vouch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voucherId: userId, voucheeId }),
      });
      if (res.ok) {
        setNeighbours((prev) =>
          prev.map((n) => (n.id === voucheeId ? { ...n, alreadyVouched: true } : n))
        );
      }
    } catch { /* noop */ } finally { setVouching(null); }
  };

  const canVouch = tier === 'silver' || tier === 'gold';

  // Build graph nodes for network tab
  const graph = useMemo<{ nodes: VouchGraphNode[]; edges: VouchGraphEdge[] }>(() => {
    if (!userId || neighbours.length === 0) return { nodes: [], edges: [] };
    const W = 300; const H = 240; const CX = W / 2; const CY = H / 2;
    const count = Math.min(neighbours.length, 8);
    const nodes: VouchGraphNode[] = [{ id: userId, name: 'Me', x: CX, y: CY, isMe: true }];
    for (let i = 0; i < count; i++) {
      const angle = (2 * Math.PI * i) / count - Math.PI / 2;
      const dist  = 90;
      nodes.push({ id: neighbours[i].id, name: neighbours[i].name.split(' ')[0], x: CX + dist * Math.cos(angle), y: CY + dist * Math.sin(angle), isMe: false });
    }
    const edges: VouchGraphEdge[] = neighbours.slice(0, count)
      .filter((n) => n.alreadyVouched)
      .map((n) => ({ from: userId, to: n.id }));
    return { nodes, edges };
  }, [userId, neighbours]);

  const renderListContent = () => {
    if (!canVouch) {
      return (
        <Card padding={5} elevation="none" bordered style={styles.lockedCard}>
          <VStack gap={3} align="center">
            <ShieldCheck size={40} color={colors.surface.textSecondary} />
            <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
              Only Silver or Gold members can vouch for neighbours.
            </Text>
            <Button label="Get Silver Verified" variant="primary" size="sm"
              onPress={() => router.push('/(verification)/silver-proof')} />
          </VStack>
        </Card>
      );
    }
    if (loading) {
      return (
        <VStack gap={4} align="center" style={styles.emptyState}>
          <Text variant="body" tone="secondary">Loading neighbours…</Text>
        </VStack>
      );
    }
    if (neighbours.length === 0) {
      return (
        <VStack gap={4} align="center" style={styles.emptyState}>
          <Users size={48} color={colors.surface.textSecondary} strokeWidth={1.5} />
          <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
            {t('onboarding:vouch_no_nearby')}
          </Text>
        </VStack>
      );
    }
    return (
      <FlatList
        data={neighbours}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Card padding={4} elevation="sm" style={styles.card}>
            <HStack gap={3} align="center">
              <Avatar name={item.name} source={item.avatarUrl ? { uri: item.avatarUrl } : undefined} size="md" />
              <Text variant="body" style={{ flex: 1, color: colors.surface.heading }}>{item.name}</Text>
              <Button
                label={item.alreadyVouched ? t('onboarding:vouch_already') : t('onboarding:vouch_button')}
                variant={item.alreadyVouched ? 'secondary' : 'primary'}
                size="sm"
                disabled={item.alreadyVouched || vouching === item.id}
                loading={vouching === item.id}
                onPress={() => handleVouch(item.id)}
              />
            </HStack>
          </Card>
        )}
      />
    );
  };

  const renderNetworkContent = () => {
    if (!Svg || !SvgCircle || !SvgLine || !SvgText || graph.nodes.length === 0) {
      return (
        <VStack gap={3} align="center" style={styles.emptyState}>
          <Network size={40} color={colors.surface.textSecondary} />
          <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
            Vouch for neighbours to build your trust graph.
          </Text>
        </VStack>
      );
    }
    const W = 300; const H = 240;
    return (
      <View style={styles.graphContainer}>
        <Svg width={W} height={H}>
          {/* Edges */}
          {graph.edges.map((e) => {
            const from = graph.nodes.find((n) => n.id === e.from);
            const to   = graph.nodes.find((n) => n.id === e.to);
            if (!from || !to) return null;
            return (
              <SvgLine key={`${e.from}-${e.to}`}
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke={colors.brand[300]} strokeWidth={1.5} strokeDasharray="4,3" />
            );
          })}
          {/* Nodes */}
          {graph.nodes.map((n) => (
            <SvgCircle key={n.id} cx={n.x} cy={n.y}
              r={n.isMe ? 22 : 16}
              fill={n.isMe ? colors.brand[600] : colors.brand[100]}
              stroke={n.isMe ? colors.brand[700] : colors.brand[400]}
              strokeWidth={2} />
          ))}
          {/* Labels */}
          {graph.nodes.map((n) => (
            <SvgText key={`lbl_${n.id}`} x={n.x} y={n.isMe ? n.y + 36 : n.y + 28}
              textAnchor="middle" fontSize={10} fill={colors.surface.textSecondary}>
              {n.name}
            </SvgText>
          ))}
        </Svg>
        <Text variant="caption" tone="secondary" style={{ textAlign: 'center', marginTop: spacing[2] }}>
          {graph.edges.length} vouch{graph.edges.length !== 1 ? 'es' : ''} given · {neighbours.length} neighbours
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <VStack gap={0} style={styles.container}>
        {/* Header */}
        <HStack gap={3} align="center" style={styles.header}>
          <View style={styles.headerIcon}><ShieldCheck size={24} color={colors.brand[600]} /></View>
          <VStack gap={0.5} style={{ flex: 1 }}>
            <Text variant="h3">{t('onboarding:vouch_title')}</Text>
            <Text variant="caption" tone="secondary">{t('onboarding:vouch_subtitle')}</Text>
          </VStack>
        </HStack>

        {/* Tab bar */}
        <HStack gap={0} style={styles.tabBar}>
          <Pressable onPress={() => setTab('list')} style={[styles.tabBtn, tab === 'list' && styles.tabActive]}>
            <Users size={14} color={tab === 'list' ? colors.brand[600] : colors.surface.textSecondary} />
            <Text variant="caption" style={{ fontWeight: '700', color: tab === 'list' ? colors.brand[600] : colors.surface.textSecondary }}>Neighbours</Text>
          </Pressable>
          <Pressable onPress={() => setTab('network')} style={[styles.tabBtn, tab === 'network' && styles.tabActive]}>
            <Network size={14} color={tab === 'network' ? colors.brand[600] : colors.surface.textSecondary} />
            <Text variant="caption" style={{ fontWeight: '700', color: tab === 'network' ? colors.brand[600] : colors.surface.textSecondary }}>Trust Graph</Text>
          </Pressable>
        </HStack>

        {tab === 'list' ? renderListContent() : renderNetworkContent()}
      </VStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: colors.surface.background },
  container: { flex: 1 },
  header: {
    paddingHorizontal: spacing[5], paddingVertical: spacing[4],
    borderBottomWidth: 1, borderBottomColor: colors.surface.border,
  },
  headerIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.brand[50], alignItems: 'center', justifyContent: 'center',
  },
  tabBar: {
    borderBottomWidth: 1, borderBottomColor: colors.surface.border,
    backgroundColor: colors.surface.background,
  },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing[1.5], paddingVertical: spacing[3],
  },
  tabActive: {
    borderBottomWidth: 2, borderBottomColor: colors.brand[600],
  },
  listContent: { padding: spacing[4], gap: spacing[3] },
  card:        { marginBottom: spacing[3] },
  emptyState:  { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing[8] },
  lockedCard:  { margin: spacing[5] },
  graphContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[4],
  },
});
