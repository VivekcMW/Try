import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Building2, Check, CheckCheck, Hash, Phone, Send, User, Users, Video } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, HStack, Text, VStack } from '@/components/ui';
import { CHAT_THREADS, relativeTime, ThreadType } from '@/data/chat-seed';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { getAblyClient } from '@/lib/ably';
import { colors, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type ApiMessage = {
  id: string; threadId: string; senderId: string; body: string;
  kind: string; createdAt: string;
  sender: { id: string; name: string };
};

type IconDef = { Icon: typeof Building2; bg: string; fg: string };
const TYPE_ICONS: Record<ThreadType, IconDef> = {
  society_main: { Icon: Building2, bg: colors.brand[50],  fg: colors.brand[600] },
  tower:         { Icon: Users,     bg: '#FFF7ED',         fg: colors.accent?.[600] ?? '#EA580C' },
  topic:         { Icon: Hash,      bg: '#ECFDF5',         fg: colors.semantic?.success ?? '#059669' },
  dm:            { Icon: User,      bg: colors.gray[100],  fg: colors.gray[600] },
};

type RealThread = {
  id: string;
  type: string;
  name: string | null;
  memberCount: number;
  members: { id: string; name: string }[];
};

export default function ThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const userId  = useWalletStore((s) => s.userId);
  const seedThread = CHAT_THREADS.find((t) => t.id === id);
  const [realThread, setRealThread] = useState<RealThread | null>(null);
  const [messages,  setMessages]  = useState<ApiMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList<ApiMessage>>(null);

  // Real threads (created e.g. via new-dm.tsx) have a server-generated id that never
  // matches the small hardcoded CHAT_THREADS seed list. Fetch the real thread list
  // (same endpoint new-dm.tsx posts to) and find this one, so the header shows the
  // real recipient/group name instead of falling back to a generic "Chat" label.
  useEffect(() => {
    if (!id || !userId) return;
    fetch(`${BASE}/api/mobile/chat/threads?userId=${userId}`)
      .then((r) => r.json())
      .then((data) => {
        const found = (data.items ?? []).find((t: RealThread) => t.id === id);
        if (found) setRealThread(found);
      })
      .catch(() => { /* fall back to seed list below */ });
  }, [id, userId]);

  const otherMember = realThread?.type === 'dm'
    ? realThread.members?.find((m) => m.id !== userId)
    : undefined;

  const thread = realThread
    ? { name: realThread.name ?? otherMember?.name ?? seedThread?.name ?? 'Chat', type: realThread.type, memberCount: realThread.memberCount }
    : seedThread;

  // ── Initial load of message history ────────────────────────────────────────
  const load = useCallback(async () => {
    if (!id) return;
    try {
      const res  = await fetch(`${BASE}/api/mobile/chat/${id}/messages`);
      const data = await res.json();
      setMessages(data.items ?? []);
    } catch { /* noop */ }
  }, [id]);

  // ── Ably real-time subscription ─────────────────────────────────────────────
  useEffect(() => {
    if (!id || !userId) return;
    load();

    let channel: ReturnType<ReturnType<typeof getAblyClient>['channels']['get']> | null = null;
    let subscribed = false;

    try {
      const client  = getAblyClient(userId);
      channel = client.channels.get(`chat:${id}`);
      channel.subscribe('message', (msg) => {
        const payload = msg.data as ApiMessage;
        setMessages((prev) => {
          // Deduplicate by id
          if (prev.some((m) => m.id === payload.id)) return prev;
          return [...prev, payload];
        });
        // Scroll to bottom
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
      });
      subscribed = true;
    } catch {
      // Ably not configured — fall back to polling every 5s
      const interval = setInterval(load, 5_000);
      return () => clearInterval(interval);
    }

    // Mark thread as read
    fetch(`${BASE}/api/mobile/chat/${id}/messages`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    }).catch(() => {});

    return () => {
      if (subscribed && channel) channel.unsubscribe();
    };
  }, [id, userId, load]);

  const handleSend = async () => {
    if (!text.trim() || !userId) return;
    setSending(true);
    try {
      await fetch(`${BASE}/api/mobile/chat/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: userId, body: text.trim() }),
      });
      setText('');
      // Ably will push the message back; no need to re-fetch
    } catch { /* noop */ } finally { setSending(false); }
  };

  const threadName  = thread?.name ?? 'Chat';
  const threadType  = (thread?.type as ThreadType) ?? 'dm';
  const memberCount = thread?.memberCount;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <HStack gap={3} align="center" style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        {(() => {
          const { Icon, bg, fg } = TYPE_ICONS[threadType] ?? TYPE_ICONS.dm;
          return (
            <View style={[styles.threadIcon, { backgroundColor: bg }]}>
              <Icon size={16} color={fg} strokeWidth={2} />
            </View>
          );
        })()}
        <VStack gap={0} style={{ flex: 1 }}>
          <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
            {threadName}
          </Text>
          {memberCount != null && (
            <Text variant="caption" tone="secondary">{memberCount} members</Text>
          )}
        </VStack>
        <Pressable
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Voice call"
          onPress={() =>
            router.push({
              pathname: '/(chat)/call',
              params: { threadId: id, callType: 'audio', name: threadName },
            } as never)
          }
        >
          <Phone size={18} color={colors.brand[600]} />
        </Pressable>
        <Pressable
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Video call"
          onPress={() =>
            router.push({
              pathname: '/(chat)/call',
              params: { threadId: id, callType: 'video', name: threadName },
            } as never)
          }
        >
          <Video size={18} color={colors.brand[600]} />
        </Pressable>
      </HStack>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => {
          const isMe = item.senderId === userId;
          return (
            <View style={[styles.msgRow, isMe ? styles.msgRowMe : undefined]}>
              {!isMe && <Avatar name={item.sender.name} size="xs" />}
              <VStack gap={0.5} style={StyleSheet.flatten([styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem])}>
                {!isMe && threadType !== 'dm' && (
                  <Text variant="caption" style={{ fontWeight: '700', color: colors.brand[600] }}>
                    {item.sender.name}
                  </Text>
                )}
                <Text variant="body" style={{ color: isMe ? '#fff' : colors.surface.heading, lineHeight: 20 }}>
                  {item.body}
                </Text>
                <HStack gap={1} style={{ justifyContent: 'flex-end', alignItems: 'center' }}>
                  <Text variant="caption" style={{ color: isMe ? 'rgba(255,255,255,0.7)' : colors.surface.textSecondary }}>
                    {relativeTime(new Date(item.createdAt).getTime())}
                  </Text>
                  {isMe && <CheckCheck size={11} color="rgba(255,255,255,0.7)" />}
                  {!isMe && <Check size={11} color={colors.surface.textSecondary} />}
                </HStack>
              </VStack>
            </View>
          );
        }}
      />

      {/* Input bar */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message…"
          placeholderTextColor={colors.surface.textSecondary}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={2000}
        />
        <Pressable
          onPress={handleSend}
          style={[styles.sendBtn, { opacity: text.trim() && !sending ? 1 : 0.4 }]}
          disabled={!text.trim() || sending}
          accessibilityRole="button"
        >
          <Send size={16} color="#fff" />
        </Pressable>
      </View>
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
  threadIcon: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.brand[50], alignItems: 'center', justifyContent: 'center',
  },
  messagesList: { padding: spacing[4], gap: spacing[3], paddingBottom: spacing[4] },
  msgRow: { flexDirection: 'row', gap: spacing[2], alignItems: 'flex-end', marginBottom: spacing[2] },
  msgRowMe: { flexDirection: 'row-reverse' },
  bubble: { maxWidth: '72%', borderRadius: 16, padding: spacing[3], gap: spacing[1] },
  bubbleThem: { backgroundColor: colors.gray[100], borderBottomLeftRadius: 4 },
  bubbleMe: { backgroundColor: colors.brand[600], borderBottomRightRadius: 4 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[2],
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    borderTopWidth: 0.5, borderTopColor: colors.surface.border,
    backgroundColor: colors.surface.background,
  },
  input: {
    flex: 1, backgroundColor: colors.gray[100], borderRadius: 20,
    paddingHorizontal: spacing[4], paddingVertical: spacing[2],
    fontSize: 14, color: colors.surface.heading, maxHeight: 80,
  },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.brand[600], alignItems: 'center', justifyContent: 'center',
  },
});

