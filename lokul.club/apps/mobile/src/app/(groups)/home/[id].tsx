// PRD §03 — Community home (feed + about + members + chat tabs)
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Share, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Bell, MessageCircle, MoreHorizontal, Pin, Send, Share2, Users } from 'lucide-react-native';
import { Badge, Button, Card, HStack, Text, VStack } from '@/components/ui';
import { DISCOVER_COMMUNITIES, COMMUNITY_FEED } from '@/data/community-groups-seed';
import { COMMUNITY_CATEGORY_META, useCommunityStore } from '@/store/communityStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { colors, spacing } from '@lokul/ui-tokens';

type Member = { id: string; name: string; avatarUrl: string | null; kycTier: string; role: string };

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type Tab = 'feed' | 'about' | 'members' | 'chat';

type ChatMessage = {
  id: string;
  body: string;
  createdAt: string;
  sender: { id: string; name: string };
};

export default function CommunityHome() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId  = useWalletStore((s) => s.userId);
  const joinedIds = useCommunityStore((s) => s.joinedIds);
  const mine = useCommunityStore((s) => s.myCommunities);
  const join = useCommunityStore((s) => s.joinCommunity);
  const leave = useCommunityStore((s) => s.leaveCommunity);
  const [tab, setTab] = useState<Tab>('feed');
  const [messages,  setMessages]  = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [threadId,  setThreadId]  = useState<string | null>(null);
  const [sending,   setSending]   = useState(false);
  const [members,      setMembers]      = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [leaving,   setLeaving]   = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const community = [...mine, ...DISCOVER_COMMUNITIES].find((c) => c.id === id);

  const loadThread = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/api/mobile/communities/${id}`);
      const data = await res.json();
      if (data.threadId) setThreadId(data.threadId);
    } catch { /* noop */ }
  }, [id]);

  const loadMessages = useCallback(async (tId: string) => {
    try {
      const res = await fetch(`${BASE}/api/mobile/chat/${tId}/messages`);
      const data = await res.json();
      setMessages(data.messages ?? []);
    } catch { /* noop */ }
  }, []);

  const loadMembers = useCallback(async () => {
    if (!id) return;
    setMembersLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/communities/${id}/members`);
      const data = await res.json();
      setMembers(Array.isArray(data?.items) ? data.items : []);
    } catch { setMembers([]); } finally { setMembersLoading(false); }
  }, [id]);

  useEffect(() => { loadThread(); }, [loadThread]);
  useEffect(() => {
    if (tab === 'chat' && threadId) loadMessages(threadId);
    if (tab === 'members') loadMembers();
  }, [tab, threadId, loadMessages, loadMembers]);

  function handleLeaveGroup() {
    if (!community) return;
    Alert.alert('Leave community', `Leave ${community.name}? You can rejoin later.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          setLeaving(true);
          try {
            if (userId) {
              await fetch(`${BASE}/api/mobile/communities/${community.id}/join`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
              });
            }
            leave(community.id);
          } catch {
            Alert.alert('Error', 'Could not leave the community — please try again.');
          } finally {
            setLeaving(false);
          }
        },
      },
    ]);
  }

  async function handleShareGroup() {
    if (!community) return;
    try {
      await Share.share({
        message: `Join ${community.name} on Lokul: lokul://groups/home/${community.id}`,
      });
    } catch { /* user cancelled or share failed — nothing to do */ }
  }

  function handleMoreOptions() {
    if (!community) return;
    Alert.alert(community.name, undefined, [
      { text: 'Share community', onPress: handleShareGroup },
      ...(joinedIds.includes(community.id)
        ? [{ text: 'Leave community', style: 'destructive' as const, onPress: handleLeaveGroup }]
        : []),
      { text: 'Report community', style: 'destructive' as const, onPress: () => Alert.alert('Reported', 'Thanks — our team will review this community.') },
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  }

  async function sendMessage() {
    if (!chatInput.trim() || !threadId || !userId) return;
    setSending(true);
    const body = chatInput.trim();
    setChatInput('');
    try {
      await fetch(`${BASE}/api/mobile/chat/${threadId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: userId, body }),
      });
      loadMessages(threadId);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch { /* noop */ } finally {
      setSending(false);
    }
  }

  if (!community) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text variant="body" style={{ padding: spacing[6] }}>Community not found.</Text>
      </SafeAreaView>
    );
  }

  const meta = COMMUNITY_CATEGORY_META[community.category];
  const joined = joinedIds.includes(community.id);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Banner */}
      <View style={[styles.banner, { backgroundColor: community.bannerColor + 'CC' }]}>
        <HStack gap={2} align="center" style={{ justifyContent: 'space-between' }}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.bannerBtn}>
            <ArrowLeft size={20} color="#fff" />
          </Pressable>
          <HStack gap={1}>
            <Pressable onPress={handleShareGroup} hitSlop={10} style={styles.bannerBtn}><Share2 size={18} color="#fff" /></Pressable>
            <Pressable onPress={handleMoreOptions} hitSlop={10} style={styles.bannerBtn}><MoreHorizontal size={18} color="#fff" /></Pressable>
          </HStack>
        </HStack>
      </View>

      <View style={styles.profileBox}>
        <View style={[styles.avatar, { backgroundColor: '#fff', borderColor: community.bannerColor }]}>
          <Text style={{ fontSize: 32 }}>{community.emoji}</Text>
        </View>
        <Text variant="h2" style={{ fontWeight: '800', marginTop: spacing[2] }}>{community.name}</Text>
        <HStack gap={2} align="center" style={{ marginTop: 4 }}>
          <Badge label={meta.label} tone="neutral" />
          {community.privacy !== 'open' && <Badge label={community.privacy === 'invite' ? 'INVITE' : 'REQUEST'} tone="warning" />}
        </HStack>
        <HStack gap={3} align="center" style={{ marginTop: spacing[2] }}>
          <HStack gap={1} align="center">
            <Users size={13} color={colors.surface.textSecondary} />
            <Text variant="caption" tone="secondary">{community.memberCount.toLocaleString('en-IN')} members</Text>
          </HStack>
          <HStack gap={1} align="center">
            <MessageCircle size={13} color={colors.surface.textSecondary} />
            <Text variant="caption" tone="secondary">{community.postCount} posts</Text>
          </HStack>
        </HStack>

        <View style={{ flexDirection: 'row', gap: spacing[2], marginTop: spacing[3], width: '100%' }}>
          <View style={{ flex: 1 }}>
            {joined ? (
              <Button label={leaving ? 'Leaving…' : 'Joined'} variant="secondary" loading={leaving} onPress={handleLeaveGroup} fullWidth leftIcon={<Bell size={14} color={colors.brand[700]} />} />
            ) : (
              <Button label={community.privacy === 'request' ? 'Request to join' : 'Join community'} onPress={() => join(community.id)} fullWidth />
            )}
          </View>
        </View>
      </View>

      <View style={styles.tabs}>
        {(['feed', 'about', 'members', 'chat'] as Tab[]).map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
            <Text variant="caption" style={{ fontWeight: '700', color: tab === t ? colors.brand[700] : colors.surface.textSecondary, textTransform: 'capitalize' }}>{t}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {tab === 'feed' && (
          <VStack gap={3}>
            {!joined && (
              <Card padding={3} elevation="none" bordered style={{ backgroundColor: colors.brand[50], borderColor: colors.brand[100] }}>
                <Text variant="caption" style={{ color: colors.brand[700], fontWeight: '600' }}>
                  Join to post and react. You can still browse the conversation.
                </Text>
              </Card>
            )}
            {COMMUNITY_FEED.map((p) => (
              <Card key={p.id} padding={4} elevation="xs" bordered>
                <HStack gap={2} align="center" style={{ justifyContent: 'space-between' }}>
                  <HStack gap={2} align="center">
                    <View style={styles.dot}><Text style={{ color: '#fff', fontWeight: '700' }}>{p.authorName[0]}</Text></View>
                    <VStack gap={0}>
                      <Text variant="caption" style={{ fontWeight: '700' }}>{p.authorName}</Text>
                      <Text variant="caption" tone="secondary">{p.authorFlat} · {Math.round((Date.now() - p.postedAt) / 60_000)}m</Text>
                    </VStack>
                  </HStack>
                  {p.type === 'announcement' && <Pin size={14} color={colors.semantic.warning} />}
                  {p.type === 'poll' && <Badge label="POLL" tone="info" />}
                </HStack>
                <Text variant="body" style={{ marginTop: spacing[2] }}>{p.body}</Text>
                <HStack gap={3} align="center" style={{ marginTop: spacing[2.5] }}>
                  <Text variant="caption" tone="secondary">{p.reactions} reactions</Text>
                  <Text variant="caption" tone="secondary">· {p.comments} comments</Text>
                </HStack>
              </Card>
            ))}
          </VStack>
        )}
        {tab === 'about' && (
          <VStack gap={3}>
            <Card padding={4} elevation="xs" bordered>
              <Text variant="caption" style={{ fontWeight: '700', textTransform: 'uppercase', color: colors.surface.textSecondary, letterSpacing: 0.6 }}>About</Text>
              <Text variant="body" style={{ marginTop: spacing[2] }}>{community.bio}</Text>
            </Card>
            <Card padding={4} elevation="xs" bordered>
              <Text variant="caption" style={{ fontWeight: '700', textTransform: 'uppercase', color: colors.surface.textSecondary, letterSpacing: 0.6 }}>Rules</Text>
              <VStack gap={1.5} style={{ marginTop: spacing[2] }}>
                <Text variant="body">1. Be kind and respectful</Text>
                <Text variant="body">2. No spam or self-promotion</Text>
                <Text variant="body">3. Keep posts on-topic for this community</Text>
                <Text variant="body">4. Report violations to admins</Text>
              </VStack>
            </Card>
          </VStack>
        )}
        {tab === 'members' && (
          <VStack gap={2}>
            {membersLoading && <ActivityIndicator color={colors.brand[600]} style={{ marginTop: spacing[6] }} />}
            {!membersLoading && members.length === 0 && (
              <Card padding={4} elevation="xs" bordered>
                <Text variant="body" tone="secondary">No members found yet.</Text>
              </Card>
            )}
            {!membersLoading && members.map((m) => (
              <Card key={m.id} padding={3.5} elevation="xs" bordered>
                <HStack gap={3} align="center">
                  <View style={styles.dot}><Text style={{ color: '#fff', fontWeight: '700' }}>{m.name[0]}</Text></View>
                  <VStack gap={0} style={{ flex: 1 }}>
                    <Text variant="body" style={{ fontWeight: '700' }}>{m.name}</Text>
                    <Text variant="caption" tone="secondary">{m.kycTier.toUpperCase()}</Text>
                  </VStack>
                  {m.role === 'admin' && <Badge label="ADMIN" tone="warning" />}
                </HStack>
              </Card>
            ))}
          </VStack>
        )}
        {tab === 'chat' && (
          <VStack gap={2} style={{ flex: 1 }}>
            {messages.length === 0 && (
              <Text variant="caption" tone="secondary" style={{ textAlign: 'center', paddingVertical: spacing[6] }}>
                No messages yet. Start the conversation!
              </Text>
            )}
            {messages.map((m) => {
              const mine = m.sender.id === userId;
              return (
                <View key={m.id} style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
                  {!mine && <Text variant="caption" style={{ fontWeight: '700', color: colors.brand[700], marginBottom: 2 }}>{m.sender.name}</Text>}
                  <Text variant="body" style={{ color: mine ? '#fff' : colors.surface.foreground }}>{m.body}</Text>
                  <Text variant="caption" style={{ color: mine ? 'rgba(255,255,255,0.7)' : colors.surface.textSecondary, marginTop: 2, textAlign: 'right' }}>
                    {new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              );
            })}
          </VStack>
        )}
      </ScrollView>
      {tab === 'chat' && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <HStack gap={2} align="center" style={styles.chatBar}>
            <TextInput
              value={chatInput}
              onChangeText={setChatInput}
              placeholder="Message…"
              placeholderTextColor={colors.surface.textSecondary}
              style={styles.chatInput}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
            />
            <Pressable onPress={sendMessage} disabled={sending || !chatInput.trim()} style={[styles.sendBtn, { opacity: sending || !chatInput.trim() ? 0.4 : 1 }]}>
              <Send size={18} color="#fff" />
            </Pressable>
          </HStack>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  banner: { height: 100, paddingHorizontal: spacing[3], paddingTop: spacing[2] },
  bannerBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.18)', alignItems: 'center', justifyContent: 'center' },
  profileBox: {
    backgroundColor: colors.surface.background,
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surface.border,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, marginTop: -36,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surface.border,
  },
  tab: { flex: 1, paddingVertical: spacing[3], alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.brand[600] },
  scroll: { padding: spacing[4], paddingBottom: spacing[10] },
  dot: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.brand[600], alignItems: 'center', justifyContent: 'center' },
  bubble: {
    maxWidth: '80%', padding: spacing[3], borderRadius: 12, marginBottom: spacing[1],
  },
  bubbleMine: { alignSelf: 'flex-end', backgroundColor: colors.brand[600], borderBottomRightRadius: 2 },
  bubbleOther: { alignSelf: 'flex-start', backgroundColor: colors.surface.background, borderBottomLeftRadius: 2, borderWidth: 1, borderColor: colors.surface.border },
  chatBar: {
    paddingHorizontal: spacing[4], paddingVertical: spacing[2],
    backgroundColor: colors.surface.background,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.surface.border,
  },
  chatInput: {
    flex: 1, height: 40, backgroundColor: colors.surface.surfaceMuted, borderRadius: 20,
    paddingHorizontal: spacing[4], fontSize: 14, color: colors.surface.foreground,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.brand[600],
    alignItems: 'center', justifyContent: 'center',
  },
});
