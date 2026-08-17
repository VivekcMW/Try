// PRD §12 — Stories Viewer (full-screen, 24h, with progress bar, reply & reactions)
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Heart, Send, X } from 'lucide-react-native';
import { Avatar, HStack, Text, VStack } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { colors, spacing } from '@lokul/ui-tokens';
import type { ApiStory } from '@/components/ui/StoriesRow';
import { FeatureGate } from '@/components/FeatureGate';

const { width: SW, height: SH } = Dimensions.get('window');
const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';
const STORY_DURATION_MS = 5_000;

const QUICK_REACTIONS = ['❤️', '😂', '😮', '🙏', '🔥', '👏'];

// ─── Progress bar for one story ───────────────────────────────────────────────
function StoryProgressBar({
  total, current, progress,
}: {
  readonly total: number;
  readonly current: number;
  readonly progress: Animated.Value;
}) {
  return (
    <HStack gap={1} style={s.progressRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[s.progressTrack, { flex: 1 }]}>
          {i < current  && <View style={[s.progressFill, { width: '100%' }]} />}
          {i === current && (
            <Animated.View
              style={[s.progressFill, {
                width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
              }]}
            />
          )}
        </View>
      ))}
    </HStack>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function StoryViewerScreen() {
  return (
    <FeatureGate featureKey="stories">
      <StoryViewerScreenInner />
    </FeatureGate>
  );
}

function StoryViewerScreenInner() {
  const router   = useRouter();
  const params   = useLocalSearchParams<{ storyId: string; stories?: string }>();
  const pinCode  = useOnboardingStore((s) => s.pin);
  const userId   = useWalletStore((s) => s.userId);

  const [stories,      setStories]      = useState<ApiStory[]>([]);
  const [currentIdx,   setCurrentIdx]   = useState(0);
  const [replyText,    setReplyText]     = useState('');
  const [sending,      setSending]       = useState(false);
  const [sentReaction, setSentReaction]  = useState<string | null>(null);
  const [paused,       setPaused]        = useState(false);

  const progress  = useRef(new Animated.Value(0)).current;
  const anim      = useRef<Animated.CompositeAnimation | null>(null);

  // Load stories list — either from params (pre-fetched) or fresh fetch
  useEffect(() => {
    if (params.stories) {
      try {
        const parsed: ApiStory[] = JSON.parse(params.stories);
        setStories(parsed);
        const startIdx = parsed.findIndex((s) => s.id === params.storyId);
        if (startIdx >= 0) setCurrentIdx(startIdx);
      } catch { /* fallback below */ }
      return;
    }
    // Fetch all stories for the pin
    if (!pinCode) return;
    fetch(`${BASE}/api/mobile/stories?pinCode=${pinCode}&viewerId=${userId}`)
      .then((r) => r.json())
      .then((d) => {
        const list: ApiStory[] = d.stories ?? [];
        setStories(list);
        const idx = list.findIndex((s) => s.id === params.storyId);
        if (idx >= 0) setCurrentIdx(idx);
      })
      .catch(() => {});
  }, [params.storyId, params.stories, pinCode, userId]);

  // Mark story as viewed
  const markViewed = useCallback((storyId: string) => {
    if (!userId) return;
    fetch(`${BASE}/api/mobile/stories/${storyId}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ viewerId: userId }),
    }).catch(() => {});
  }, [userId]);

  // Start / restart progress animation for current story
  const startProgress = useCallback(() => {
    progress.setValue(0);
    anim.current?.stop();
    anim.current = Animated.timing(progress, {
      toValue: 1,
      duration: STORY_DURATION_MS,
      useNativeDriver: false,
    });
    anim.current.start(({ finished }) => {
      if (!finished) return;
      setCurrentIdx((idx) => {
        if (idx + 1 < stories.length) return idx + 1;
        router.back();
        return idx;
      });
    });
  }, [progress, stories.length, router]);

  useEffect(() => {
    if (stories.length === 0) return;
    const story = stories[currentIdx];
    if (story) markViewed(story.id);
    startProgress();
    return () => { anim.current?.stop(); };
  }, [currentIdx, stories.length, startProgress, markViewed]);

  // Pause / resume on keyboard open
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => {
      anim.current?.stop();
      setPaused(true);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setPaused(false);
      startProgress();
    });
    return () => { show.remove(); hide.remove(); };
  }, [startProgress]);

  // Touch: left half = previous, right half = next
  const handleTap = (x: number) => {
    if (x < SW / 2) {
      setCurrentIdx((idx) => Math.max(0, idx - 1));
    } else {
      setCurrentIdx((idx) => {
        if (idx + 1 < stories.length) return idx + 1;
        router.back();
        return idx;
      });
    }
  };

  const handleReact = async (emoji: string) => {
    setSentReaction(emoji);
    setTimeout(() => setSentReaction(null), 1_800);
    // persist reaction (best-effort)
    if (!userId || !current) return;
    fetch(`${BASE}/api/mobile/stories/${current.id}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, reaction: emoji }),
    }).catch(() => {});
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !userId || !current || sending) return;
    setSending(true);
    try {
      await fetch(`${BASE}/api/mobile/stories/${current.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: userId, message: replyText.trim() }),
      });
      setReplyText('');
      Keyboard.dismiss();
    } catch { /* noop */ } finally { setSending(false); }
  };

  if (stories.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
        <Text variant="body" style={{ color: '#fff' }}>Loading…</Text>
      </SafeAreaView>
    );
  }

  const current = stories[currentIdx];

  return (
    <View style={s.container}>
      {/* Background */}
      {current?.mediaUrl ? (
        <Image source={{ uri: current.mediaUrl }} style={s.media} resizeMode="cover" />
      ) : (
        <View style={[s.media, s.mediaSolid]} />
      )}

      {/* Tap areas */}
      <Pressable
        style={s.tapLeft}
        onPress={(e) => handleTap(e.nativeEvent.locationX)}
        onLongPress={() => { anim.current?.stop(); setPaused(true); }}
        onPressOut={() => { if (paused) { setPaused(false); startProgress(); } }}
        accessibilityLabel="Previous or next story"
      />

      <SafeAreaView style={s.overlay} edges={['top']}>
        {/* Progress bars */}
        <StoryProgressBar
          total={stories.length}
          current={currentIdx}
          progress={progress}
        />

        {/* Author row */}
        <HStack gap={3} align="center" style={s.authorRow}>
          <Avatar name={current?.author.name ?? '?'} size="sm" />
          <VStack gap={0} style={{ flex: 1 }}>
            <Text variant="body" style={s.authorName}>
              {current?.author.name}
            </Text>
            <Text variant="caption" style={s.timeAgo}>
              {current?.expiresAt
                ? (() => {
                    const remaining = Math.max(0, new Date(current.expiresAt).getTime() - Date.now());
                    const hrs = Math.floor(remaining / 3_600_000);
                    return `${hrs}h remaining`;
                  })()
                : ''}
            </Text>
          </VStack>
          <Pressable onPress={() => router.back()} accessibilityLabel="Close" style={s.closeBtn}>
            <X size={22} color="#fff" />
          </Pressable>
        </HStack>

        {/* Caption */}
        {current?.caption && (
          <View style={s.captionWrap}>
            <Text variant="body" style={s.caption}>{current.caption}</Text>
          </View>
        )}
      </SafeAreaView>

      {/* Floating reaction that floats up */}
      {sentReaction && (
        <View style={s.floatReaction} pointerEvents="none">
          <Text style={{ fontSize: 42 }}>{sentReaction}</Text>
        </View>
      )}

      {/* Bottom: quick reactions + reply */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.bottomWrap}
      >
        {/* Quick reactions */}
        <HStack gap={3} style={s.reactionsRow}>
          {QUICK_REACTIONS.map((emoji) => (
            <Pressable
              key={emoji}
              onPress={() => handleReact(emoji)}
              style={s.emojiBtn}
              accessibilityLabel={`React ${emoji}`}
            >
              <Text style={{ fontSize: 24 }}>{emoji}</Text>
            </Pressable>
          ))}
          <Pressable onPress={() => handleReact('❤️')} style={s.emojiBtn} accessibilityLabel="Like">
            <Heart size={22} color="#fff" />
          </Pressable>
        </HStack>

        {/* Reply input */}
        <SafeAreaView edges={['bottom']} style={s.replyRow}>
          <TextInput
            style={s.replyInput}
            placeholder="Reply…"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={replyText}
            onChangeText={setReplyText}
            returnKeyType="send"
            onSubmitEditing={handleSendReply}
            accessibilityLabel="Reply to story"
          />
          <Pressable
            style={[s.sendBtn, !replyText.trim() && s.sendBtnDim]}
            onPress={handleSendReply}
            disabled={!replyText.trim() || sending}
            accessibilityLabel="Send reply"
          >
            <Send size={18} color="#fff" />
          </Pressable>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#000' },
  media:       { ...StyleSheet.absoluteFill },
  mediaSolid:  { backgroundColor: '#1a1a2e' },
  tapLeft:     { ...StyleSheet.absoluteFill },
  overlay:     { position: 'absolute', top: 0, left: 0, right: 0 },
  progressRow: { paddingHorizontal: spacing[3], paddingTop: spacing[2] },
  progressTrack: {
    height: 2.5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  authorRow:   { paddingHorizontal: spacing[3], paddingTop: spacing[2] },
  authorName:  { color: '#fff', fontWeight: '700', fontSize: 14 },
  timeAgo:     { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
  closeBtn:    {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  captionWrap: {
    marginTop: 'auto',
    backgroundColor: 'rgba(0,0,0,0.45)',
    marginHorizontal: spacing[4],
    marginBottom: spacing[2],
    borderRadius: 10,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  caption:     { color: '#fff', fontSize: 15, lineHeight: 22 },
  floatReaction: {
    position: 'absolute',
    bottom: 160,
    alignSelf: 'center',
  },
  bottomWrap:   { position: 'absolute', bottom: 0, left: 0, right: 0 },
  reactionsRow: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    justifyContent: 'flex-end',
  },
  emojiBtn:    {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  replyRow:    {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
  },
  replyInput:  {
    flex: 1,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 22,
    paddingHorizontal: spacing[4],
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  sendBtn:     {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.brand[600],
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDim:  { backgroundColor: 'rgba(255,255,255,0.2)' },
});
