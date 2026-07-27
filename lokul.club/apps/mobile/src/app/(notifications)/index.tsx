// PRD §08 — Notification inbox
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, BellOff, CheckCheck, Sparkles } from 'lucide-react-native';
import { Badge, Card, HStack, Text, VStack } from '@/components/ui';
import { useNotificationStore, CATEGORY_META, type NotifCategory, type Notification } from '@/store/notificationStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const FILTERS: { v: NotifCategory | 'all'; label: string }[] = [
  { v: 'all', label: 'All' },
  { v: 'safety', label: 'Safety' },
  { v: 'community', label: 'Community' },
  { v: 'peer', label: 'Peer' },
  { v: 'business', label: 'Business' },
  { v: 'groupbuy', label: 'Group buy' },
  { v: 'wallet', label: 'Wallet' },
];

export default function NotificationsInbox() {
  const router = useRouter();
  const userId = useWalletStore((s) => s.userId);
  const { inbox, markRead, markAllRead, push } = useNotificationStore();
  const [f, setF] = useState<NotifCategory | 'all'>('all');

  // JIT push-notification permission — request when user first opens the inbox
  useEffect(() => {
    (async () => {
      try {
        // Dynamically import to avoid crash when expo-notifications is not linked
        // @ts-expect-error: expo-notifications is optional
        const Notifications = await import('expo-notifications').catch(() => null);
        if (Notifications) {
          await Notifications.requestPermissionsAsync();
        }
      } catch {
        // Continue even if permission request fails
      }
    })();
  }, []);

  // Sync derived notifications from API on mount
  useEffect(() => {
    if (!userId) return;
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 8000);
    (async () => {
      try {
        const res  = await fetch(`${BASE}/api/mobile/notifications?userId=${userId}`, { signal: ctrl.signal });
        const data = await res.json();
        const existing = new Set(useNotificationStore.getState().inbox.map((n) => n.id));
        const list = Array.isArray(data?.items) ? data.items : Array.isArray(data?.notifications) ? data.notifications : [];
        for (const n of list) {
          if (!existing.has(n.id)) push({ category: n.category ?? 'community', title: n.title, body: n.body });
        }
      } catch {}
      finally { clearTimeout(to); }
    })();
    return () => { clearTimeout(to); ctrl.abort(); };
  }, [userId]);

  const filtered = useMemo(
    () => (f === 'all' ? inbox : inbox.filter((n) => n.category === f)),
    [inbox, f],
  );
  const unreadCount = inbox.filter((n) => !n.read).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/explore')} hitSlop={10} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <VStack gap={0}>
          <Text variant="h3" style={{ fontWeight: '700' }}>Notifications</Text>
          {unreadCount > 0 && <Text variant="caption" tone="secondary">{unreadCount} unread</Text>}
        </VStack>
        <Pressable onPress={markAllRead} hitSlop={10} style={styles.iconBtn}>
          <CheckCheck size={20} color={colors.brand[700]} />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips} contentContainerStyle={{ paddingHorizontal: spacing[3], gap: spacing[2] }}>
        {FILTERS.map((x) => {
          const a = f === x.v;
          return (
            <Pressable key={x.v} onPress={() => setF(x.v)} style={[styles.chip, a && styles.chipActive]}>
              <Text variant="caption" style={{ fontWeight: '700', color: a ? colors.brand[700] : colors.surface.textSecondary }}>{x.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable onPress={() => router.push('/(notifications)/digest' as never)}>
          <Card padding={4} elevation="none" bordered style={{ backgroundColor: colors.brand[50], borderColor: colors.brand[200] }}>
            <HStack gap={3} align="center">
              <View style={styles.digestRing}>
                <Sparkles size={18} color={colors.brand[700]} />
              </View>
              <VStack gap={0.5} style={{ flex: 1 }}>
                <Text variant="body" style={{ fontWeight: '700' }}>Daily digest</Text>
                <Text variant="caption" tone="secondary">A calm summary of what happened around you today.</Text>
              </VStack>
            </HStack>
          </Card>
        </Pressable>

        <VStack gap={2} style={{ marginTop: spacing[3] }}>
          {filtered.map((n) => <Row key={n.id} n={n} onPress={() => { markRead(n.id); if (n.cta) router.push(n.cta.href as never); }} />)}
          {filtered.length === 0 && (
            <VStack gap={3} align="center" style={{ padding: spacing[10] }}>
              <BellOff size={32} color={colors.surface.textSecondary} />
              <Text variant="body" tone="secondary">You’re all caught up</Text>
            </VStack>
          )}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ n, onPress }: { readonly n: Notification; readonly onPress: () => void }) {
  const meta = CATEGORY_META[n.category];
  return (
    <Pressable onPress={onPress}>
      <Card padding={3.5} elevation="none" bordered style={!n.read ? { backgroundColor: colors.brand[50], borderColor: colors.brand[200] } : undefined}>
        <HStack gap={3} align="center">
          <View style={[styles.dot, { backgroundColor: meta.tint + '22' }]}>
            <Text style={{ fontSize: 18 }}>{n.emoji ?? '🔔'}</Text>
            {!n.read && <View style={[styles.unreadDot, { backgroundColor: meta.tint }]} />}
          </View>
          <VStack gap={0.5} style={{ flex: 1 }}>
            <HStack gap={2} align="center" style={{ justifyContent: 'space-between' }}>
              <Text variant="body" style={{ fontWeight: n.read ? '600' : '800', flex: 1 }} numberOfLines={1}>{n.title}</Text>
              <Text variant="caption" tone="secondary">{ago(n.ts)}</Text>
            </HStack>
            <Text variant="caption" tone="secondary" numberOfLines={2}>{n.body}</Text>
            <HStack gap={2} align="center" style={{ marginTop: spacing[1.5] }}>
              <Badge label={meta.label.toUpperCase()} tone="neutral" size="sm" />
              {n.cta && <Text variant="caption" style={{ color: colors.brand[700], fontWeight: '700' }}>{n.cta.label} →</Text>}
            </HStack>
          </VStack>
        </HStack>
      </Card>
    </Pressable>
  );
}

function ago(ts: number) {
  const d = Date.now() - ts;
  if (d < 60000) return 'just now';
  if (d < 3600000) return `${Math.floor(d / 60000)}m`;
  if (d < 86400000) return `${Math.floor(d / 3600000)}h`;
  return `${Math.floor(d / 86400000)}d`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    backgroundColor: colors.surface.background,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.surface.border,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  chips: {
    flexGrow: 0,
    backgroundColor: colors.surface.background,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.surface.border,
    paddingVertical: spacing[2],
  },
  chip: { paddingHorizontal: spacing[3], paddingVertical: spacing[1.5], borderRadius: radius.full, backgroundColor: colors.gray[100] },
  chipActive: { backgroundColor: colors.brand[50] },
  scroll: { padding: spacing[4], paddingBottom: spacing[10] },
  dot: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  unreadDot: { position: 'absolute', top: 0, right: 0, width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: '#fff' },
  digestRing: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.brand[100], alignItems: 'center', justifyContent: 'center' },
});
