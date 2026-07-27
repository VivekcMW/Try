import { useCallback, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useState } from 'react';
import { HStack, Text, VStack } from '@/components/ui';
import { colors, spacing } from '@lokul/ui-tokens';
import { useWalletStore } from '@/store/walletStore';

type NotifGroup = {
  title: string;
  items: { id: string; label: string; subtitle: string; defaultOn: boolean }[];
};

const GROUPS: NotifGroup[] = [
  {
    title: 'Safety & SOS',
    items: [
      { id: 'sos_alerts', label: 'SOS Alerts', subtitle: 'Emergency alerts from your society', defaultOn: true },
      { id: 'safety_incidents', label: 'Safety Incidents', subtitle: 'High/medium severity incidents', defaultOn: true },
    ],
  },
  {
    title: 'Feed & Posts',
    items: [
      { id: 'feed_reactions', label: 'Reactions on your posts', subtitle: 'When someone reacts to your post', defaultOn: true },
      { id: 'feed_comments', label: 'Comments', subtitle: 'New comments on your posts', defaultOn: true },
      { id: 'feed_mentions', label: 'Mentions', subtitle: 'When someone tags you', defaultOn: true },
    ],
  },
  {
    title: 'Chat & Messages',
    items: [
      { id: 'chat_dm', label: 'Direct Messages', subtitle: 'New DMs from residents', defaultOn: true },
      { id: 'chat_groups', label: 'Group Messages', subtitle: 'Society and tower group chats', defaultOn: false },
    ],
  },
  {
    title: 'Community',
    items: [
      { id: 'events', label: 'Event Reminders', subtitle: 'Upcoming events you RSVPd to', defaultOn: true },
      { id: 'polls', label: 'New Polls', subtitle: 'When RWA posts a poll', defaultOn: true },
      { id: 'notices', label: 'RWA Notices', subtitle: 'Official notices from your RWA', defaultOn: true },
      { id: 'visitors', label: 'Visitor Arrivals', subtitle: 'When your expected visitor arrives', defaultOn: true },
    ],
  },
];

export default function NotificationsSettingsScreen() {
  const router = useRouter();
  const userId = useWalletStore((s) => s.userId);

  const allItems = GROUPS.flatMap((g) => g.items);
  const [settings, setSettings] = useState<Record<string, boolean>>(
    Object.fromEntries(allItems.map((i) => [i.id, i.defaultOn]))
  );

  // Debounce-style: persist after user stops toggling for 1.5s
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = useCallback(
    (next: Record<string, boolean>) => {
      if (!userId) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try {
          const base = process.env.EXPO_PUBLIC_API_BASE ?? '';
          await fetch(`${base}/api/mobile/users/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationPrefs: next }),
          });
        } catch {
          // ignore — preference will be re-sent on next toggle
        }
      }, 1500);
    },
    [userId]
  );

  const handleToggle = (id: string, v: boolean) => {
    setSettings((prev) => {
      const next = { ...prev, [id]: v };
      persist(next);
      return next;
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack gap={3} align="center" style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Notification Preferences</Text>
      </HStack>

      <ScrollView contentContainerStyle={{ padding: spacing[4], gap: spacing[5], paddingBottom: spacing[16] }}>
        {GROUPS.map((group) => (
          <VStack key={group.title} gap={0}>
            <Text variant="caption" style={{ fontWeight: '700', color: colors.gray[500], marginBottom: spacing[2], paddingHorizontal: spacing[1] }}>
              {group.title.toUpperCase()}
            </Text>
            <VStack gap={0} style={styles.card}>
              {group.items.map((item, i) => (
                <HStack
                  key={item.id}
                  gap={3}
                  align="center"
                  style={StyleSheet.flatten([styles.row, i < group.items.length - 1 ? styles.rowBorder : undefined])}
                >
                  <VStack gap={0.5} style={{ flex: 1 }}>
                    <Text variant="body" style={{ fontWeight: '600', color: colors.surface.heading }}>
                      {item.label}
                    </Text>
                    <Text variant="caption" tone="secondary">{item.subtitle}</Text>
                  </VStack>
                  <Switch
                    value={settings[item.id]}
                    onValueChange={(v) => handleToggle(item.id, v)}
                    trackColor={{ false: colors.gray[200], true: colors.brand[400] }}
                    thumbColor={settings[item.id] ? colors.brand[600] : colors.gray[400]}
                  />
                </HStack>
              ))}
            </VStack>
          </VStack>
        ))}
      </ScrollView>
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
  card: {
    backgroundColor: colors.surface.background, borderRadius: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  row: { paddingHorizontal: spacing[4], paddingVertical: spacing[4] },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: colors.surface.border },
});
