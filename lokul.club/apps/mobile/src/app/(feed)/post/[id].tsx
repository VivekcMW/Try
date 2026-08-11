// PRD §02 — Post detail (real API: GET /api/mobile/posts/[id] + comments)
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  Star,
  Store,
  X,
} from 'lucide-react-native';
import { Avatar, Badge, HStack, Text, VStack } from '@/components/ui';
import { POST_TYPE_META, relativeTime } from '@/data/feed-seed';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { useSavedPostsStore } from '@/store/savedPostsStore';
import { colors, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type ApiPost = {
  id: string; type: string; body: string; createdAt: string;
  reactionCount: number; commentCount: number;
  author: { id: string; name: string; avatarUrl: string | null; kycTier: string };
  media: { kind: string; url: string }[];
  tags: string[];
};
type RecMerchant = { id: string; name: string; category: string; ratingAvg?: number | null; ratingCount?: number | null };
type ApiComment = {
  id: string; body: string; createdAt: string;
  author: { id: string; name: string; avatarUrl: string | null; kycTier: string };
  recommendedMerchant?: RecMerchant | null;
  replies: ApiComment[];
};

const TONE_FG: Record<string, string> = {
  neutral: colors.gray[700],
  brand: colors.brand[700],
  success: '#059669',
  warning: '#D97706',
  danger: '#DC2626',
  info: '#0284C7',
};

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const userId  = useWalletStore((s) => s.userId);
  const pinCode = useOnboardingStore((s) => s.pin);

  const [post,     setPost]     = useState<ApiPost | null>(null);
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [liked,    setLiked]    = useState(false);
  const [comment,  setComment]  = useState('');
  const [posting,  setPosting]  = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMerchants, setPickerMerchants] = useState<RecMerchant[]>([]);
  const savedIds   = useSavedPostsStore((s) => s.savedIds);
  const toggleSaved = useSavedPostsStore((s) => s.toggleSaved);
  const saved = !!id && savedIds.includes(id);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 8000);
    try {
      const [postRes, cmtRes] = await Promise.all([
        fetch(`${BASE}/api/mobile/posts/${id}`, { signal: ctrl.signal }),
        fetch(`${BASE}/api/mobile/posts/${id}/comments`, { signal: ctrl.signal }),
      ]);
      
      // Only set post if the response is ok
      if (postRes.ok) {
        const postData = await postRes.json();
        setPost(postData ?? null);
      } else {
        // non-2xx — post not found or access denied
        setPost(null);
      }
      
      // Load comments if available
      if (cmtRes.ok) {
        const cmtData = await cmtRes.json();
        setComments(Array.isArray(cmtData?.items) ? cmtData.items : []);
      } else {
        // comments unavailable — fall back to empty list
        setComments([]);
      }
    } catch (err) {
      console.error('[PostDetail] Error loading post:', err);
      setPost(null);
      setComments([]);
    } finally {
      clearTimeout(to);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  function handleMoreOptions() {
    if (!post) return;
    Alert.alert('Post options', undefined, [
      {
        text: 'Copy link',
        onPress: () => {
          Clipboard.setString(`lokul://feed/post/${post.id}`);
          Alert.alert('Copied', 'Post link copied to clipboard.');
        },
      },
      {
        text: 'Hide this post',
        onPress: () => Alert.alert('Hidden', 'You won’t see this post again.'),
      },
      {
        text: 'Report post',
        style: 'destructive',
        onPress: () => Alert.alert('Reported', 'Thanks — our moderators will review this post.'),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  async function handleSend() {
    if (!comment.trim() || !userId || !id) return;
    setPosting(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/posts/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, text: comment.trim() }),
      });
      if (res.ok) { setComment(''); load(); }
    } catch { /* noop */ } finally { setPosting(false); }
  }

  async function openMerchantPicker() {
    setPickerOpen(true);
    if (pickerMerchants.length > 0 || !pinCode) return;
    try {
      const res = await fetch(`${BASE}/api/mobile/merchants?pinCode=${pinCode}&limit=30`);
      const data = await res.json();
      setPickerMerchants(Array.isArray(data?.items) ? data.items : []);
    } catch { /* keep empty */ }
  }

  async function recommendMerchant(m: RecMerchant) {
    if (!userId || !id) return;
    setPickerOpen(false);
    setPosting(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/posts/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          text: comment.trim() || `I recommend ${m.name} 👍`,
          recommendedMerchantId: m.id,
        }),
      });
      if (res.ok) { setComment(''); load(); }
    } catch { /* noop */ } finally { setPosting(false); }
  }

  async function offerHelp() {
    if (!userId || !id || !post) return;
    setPosting(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/posts/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, text: 'I can help 🤝 — message me!' }),
      });
      if (res.ok) {
        load();
        Alert.alert('Thank you! 🤝', `${post.author.name} has been notified. You can also DM them directly.`);
      }
    } catch { /* noop */ } finally { setPosting(false); }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <HStack gap={3} align="center" style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color={colors.surface.heading} />
          </Pressable>
          <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Post</Text>
        </HStack>
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <HStack gap={3} align="center" style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color={colors.surface.heading} />
          </Pressable>
          <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Post</Text>
        </HStack>
        <Text variant="body" tone="secondary" style={{ padding: spacing[6] }}>Post not found.</Text>
      </SafeAreaView>
    );
  }

  const meta     = POST_TYPE_META[post.type as keyof typeof POST_TYPE_META] ?? POST_TYPE_META.update;
  const TypeIcon = meta.Icon;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <HStack gap={3} align="center" style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Post</Text>
        <Pressable onPress={handleMoreOptions} accessibilityRole="button">
          <MoreHorizontal size={20} color={colors.surface.textSecondary} />
        </Pressable>
      </HStack>

      <FlatList
        data={comments}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ paddingBottom: spacing[20] }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <VStack gap={0} style={styles.postWrap}>
            <HStack gap={3} align="center" style={{ marginBottom: spacing[3] }}>
              <Avatar name={post.author.name} size="md" />
              <VStack gap={0.5} style={{ flex: 1 }}>
                <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
                  {post.author.name}
                </Text>
                <Text variant="caption" tone="secondary">
                  {relativeTime(new Date(post.createdAt).getTime())}
                </Text>
              </VStack>
            </HStack>

            <Badge
              label={meta.label}
              tone={meta.tone}
              leftIcon={<TypeIcon size={11} color={TONE_FG[meta.tone] ?? colors.gray[700]} />}
              style={{ alignSelf: 'flex-start', marginBottom: spacing[3] }}
            />

            <Text variant="body" style={{ color: colors.surface.heading, lineHeight: 24, marginBottom: spacing[3] }}>
              {post.body}
            </Text>

            {post.tags.length > 0 && (
              <HStack gap={2} style={{ marginBottom: spacing[3] }}>
                {post.tags.map((t) => (
                  <Text key={t} variant="caption" style={{ color: colors.brand[600] }}>#{t}</Text>
                ))}
              </HStack>
            )}

            <View style={styles.divider} />
            <HStack gap={3} align="center" style={{ paddingVertical: spacing[3] }}>
              <Pressable onPress={() => setLiked(!liked)} style={styles.actionBtn}>
                <Heart size={18} color={liked ? '#DC2626' : colors.surface.textSecondary}
                  fill={liked ? '#DC2626' : 'transparent'} />
                <Text variant="caption" style={{ color: liked ? '#DC2626' : colors.surface.textSecondary }}>
                  {post.reactionCount + (liked ? 1 : 0)}
                </Text>
              </Pressable>
              <View style={{ flex: 1 }} />
              <Pressable onPress={() => id && toggleSaved(id)} style={styles.actionBtn}>
                <Bookmark size={18} color={saved ? colors.brand[600] : colors.surface.textSecondary}
                  fill={saved ? colors.brand[600] : 'transparent'} />
              </Pressable>
            </HStack>
            <View style={styles.divider} />

            {/* Contextual actions for new post types */}
            {post.type === 'recommendation' && (
              <Pressable style={styles.recommendBtn} onPress={openMerchantPicker} accessibilityRole="button">
                <Store size={16} color="#fff" />
                <Text variant="body" style={{ color: '#fff', fontWeight: '700' }}>Recommend a business</Text>
              </Pressable>
            )}
            {post.type === 'help_request' && (
              <Pressable style={[styles.recommendBtn, { backgroundColor: '#DC2626' }]} onPress={offerHelp} accessibilityRole="button">
                <Text variant="body" style={{ color: '#fff', fontWeight: '700' }}>🤝 I can help</Text>
              </Pressable>
            )}

            <HStack gap={2} align="center" style={{ paddingTop: spacing[4], paddingBottom: spacing[2] }}>
              <MessageCircle size={16} color={colors.brand[600]} />
              <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
                {comments.length} Comments
              </Text>
            </HStack>
          </VStack>
        }
        renderItem={({ item }) => (
          <HStack gap={3} align="start" style={styles.commentRow}>
            <Avatar name={item.author.name} size="sm" />
            <VStack gap={0.5} style={styles.commentBubble}>
              <HStack gap={2} align="center">
                <Text variant="caption" style={{ fontWeight: '700', color: colors.surface.heading }}>
                  {item.author.name}
                </Text>
                <Text variant="caption" tone="secondary">
                  {relativeTime(new Date(item.createdAt).getTime())}
                </Text>
              </HStack>
              <Text variant="body" style={{ color: colors.surface.heading, lineHeight: 20 }}>
                {item.body}
              </Text>
              {item.recommendedMerchant && (
                <Pressable
                  style={styles.merchantChip}
                  onPress={() => router.push({ pathname: '/(marketplace)/merchant/[id]', params: { id: item.recommendedMerchant!.id } } as never)}
                  accessibilityRole="button"
                >
                  <Store size={14} color={colors.brand[600]} />
                  <VStack gap={0} style={{ flex: 1 }}>
                    <Text variant="caption" style={{ fontWeight: '700', color: colors.surface.heading }}>
                      {item.recommendedMerchant.name}
                    </Text>
                    <Text variant="caption" tone="secondary">{item.recommendedMerchant.category}</Text>
                  </VStack>
                  {item.recommendedMerchant.ratingAvg != null && (
                    <HStack gap={0.5} align="center">
                      <Star size={11} color="#F59E0B" fill="#F59E0B" />
                      <Text variant="caption" style={{ fontWeight: '700' }}>{item.recommendedMerchant.ratingAvg.toFixed(1)}</Text>
                    </HStack>
                  )}
                </Pressable>
              )}
            </VStack>
          </HStack>
        )}
      />

      {/* Merchant picker for recommendations */}
      <Modal visible={pickerOpen} animationType="slide" transparent onRequestClose={() => setPickerOpen(false)}>
        <View style={styles.pickerBackdrop}>
          <View style={styles.pickerSheet}>
            <HStack gap={2} align="center" style={{ marginBottom: spacing[3] }}>
              <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Recommend a business</Text>
              <Pressable onPress={() => setPickerOpen(false)} accessibilityRole="button">
                <X size={22} color={colors.surface.textSecondary} />
              </Pressable>
            </HStack>
            <FlatList
              data={pickerMerchants}
              keyExtractor={(m) => m.id}
              style={{ maxHeight: 420 }}
              ListEmptyComponent={<ActivityIndicator color={colors.brand[600]} style={{ marginTop: spacing[6] }} />}
              renderItem={({ item: m }) => (
                <Pressable style={styles.pickerRow} onPress={() => recommendMerchant(m)} accessibilityRole="button">
                  <Store size={18} color={colors.brand[600]} />
                  <VStack gap={0} style={{ flex: 1 }}>
                    <Text variant="body" style={{ fontWeight: '600', color: colors.surface.heading }}>{m.name}</Text>
                    <Text variant="caption" tone="secondary">{m.category}</Text>
                  </VStack>
                  {m.ratingAvg != null && (
                    <HStack gap={0.5} align="center">
                      <Star size={12} color="#F59E0B" fill="#F59E0B" />
                      <Text variant="caption" style={{ fontWeight: '700' }}>{m.ratingAvg.toFixed(1)}</Text>
                    </HStack>
                  )}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>

      <View style={styles.inputRow}>
        <Avatar name="You" size="sm" />
        <TextInput
          style={styles.input}
          placeholder="Add a comment…"
          placeholderTextColor={colors.surface.textSecondary}
          value={comment}
          onChangeText={setComment}
          maxLength={500}
        />
        <Pressable
          onPress={handleSend}
          style={[styles.sendBtn, { opacity: comment.trim() && !posting ? 1 : 0.4 }]}
          disabled={!comment.trim() || posting}
          accessibilityRole="button"
        >
          {posting ? <ActivityIndicator size="small" color="#fff" /> : <Send size={16} color="#fff" />}
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
  postWrap: { paddingHorizontal: spacing[5], paddingTop: spacing[4] },
  divider: { height: 0.5, backgroundColor: colors.surface.border },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  commentRow: { paddingHorizontal: spacing[5], paddingVertical: spacing[3] },
  commentBubble: { flex: 1, backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: spacing[3],
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderTopWidth: 0.5,
    borderTopColor: colors.surface.border,
    backgroundColor: colors.surface.background,
  },
  input: {
    flex: 1,
    backgroundColor: colors.gray[100],
    borderRadius: 20,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    fontSize: 14,
    color: colors.surface.heading,
    maxHeight: 80,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    backgroundColor: colors.brand[600],
    borderRadius: 12,
    paddingVertical: spacing[3],
    marginVertical: spacing[3],
  },
  merchantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[2],
    padding: spacing[2.5],
    backgroundColor: colors.surface.background,
    borderWidth: 1,
    borderColor: colors.brand[200],
    borderRadius: 10,
  },
  pickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: colors.surface.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing[5],
    paddingBottom: spacing[8],
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
    borderBottomWidth: 0.5,
    borderBottomColor: colors.surface.border,
  },
});
