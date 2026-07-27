import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, Plus } from 'lucide-react-native';
import { Card, HStack, Text, VStack } from '@/components/ui';
import { LockedFeatureCard } from '@/components/LockedFeatureCard';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type ApiPost = { id: string; body?: string; createdAt: string; author: { name: string }; tags: string[] };

// The Post/Reaction models are the only real backend primitives available for
// polls (there is no dedicated Poll/PollOption/Vote model in the schema).
// A poll post is created with up to 5 options embedded in its body text
// (see create-poll.tsx), which lines up exactly with the 5 fixed Reaction
// kinds — so we reuse POST/GET /api/mobile/posts/[id]/react, mapping
// option index -> reaction kind, as the real vote mechanism.
const OPTION_KINDS = ['like', 'love', 'thanks', 'support', 'concern'] as const;
type OptionKind = (typeof OPTION_KINDS)[number];

type ParsedPoll = { question: string; options: string[] };

function parsePoll(body: string | undefined): ParsedPoll {
  const text = body ?? '';
  const marker = '\n\nOptions:\n';
  const idx = text.indexOf(marker);
  if (idx === -1) return { question: text.trim(), options: [] };

  const question = text.slice(0, idx).trim();
  const rest = text.slice(idx + marker.length);
  const options: string[] = [];
  for (const line of rest.split('\n')) {
    const m = line.match(/^\s*\d+\.\s*(.+?)\s*$/);
    if (m) options.push(m[1]);
    else if (options.length > 0) break; // stop once we hit the "Expires:" line
  }
  return { question, options };
}

function PollCard({ post, userId }: { readonly post: ApiPost; readonly userId: string | null }) {
  const { question, options } = parsePoll(post.body);
  const [counts,   setCounts]   = useState<Partial<Record<OptionKind, number>>>({});
  const [own,      setOwn]      = useState<OptionKind | null>(null);
  const [selected, setSelected] = useState<OptionKind | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [voting,   setVoting]   = useState(false);

  const loadResults = useCallback(async () => {
    setLoading(true);
    try {
      const qs  = userId ? `?userId=${userId}` : '';
      const res = await fetch(`${BASE}/api/mobile/posts/${post.id}/react${qs}`);
      const data = await res.json();
      setCounts(data?.counts ?? {});
      setOwn((data?.own as OptionKind) ?? null);
    } catch {
      setCounts({});
      setOwn(null);
    } finally {
      setLoading(false);
    }
  }, [post.id, userId]);

  useEffect(() => { loadResults(); }, [loadResults]);

  async function submitVote() {
    if (!userId) { Alert.alert('Not logged in', 'Please complete onboarding first.'); return; }
    if (!selected) { Alert.alert('Select an option', 'Choose an option before voting.'); return; }
    setVoting(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/posts/${post.id}/react`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ userId, kind: selected }),
      });
      if (!res.ok) throw new Error('vote failed');
      await loadResults();
    } catch {
      Alert.alert('Error', 'Could not submit your vote. Please try again.');
    } finally {
      setVoting(false);
    }
  }

  const total = Object.values(counts).reduce((sum: number, c) => sum + (c ?? 0), 0);
  const hasVoted = own != null;

  return (
    <Card padding={4} elevation="sm">
      <VStack gap={2}>
        <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
          {question || 'Poll'}
        </Text>
        <HStack gap={2} align="center">
          <Text variant="caption" tone="secondary">by {post.author.name}</Text>
          <Text variant="caption" tone="secondary">
            {new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </Text>
        </HStack>

        {loading ? (
          <ActivityIndicator style={{ marginVertical: spacing[3] }} color={colors.brand[600]} />
        ) : (
          <VStack gap={2} style={{ marginTop: spacing[2] }}>
            {options.slice(0, OPTION_KINDS.length).map((label, i) => {
              const kind = OPTION_KINDS[i];
              const count = counts[kind] ?? 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const isOwn = own === kind;
              const isSelected = selected === kind;

              if (hasVoted) {
                return (
                  <View key={kind} style={[styles.optionRow, isOwn && styles.optionSelected]}>
                    <View style={[styles.optionBar, { width: `${pct}%` as `${number}%`, backgroundColor: isOwn ? colors.brand[100] : colors.gray[100] }]} />
                    <HStack gap={2} align="center" style={styles.optionContent}>
                      {isOwn && <Check size={14} color={colors.brand[600]} />}
                      <Text variant="body" style={{ flex: 1, color: colors.surface.heading, fontWeight: isOwn ? '700' : '400' }}>
                        {label}
                      </Text>
                      <Text variant="caption" style={{ fontWeight: '700', color: colors.surface.textSecondary }}>
                        {pct}% ({count})
                      </Text>
                    </HStack>
                  </View>
                );
              }

              return (
                <Pressable
                  key={kind}
                  onPress={() => setSelected(kind)}
                  style={[styles.optionRow, isSelected && styles.optionSelected]}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                >
                  <HStack gap={2.5} align="center" style={styles.optionContent}>
                    <View style={[styles.radio, isSelected && { borderColor: colors.brand[600] }]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                    <Text variant="body" style={{ color: colors.surface.heading }}>{label}</Text>
                  </HStack>
                </Pressable>
              );
            })}

            {!hasVoted && options.length > 0 && (
              <Pressable
                onPress={submitVote}
                disabled={voting || !selected}
                style={[styles.voteBtn, (voting || !selected) && { opacity: 0.5 }]}
                accessibilityRole="button"
              >
                {voting
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text variant="body" style={{ color: '#fff', fontWeight: '700' }}>Vote</Text>
                }
              </Pressable>
            )}

            {total > 0 && (
              <Text variant="caption" tone="secondary">{total} vote{total === 1 ? '' : 's'}</Text>
            )}
          </VStack>
        )}

        {post.tags.length > 0 && (
          <Text variant="caption" style={{ color: colors.brand[600] }}>{post.tags.join(' · ')}</Text>
        )}
      </VStack>
    </Card>
  );
}

export default function PollsScreen() {
  const router  = useRouter();
  const pinCode = useOnboardingStore((s) => s.pin);
  const societyId = useOnboardingStore((s) => s.societyId);
  const userId  = useWalletStore((s) => s.userId);
  const [items,   setItems]   = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!pinCode) { setLoading(false); return; }
    setLoading(true);
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res  = await fetch(`${BASE}/api/mobile/posts?pinCode=${pinCode}&type=poll&limit=30`, { signal: ctrl.signal });
      const data = await res.json();
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch { setItems([]); } finally { clearTimeout(to); setLoading(false); }
  }, [pinCode]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  if (!societyId) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <HStack gap={3} align="center" style={styles.topBar}>
          <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/explore')} style={styles.backBtn} accessibilityRole="button">
            <ArrowLeft size={20} color={colors.surface.heading} />
          </Pressable>
          <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Community Polls</Text>
        </HStack>
        <LockedFeatureCard
          title="Society feature"
          description="Map your community to participate in society polls and votes."
          ctaLabel="Map my community"
          onPress={() => router.push('/(community-setup)')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack gap={3} align="center" style={styles.topBar}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/explore')} style={styles.backBtn} accessibilityRole="button">
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Community Polls</Text>
        <Pressable
          onPress={() => router.push('/(community)/create-poll' as never)}
          style={styles.createBtn}
          accessibilityRole="button"
          accessibilityLabel="Create poll"
        >
          <Plus size={18} color="#fff" />
        </Pressable>
      </HStack>

      <FlatList
        data={items}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: spacing[4], gap: spacing[4], paddingBottom: spacing[16] }}
        ListEmptyComponent={
          <Text variant="body" tone="secondary" style={{ textAlign: 'center', marginTop: spacing[8] }}>No polls yet</Text>
        }
        renderItem={({ item }) => <PollCard post={item} userId={userId} />}
      />
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
  createBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.brand[600], alignItems: 'center', justifyContent: 'center',
  },
  optionRow: {
    borderRadius: 10, borderWidth: 1.5, borderColor: colors.surface.border,
    overflow: 'hidden', position: 'relative', minHeight: 44,
  },
  optionSelected: { borderColor: colors.brand[400] },
  optionBar: { position: 'absolute', top: 0, left: 0, bottom: 0, borderRadius: 8 },
  optionContent: { paddingHorizontal: spacing[3], paddingVertical: spacing[2.5], position: 'relative' },
  radio: {
    width: 16, height: 16, borderRadius: 8,
    borderWidth: 2, borderColor: colors.gray[300],
    alignItems: 'center', justifyContent: 'center',
  },
  radioDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brand[600],
  },
  voteBtn: {
    backgroundColor: colors.brand[600], borderRadius: radius.md,
    paddingVertical: spacing[2.5], alignItems: 'center', marginTop: spacing[1],
  },
});
