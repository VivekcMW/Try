import { useMemo, useState, useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Building2,
  Edit3,
  Hash,
  MessageCircle,
  Pin,
  Search,
  User,
  Users,
  VolumeX,
  type LucideIcon,
} from 'lucide-react-native';
import { type ChatThread } from '@/data/chat-seed';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

// ─── Layout constants (deterministic) ────────────────────────
const PAD_X = 16;
const AVATAR_SIZE = 36;
const ROW_GAP = 12;
const ROW_HEIGHT = 60;

type FilterKey = 'all' | 'unread' | 'groups' | 'dms';
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'groups', label: 'Groups' },
  { key: 'dms', label: 'Direct' },
];

// ─── Thread-type icon / palette ─────────────────────────────
const TYPE_ICONS: Record<
  ChatThread['type'],
  { Icon: LucideIcon; bg: string; fg: string }
> = {
  society_main: { Icon: Building2, bg: colors.brand[50], fg: colors.brand[600] },
  tower: { Icon: Users, bg: colors.accent[50] ?? '#FFF7ED', fg: colors.accent[600] },
  topic: { Icon: Hash, bg: '#ECFDF5', fg: colors.semantic.success },
  dm: { Icon: User, bg: colors.surface.surfaceMuted, fg: colors.gray[600] },
};

// ─── Timestamp formatter (WhatsApp-style) ────────────────────
function formatStamp(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    let h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
  }
  const yest = new Date(now);
  yest.setDate(now.getDate() - 1);
  if (
    d.getFullYear() === yest.getFullYear() &&
    d.getMonth() === yest.getMonth() &&
    d.getDate() === yest.getDate()
  ) {
    return 'Yesterday';
  }
  const diffDays = Math.floor((now.getTime() - ts) / (24 * 60 * 60_000));
  if (diffDays < 7) {
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  }
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

// ─── Right-side indicator: badge | pin | mute | empty ────────
function MetaIndicator({ item }: Readonly<{ item: ChatThread }>) {
  if (item.unreadCount > 0) {
    return (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{item.unreadCount}</Text>
      </View>
    );
  }
  if (item.muted) return <VolumeX size={14} color={colors.gray[400]} />;
  if (item.pinned)
    return <Pin size={13} color={colors.gray[400]} fill={colors.gray[400]} />;
  return <View style={styles.indicatorPlaceholder} />;
}

// ─── Thread row ──────────────────────────────────────────────
function ThreadRow({
  item,
  onPress,
}: Readonly<{ item: ChatThread; onPress: () => void }>) {
  const unread = item.unreadCount > 0;
  const { Icon, bg, fg } = TYPE_ICONS[item.type];
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: colors.surface.surfaceMuted }}
      style={({ pressed }) =>
        pressed ? { backgroundColor: colors.surface.surfaceMuted } : undefined
      }
    >
      <View style={styles.row}>
        <View style={[styles.avatarSlot, { backgroundColor: bg }]}>
          <Icon size={16} color={fg} strokeWidth={2.2} />
        </View>

        <View style={styles.middle}>
          <Text
            numberOfLines={1}
            style={[styles.name, { fontWeight: unread ? '600' : '500' }]}
          >
            {item.name}
          </Text>
        </View>

        <Text
          style={[
            styles.time,
            {
              color: unread ? colors.brand[600] : colors.gray[500],
              fontWeight: unread ? '600' : '500',
            },
          ]}
        >
          {formatStamp(item.lastMessageAt)}
        </Text>
        <View style={styles.metaIndicator}>
          <MetaIndicator item={item} />
        </View>
      </View>
    </Pressable>
  );
}

// ─── Screen ──────────────────────────────────────────────────
export default function ChatsScreen() {
  const router  = useRouter();
  const userId  = useWalletStore((s) => s.userId);
  const [threads,  setThreads]  = useState<ChatThread[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/api/mobile/chat/threads?userId=${userId}`);
      const data = await res.json();
      const items = (data.items ?? []) as Array<{
        id: string; type: string; name: string | null; avatarUrl: string | null;
        memberCount: number; unreadCount: number; lastMessageAt: string | null;
        lastMessage: { body: string; senderName: string } | null;
      }>;
      setThreads(items.map((t) => ({
        id:            t.id,
        type:          (t.type as ChatThread['type']) ?? 'dm',
        name:          t.name ?? 'Chat',
        avatarUri:     t.avatarUrl ?? null,
        memberCount:   t.memberCount,
        lastMessage:   t.lastMessage ? `${t.lastMessage.senderName}: ${t.lastMessage.body}` : '',
        lastMessageAt: t.lastMessageAt ? new Date(t.lastMessageAt).getTime() : Date.now(),
        unreadCount:   t.unreadCount ?? 0,
        muted:         false,
        pinned:        false,
      })));
    } catch {
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let list = [...threads];
    if (filter === 'unread') list = list.filter((t) => t.unreadCount > 0);
    else if (filter === 'groups') list = list.filter((t) => t.type !== 'dm');
    else if (filter === 'dms') list = list.filter((t) => t.type === 'dm');

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.lastMessage.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.lastMessageAt - a.lastMessageAt;
    });
    return list;
  }, [filter, query, threads]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']} testID="chats-screen">
      {/* ── Sticky header (outside ScrollView) ───────────── */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Chats</Text>
          <Pressable
            style={styles.headerBtn}
            accessibilityRole="button"
            accessibilityLabel="New chat"
            hitSlop={8}
            onPress={() => router.push('/(chat)/new-dm' as never)}
          >
            <Edit3 size={20} color={colors.surface.heading} strokeWidth={2} />
          </Pressable>
        </View>

        <View style={styles.searchWrap}>
          <Search size={18} color={colors.surface.textSecondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search"
            placeholderTextColor={colors.surface.textSecondary}
            style={styles.searchInput}
            returnKeyType="search"
          />
        </View>

        <View style={styles.chipRow}>
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    { color: active ? '#fff' : colors.gray[700] },
                  ]}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* ── Scrollable list ──────────────────────────────── */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <MessageCircle size={28} color={colors.brand[600]} />
          </View>
          <Text style={styles.emptyTitle}>No chats</Text>
          <Text style={styles.emptySub}>
            {query
              ? 'Try a different search'
              : 'Start a conversation with a neighbour'}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filtered.map((thread, idx) => (
            <View key={thread.id}>
              <ThreadRow
                item={thread}
                onPress={() =>
                  router.push(`/(chat)/thread/${thread.id}` as never)
                }
              />
              {idx < filtered.length - 1 ? <View style={styles.sep} /> : null}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.background },

  // Header ─────────────────────────────────────────────────
  header: {
    backgroundColor: colors.surface.background,
    paddingHorizontal: PAD_X,
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surface.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    marginBottom: spacing[3],
  },
  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    color: colors.surface.heading,
    letterSpacing: -0.5,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2.5],
    backgroundColor: colors.surface.surfaceMuted,
    borderRadius: radius.full,
    paddingHorizontal: spacing[4],
    height: 40,
    marginBottom: spacing[3],
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.surface.foreground,
    padding: 0,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing[2.5],
  },
  chip: {
    paddingHorizontal: spacing[3],
    height: 30,
    borderRadius: radius.full,
    backgroundColor: colors.surface.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: colors.brand[600] },
  chipLabel: { fontSize: 13, fontWeight: '600' },

  // List ───────────────────────────────────────────────────
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing[8] },

  // Row ────────────────────────────────────────────────────
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: ROW_HEIGHT,
    paddingHorizontal: PAD_X,
    paddingVertical: spacing[3],
  },
  avatarSlot: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    marginRight: ROW_GAP,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middle: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  name: {
    fontSize: 15,
    lineHeight: 19,
    color: colors.surface.heading,
  },
  preview: {
    fontSize: 13,
    lineHeight: 17,
    color: colors.gray[500],
  },

  // Meta (inline) ──────────────────────────────────────────
  metaIndicator: {
    marginLeft: spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: {
    fontSize: 11,
    marginLeft: spacing[2],
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.brand[600],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  indicatorPlaceholder: { height: 20, width: 20 },

  // Separator ──────────────────────────────────────────────
  sep: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.surface.border,
    marginLeft: PAD_X + AVATAR_SIZE + ROW_GAP,
  },

  // Empty ──────────────────────────────────────────────────
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[16],
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface.heading,
    marginTop: spacing[3],
  },
  emptySub: {
    fontSize: 13,
    color: colors.surface.textSecondary,
    marginTop: spacing[1],
  },
});
