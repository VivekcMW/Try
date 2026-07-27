// PRD §03 — Discover communities (real API)
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Lock, Plus, Search, Users } from 'lucide-react-native';
import { Badge, Button, Card, HStack, Text, VStack } from '@/components/ui';
import { COMMUNITY_CATEGORY_META, useCommunityStore, type CommunityCategory } from '@/store/communityStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';
const CATS: (CommunityCategory | 'all')[] = ['all', 'sports', 'parenting', 'pets', 'fitness', 'hobby', 'civic', 'business', 'spiritual', 'youth'];

type ApiCommunity = {
  id: string; name: string; type: string; joinPolicy: string;
  memberCount: number; description: string | null; coverUrl: string | null;
  pinCode: string;
};

export default function Discover() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<CommunityCategory | 'all'>('all');
  const [items, setItems] = useState<ApiCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const joinedIds = useCommunityStore((s) => s.joinedIds);
  const join = useCommunityStore((s) => s.joinCommunity);
  const leave = useCommunityStore((s) => s.leaveCommunity);
  const pinCode = useOnboardingStore((s) => s.pin);
  const userId  = useWalletStore((s) => s.userId);

  const load = useCallback(async () => {
    if (!pinCode) return;
    setLoading(true);
    try {
      const url = `${BASE}/api/mobile/communities?pinCode=${pinCode}${userId ? `&userId=${userId}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      setItems(data.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [pinCode, userId]);

  useEffect(() => { load(); }, [load]);

  async function handleJoin(communityId: string, joinPolicy: string) {
    if (!userId) return;
    join(communityId);
    await fetch(`${BASE}/api/mobile/communities/${communityId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
  }

  async function handleLeave(communityId: string) {
    if (!userId) return;
    leave(communityId);
    await fetch(`${BASE}/api/mobile/communities/${communityId}/join`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
  }

  const filtered = useMemo(() => {
    return items.filter((c) => {
      if (cat !== 'all' && c.type !== cat) return false;
      if (q && !c.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [items, q, cat]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>Communities</Text>
        <Pressable onPress={() => router.push('/(groups)/create' as never)} hitSlop={10} style={styles.iconBtn}>
          <Plus size={22} color={colors.brand[700]} />
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <Search size={16} color={colors.surface.textSecondary} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search communities"
          placeholderTextColor={colors.surface.textSecondary}
          style={styles.search}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips} contentContainerStyle={{ paddingHorizontal: spacing[3], gap: spacing[2] }}>
        {CATS.map((c) => {
          const active = cat === c;
          const meta = c === 'all' ? null : COMMUNITY_CATEGORY_META[c];
          return (
            <Pressable
              key={c}
              onPress={() => setCat(c)}
              style={[styles.chip, active && { backgroundColor: meta ? meta.tint + '1A' : colors.brand[50], borderColor: meta ? meta.tint : colors.brand[400] }]}
            >
              <Text variant="caption" style={{ fontWeight: '700', color: active ? meta?.tint ?? colors.brand[700] : colors.surface.textSecondary }}>
                {meta ? `${meta.emoji} ${meta.label}` : 'All'}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.brand[600]} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <VStack gap={3}>
            {filtered.map((c) => {
              const joined = joinedIds.includes(c.id);
              return (
                <Pressable key={c.id} onPress={() => router.push(`/(groups)/home/${c.id}` as never)}>
                  <Card padding={0} elevation="xs" bordered style={{ overflow: 'hidden' }}>
                    <View style={{ height: 56, backgroundColor: colors.brand[100], justifyContent: 'flex-end', padding: spacing[3] }}>
                      <HStack gap={2} align="center" style={{ justifyContent: 'space-between' }}>
                        <Badge label={c.type.toUpperCase()} tone="neutral" />
                        {c.joinPolicy === 'invite_only' && <Badge label="INVITE ONLY" tone="warning" />}
                        {c.joinPolicy === 'request' && <Badge label="REQUEST" tone="info" />}
                      </HStack>
                    </View>
                    <View style={{ padding: spacing[4] }}>
                      <VStack gap={1}>
                        <Text variant="body" style={{ fontWeight: '800' }}>{c.name}</Text>
                        <HStack gap={1.5} align="center">
                          <Users size={12} color={colors.surface.textSecondary} />
                          <Text variant="caption" tone="secondary">{c.memberCount.toLocaleString('en-IN')} members</Text>
                        </HStack>
                      </VStack>
                      {c.description && (
                        <Text variant="caption" tone="secondary" style={{ marginTop: spacing[2] }}>{c.description}</Text>
                      )}
                      <View style={{ marginTop: spacing[3] }}>
                        {c.joinPolicy === 'invite_only' ? (
                          <Button label="Invite only" leftIcon={<Lock size={14} color="#fff" />} disabled fullWidth />
                        ) : joined ? (
                          <Button label="Leave" variant="secondary" onPress={() => handleLeave(c.id)} fullWidth />
                        ) : (
                          <Button label={c.joinPolicy === 'request' ? 'Request to join' : 'Join'} onPress={() => handleJoin(c.id, c.joinPolicy)} fullWidth />
                        )}
                      </View>
                    </View>
                  </Card>
                </Pressable>
              );
            })}
          </VStack>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.surface.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surface.border,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[3],
    marginHorizontal: spacing[4],
    marginTop: spacing[3],
    backgroundColor: colors.surface.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  search: { flex: 1, height: 40, color: colors.surface.foreground },
  chips: { flexGrow: 0, marginTop: spacing[3] },
  chip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.background,
  },
  scroll: { padding: spacing[4], paddingBottom: spacing[10] },
  logo: { width: 52, height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
