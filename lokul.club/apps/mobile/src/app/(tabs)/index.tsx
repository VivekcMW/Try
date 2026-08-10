// Feature flag to switch between old feed and new commerce home
const USE_COMMERCE_HOME = true;  // Set to false to use old social feed

// New commerce-first home screen
import HomeScreenCommerce from './index-commerce';

// Keep old imports for the social feed version
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { ReportSheet } from '@/components/ReportSheet';
import { AdSlot } from '@/components/AdSlot';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell,
  Bookmark,
  Check,
  Filter,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Pin,
  Play,
  Plus,
  Send,
  Sparkles,
  Heart,
  X,
} from 'lucide-react-native';
import {
  Avatar,
  Badge,
  Button,
  Card,
  HStack,
  NewsCard,
  RadiusSelector,
  StoriesRow,
  Text,
  VStack,
} from '@/components/ui';
import {
  AD_STRIPS,
  FEED_POSTS,
  FILTER_TAGS,
  POST_TYPE_META,
  PROMO_SLIDES,
  REACTION_ICONS,
  relativeTime,
  type AdStrip,
  type FeedPost,
  type PostType,
  type PromoSlide,
  type ReactionKind,
} from '@/data/feed-seed';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useVerificationStore } from '@/store/verificationStore';
import { useRadiusStore } from '@/store/radiusStore';
import { useWalletStore } from '@/store/walletStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { fetchLocalityNews, type LocalityNewsItem } from '@/services/newsService';
import { OfflineBanner } from '@/components/OfflineBanner';
import { feedCache } from '@/services/feedCache';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useAccessibilityStore } from '@/store/accessibilityStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const { width: SCREEN_W } = Dimensions.get('window');
type ApiFeedPost = {
  id: string; type: string; body: string; pinned: boolean;
  createdAt: string; reactionCount: number; commentCount: number;
  author: { id: string; name: string; avatarUrl: string | null; kycTier: string };
  media: { kind: string; url: string }[];
  tags: string[];
};
type FeedItem =
  | { kind: 'nativead' }
  | { kind: 'post'; post: FeedPost }
  | { kind: 'apipost'; post: ApiFeedPost }
  | { kind: 'ad'; strip: AdStrip }
  | { kind: 'news'; item: LocalityNewsItem };

export default function HomeScreen() {
  // Feature flag: Use new commerce-first home screen
  if (USE_COMMERCE_HOME) {
    return <HomeScreenCommerce />;
  }

  // Old social feed implementation
  return <HomeScreenFeed />;
}

function HomeScreenFeed() {
  const router = useRouter();
  const seniorMode = useAccessibilityStore((s) => s.seniorMode);
  const societyName = useOnboardingStore((s) => s.societyName) ?? 'your locality';
  const tier    = useVerificationStore((s) => s.tier);
  const pin     = useOnboardingStore((s) => s.pin);
  const city    = useOnboardingStore((s) => s.city) ?? undefined;
  const activeRadius = useRadiusStore((s) => s.active);

  const [activeFilter, setActiveFilter] = useState('all');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<PostType | 'all'>('all');
  const [localityFilter, setLocalityFilter] = useState<FeedPost['visibility'] | 'all'>('all');
  const [refreshing,   setRefreshing]   = useState(false);
  const [savedIds,     setSavedIds]     = useState<Record<string, true>>({});
  const [reactedIds,   setReactedIds]   = useState<Record<string, ReactionKind>>({});
  const [newsItems,    setNewsItems]    = useState<LocalityNewsItem[]>([]);
  const [apiPosts,     setApiPosts]     = useState<ApiFeedPost[]>([]);
  const [isCached,     setIsCached]     = useState(false);
  const { isOnline } = useNetworkStatus();

  // Fetch locality news
  useEffect(() => {
    if (!pin) return;
    fetchLocalityNews({ pinCode: pin, city, lang: 'en' })
      .then(setNewsItems)
      .catch(() => {});
  }, [pin, city]);

  // Fetch real feed posts (reactive to pinCode + filter only)
  const loadFeedPosts = useCallback(async () => {
    if (!pin) return;
    const cacheKey = `feed.${pin}.${activeFilter}`;

    // Try to load from cache first (offline / 2G fallback)
    const cached = await feedCache.get<ApiFeedPost[]>(cacheKey);
    if (cached) {
      setApiPosts(cached.data);
      setIsCached(true);
    }

    try {
      const typeParam = activeFilter !== 'all' && activeFilter !== 'news' ? `&type=${activeFilter}` : '';
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(`${BASE}/api/mobile/feed?pinCode=${pin}${typeParam}`, { signal: ctrl.signal });
      clearTimeout(to);
      const data = await res.json();
      const posts = Array.isArray(data?.posts) ? data.posts : [];
      setApiPosts(posts);
      setIsCached(false);
      // Update cache for next offline visit
      await feedCache.set(cacheKey, posts);
    } catch {
      if (!cached) setApiPosts([]);
      // If fetch failed but we have cached data, keep showing it
    }
  }, [pin, activeFilter]); // activeRadius and isOnline intentionally excluded —
  // isOnline changes on NetInfo init (null→false→true) causing 3 concurrent fetches;
  // activeRadius is not part of the feed URL query

  useEffect(() => { loadFeedPosts(); }, [loadFeedPosts]);

  // Use API posts when available, fall back to seed data
  const filtered = useMemo(() => {
    if (apiPosts.length > 0) return [];  // will use apiPosts path below
    let list = FEED_POSTS;
    if (activeFilter !== 'all') {
      list = list.filter((p) => p.tags.includes(activeFilter) || p.type === activeFilter);
    }
    if (categoryFilter !== 'all') {
      list = list.filter((p) => p.type === categoryFilter);
    }
    if (localityFilter !== 'all') {
      list = list.filter((p) => p.visibility === localityFilter);
    }
    return list;
  }, [activeFilter, apiPosts, categoryFilter, localityFilter]);

  const pinned = filtered.filter((p) => p.pinned);
  const rest   = filtered.filter((p) => !p.pinned);

  const feedItems = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [];
    let adIdx   = 0;
    let newsIdx = 0;
    const regularNews = newsItems.filter((n) => !n.isAlert);

    if (activeFilter === 'news') {
      return newsItems.map((item) => ({ kind: 'news' as const, item }));
    }

    // If real API posts are available, use them; otherwise fall back to seed
    const postsToRender = apiPosts.length > 0
      ? apiPosts
          .filter((p) => categoryFilter === 'all' || p.type === categoryFilter)
          .map<FeedItem>((p) => ({ kind: 'apipost', post: p }))
      : rest.map<FeedItem>((p) => ({ kind: 'post', post: p }));

    postsToRender.forEach((item, i) => {
      items.push(item);
      // Native ad after post #7
      if (i === 6) items.push({ kind: 'nativead' });
      if ((i + 1) % 5 === 0 && newsIdx < regularNews.length) {
        items.push({ kind: 'news', item: regularNews[newsIdx++] });
      }
      if ((i + 1) % 4 === 0 && adIdx < AD_STRIPS.length) {
        items.push({ kind: 'ad', strip: AD_STRIPS[adIdx++] });
      }
    });
    return items;
  }, [rest, apiPosts, newsItems, activeFilter, categoryFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    const newsReload = pin
      ? fetchLocalityNews({ pinCode: pin, city, lang: 'en', forceRefresh: true })
          .then(setNewsItems)
          .catch(() => {})
      : Promise.resolve();
    Promise.all([newsReload, loadFeedPosts()]).finally(() =>
      setTimeout(() => setRefreshing(false), 600)
    );
  };

  const onPost = () => {
    if (tier === 'bronze') {
      router.push('/(verification)/silver-proof');
      return;
    }
    router.push('/(feed)/compose');
  };

  // Senior mode: hand off to the simplified home screen (after all hooks)
  if (seniorMode) return <Redirect href="/(senior)/home" />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']} testID="home-screen">
      <OfflineBanner />
      <Header society={societyName} tier={tier} />

      <FilterRow
        active={activeFilter}
        onChange={setActiveFilter}
        onOpenFilters={() => setFilterSheetOpen(true)}
        filtersActive={categoryFilter !== 'all' || localityFilter !== 'all'}
      />

      <FilterSheet
        visible={filterSheetOpen}
        category={categoryFilter}
        locality={localityFilter}
        onChangeCategory={setCategoryFilter}
        onChangeLocality={setLocalityFilter}
        onClear={() => {
          setCategoryFilter('all');
          setLocalityFilter('all');
        }}
        onClose={() => setFilterSheetOpen(false)}
      />

      <FlatList
        testID="feed-list"
        data={feedItems}
        keyExtractor={(item, index) => {
          if (item.kind === 'post')     return item.post.id;
          if (item.kind === 'apipost')  return 'api-' + item.post.id;
          if (item.kind === 'ad')       return 'ad-' + item.strip.id;
          if (item.kind === 'nativead') return 'nativead-' + index;
          return 'news-' + item.item.id;
        }}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={{ gap: spacing[3] }}>
            <StoriesRow testID="stories-row" />
            <PromoCarousel />
            {pinned.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                saved={!!savedIds[p.id]}
                reaction={reactedIds[p.id]}
                onSave={() =>
                  setSavedIds((s) => {
                    const next = { ...s };
                    if (next[p.id]) delete next[p.id];
                    else next[p.id] = true;
                    return next;
                  })
                }
                onReact={(k) =>
                  setReactedIds((r) => {
                    const next = { ...r };
                    if (next[p.id] === k) delete next[p.id];
                    else next[p.id] = k;
                    return next;
                  })
                }
              />
            ))}
            <DigestCard />
            {/* Alert news injects right below pinned/digest */}
            {newsItems
              .filter((n) => n.isAlert)
              .map((n) => (
                <NewsCard key={n.id} item={n} />
              ))}
          </View>
        }
        renderItem={({ item }) => {
          if (item.kind === 'news')     return <NewsCard item={item.item} />;
          if (item.kind === 'ad')        return <AdStripCard strip={item.strip} />;
          if (item.kind === 'nativead')  return <AdSlot placement="feed" pinCode={pin ?? undefined} />;
          if (item.kind === 'apipost')   return <ApiPostCard post={item.post} />;
          const p = item.post;
          return (
            <PostCard
              post={p}
              saved={!!savedIds[p.id]}
              reaction={reactedIds[p.id]}
              onSave={() =>
                setSavedIds((s) => {
                  const next = { ...s };
                  if (next[p.id]) delete next[p.id];
                  else next[p.id] = true;
                  return next;
                })
              }
              onReact={(k) =>
                setReactedIds((r) => {
                  const next = { ...r };
                  if (next[p.id] === k) delete next[p.id];
                  else next[p.id] = k;
                  return next;
                })
              }
            />
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: spacing[3] }} />}
        ListEmptyComponent={
          feedItems.length === 0 && !refreshing ? (
            <View style={{ padding: spacing[8], alignItems: 'center' }}>
              <Text variant="h3" style={{ marginBottom: spacing[2], textAlign: 'center' }}>
                No posts yet
              </Text>
              <Text variant="body" tone="secondary" style={{ textAlign: 'center', marginBottom: spacing[6] }}>
                Be the first to share something with your community
              </Text>
              <Button 
                label="Create Post" 
                onPress={onPost}
                leftIcon={<Plus size={18} color="#fff" />}
              />
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />

      <Pressable
        onPress={onPost}
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.9 }]}
        accessibilityRole="button"
        accessibilityLabel="New post"
      >
        <Plus size={26} color="#fff" strokeWidth={2.5} />
      </Pressable>
    </SafeAreaView>
  );
}

function Header({ society, tier }: { society: string; tier: 'bronze' | 'silver' | 'gold' }) {
  const router = useRouter();
  const pin    = useOnboardingStore((s) => s.pin);
  return (
    <View>
      <View style={styles.header}>
        <VStack gap={0.5}>
          <Text variant="caption" tone="secondary">
            Good morning
          </Text>
          <Text variant="body" style={{ fontWeight: '600', color: colors.surface.heading }}>
            {society}
          </Text>
        </VStack>

        <HStack gap={2} align="center">
          <RadiusSelector compact />
          <Pressable
            onPress={() => router.push('/(notifications)/' as any)}
            style={styles.headerBtn}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Bell size={20} color={colors.surface.heading} />
            <View style={styles.dot} />
          </Pressable>
        </HStack>
      </View>
      <AdSlot placement="header" size="background" pinCode={pin ?? undefined} />
    </View>
  );
}

function FilterRow({
  active,
  onChange,
  onOpenFilters,
  filtersActive,
}: {
  active: string;
  onChange: (id: string) => void;
  onOpenFilters: () => void;
  filtersActive: boolean;
}) {
  return (
    <View style={styles.filterWrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTER_TAGS.map((t) => {
          const isActive = t.id === active;
          const ChipIcon = t.Icon;
          return (
            <Pressable
              key={t.id}
              onPress={() => onChange(t.id)}
              style={[styles.chip, isActive && styles.chipActive]}
              accessibilityRole="button"
            >
              <HStack gap={1.5} align="center">
                <ChipIcon size={12} color={isActive ? '#fff' : colors.surface.foreground} />
                <Text
                  variant="caption"
                  style={{
                    color: isActive ? '#fff' : colors.surface.foreground,
                    fontWeight: '600',
                  }}
                >
                  {t.label}
                </Text>
              </HStack>
            </Pressable>
          );
        })}
        <Pressable
          onPress={onOpenFilters}
          style={styles.chipGhost}
          accessibilityRole="button"
          accessibilityLabel="Filter feed"
        >
          <Filter size={14} color={colors.surface.textSecondary} />
          {filtersActive ? <View style={styles.filterDot} /> : null}
        </Pressable>
      </ScrollView>
    </View>
  );
}

function FilterSheet({
  visible,
  category,
  locality,
  onChangeCategory,
  onChangeLocality,
  onClear,
  onClose,
}: {
  visible: boolean;
  category: PostType | 'all';
  locality: FeedPost['visibility'] | 'all';
  onChangeCategory: (id: PostType | 'all') => void;
  onChangeLocality: (id: FeedPost['visibility'] | 'all') => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const categoryOptions: { id: PostType | 'all'; label: string }[] = [
    { id: 'all', label: 'All categories' },
    ...(Object.keys(POST_TYPE_META) as PostType[]).map((id) => ({
      id,
      label: POST_TYPE_META[id].label,
    })),
  ];
  const localityOptions: { id: FeedPost['visibility'] | 'all'; label: string }[] = [
    { id: 'all', label: 'All localities' },
    { id: 'tower', label: 'My tower' },
    { id: 'society', label: 'My society' },
    { id: 'neighborhood', label: 'Neighborhood' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.sheetHeaderRow}>
            <Text variant="h3">Filter feed</Text>
            <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
              <X size={20} color={colors.surface.foreground} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: spacing[4] }} showsVerticalScrollIndicator={false}>
            <Text variant="label" tone="secondary" style={{ textTransform: 'uppercase', marginBottom: spacing[2] }}>
              Category
            </Text>
            <VStack gap={1.5} style={{ marginBottom: spacing[4] }}>
              {categoryOptions.map((opt) => {
                const isActive = opt.id === category;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => onChangeCategory(opt.id)}
                    style={styles.sheetRow}
                    accessibilityRole="button"
                  >
                    <Text variant="body" style={{ flex: 1, color: colors.surface.heading }}>
                      {opt.label}
                    </Text>
                    {isActive ? <Check size={18} color={colors.brand[600]} /> : null}
                  </Pressable>
                );
              })}
            </VStack>

            <Text variant="label" tone="secondary" style={{ textTransform: 'uppercase', marginBottom: spacing[2] }}>
              Locality
            </Text>
            <VStack gap={1.5}>
              {localityOptions.map((opt) => {
                const isActive = opt.id === locality;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => onChangeLocality(opt.id)}
                    style={styles.sheetRow}
                    accessibilityRole="button"
                  >
                    <Text variant="body" style={{ flex: 1, color: colors.surface.heading }}>
                      {opt.label}
                    </Text>
                    {isActive ? <Check size={18} color={colors.brand[600]} /> : null}
                  </Pressable>
                );
              })}
            </VStack>
          </ScrollView>

          <Button label="Clear filters" variant="secondary" onPress={onClear} fullWidth />
        </View>
      </View>
    </Modal>
  );
}

function DigestCard() {
  return (
    <Card padding={4} elevation="none" style={styles.digest}>
      <HStack gap={3} align="center">
        <View style={styles.digestIcon}>
          <Sparkles size={20} color={colors.brand[700]} />
        </View>
        <VStack gap={0.5} style={{ flex: 1 }}>
          <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
            3 things you missed
          </Text>
          <Text variant="caption" tone="secondary">
            Water cleaning · Garba night · new chai stall near Gate 2
          </Text>
        </VStack>
        <Badge label="AI" tone="brand" />
      </HStack>
    </Card>
  );
}

function PostCard({
  post,
  saved,
  reaction,
  onSave,
  onReact,
}: {
  post: FeedPost;
  saved: boolean;
  reaction: ReactionKind | undefined;
  onSave: () => void;
  onReact: (k: ReactionKind) => void;
}) {
  const router = useRouter();
  const [reportOpen, setReportOpen] = useState(false);
  const meta = POST_TYPE_META[post.type];
  const TypeIcon = meta.Icon;
  const TONE_FG: Record<string, string> = {
    neutral: colors.gray[700],
    brand: colors.brand[700],
    success: colors.semantic.success,
    warning: colors.semantic.warning,
    danger: colors.semantic.danger,
    info: colors.semantic.info,
  };
  const totalReactions = (Object.values(post.reactions) as (number | undefined)[]).reduce<number>(
    (s, n) => s + (n ?? 0),
    0
  );

  return (
    <Card padding={4} elevation="sm" style={{ gap: spacing[3] }}>
      {post.pinned ? (
        <HStack gap={1.5} align="center">
          <Pin size={12} color={colors.brand[600]} />
          <Text
            variant="caption"
            style={{ color: colors.brand[700], fontWeight: '700', textTransform: 'uppercase' }}
          >
            Pinned by RWA
          </Text>
        </HStack>
      ) : null}

      <HStack gap={3} align="center">
        <Avatar name={post.author.name} size="md" />
        <VStack gap={0.5} style={{ flex: 1 }}>
          <HStack gap={1.5} align="center">
            <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
              {post.author.name}
            </Text>
            {post.author.tier !== 'bronze' ? (
              <Badge
                label={post.author.tier === 'silver' ? 'S' : 'G'}
                tone={post.author.tier === 'silver' ? 'brand' : 'warning'}
              />
            ) : null}
          </HStack>
          <Text variant="caption" tone="secondary">
            {post.author.flat ? `${post.author.flat} · ` : ''}
            {relativeTime(post.createdAt)}
          </Text>
        </VStack>
        <Pressable
          onPress={() => setReportOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="More options"
        >
          <MoreHorizontal size={20} color={colors.surface.textSecondary} />
        </Pressable>
      </HStack>

      <ReportSheet
        visible={reportOpen}
        targetId={post.id}
        targetType="post"
        onClose={() => setReportOpen(false)}
      />

      <Badge
        label={meta.label}
        tone={meta.tone}
        leftIcon={<TypeIcon size={11} color={TONE_FG[meta.tone] ?? colors.gray[700]} />}
      />

      <Text variant="body" style={{ color: colors.surface.heading, lineHeight: 22 }}>
        {post.body}
      </Text>

      {post.pollOptions ? (
        <VStack gap={2}>
          {post.pollOptions.map((opt) => {
            const total = post.pollOptions!.reduce((s, o) => s + o.votes, 0);
            const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
            return (
              <View key={opt.id} style={styles.pollOption}>
                <View style={[styles.pollBar, { width: `${pct}%` as any }]} />
                <View style={styles.pollRow}>
                  <Text variant="body" style={{ flex: 1, fontWeight: '600', color: colors.surface.heading }}>
                    {opt.label}
                  </Text>
                  <Text variant="caption" tone="secondary">{pct}%</Text>
                </View>
              </View>
            );
          })}
          <Text variant="caption" tone="secondary">
            {post.pollOptions.reduce((s, o) => s + o.votes, 0)} votes · tap to vote
          </Text>
        </VStack>
      ) : null}

      {post.media && post.media.length > 0 ? (
        <View style={styles.mediaWrap}>
          {post.media.length === 1 ? (
            <View>
              <Image
                source={{ uri: post.media[0].type === 'video' ? (post.media[0].thumb ?? post.media[0].uri) : post.media[0].uri }}
                style={styles.mediaSingle}
                resizeMode="cover"
              />
              {post.media[0].type === 'video' ? (
                <View style={styles.videoPlay}>
                  <Play size={28} color="#fff" fill="#fff" />
                </View>
              ) : null}
            </View>
          ) : (
            <View style={{ flexDirection: 'row', gap: spacing[2] }}>
              <View style={{ flex: 2 }}>
                <Image
                  source={{ uri: post.media[0].uri }}
                  style={styles.mediaThumbFirst}
                  resizeMode="cover"
                />
              </View>
              <View style={{ flex: 1, gap: spacing[2] }}>
                {post.media.slice(1, 3).map((m, i) => (
                  <View key={i}>
                    <Image
                      source={{ uri: m.type === 'video' ? (m.thumb ?? m.uri) : m.uri }}
                      style={styles.mediaThumb}
                      resizeMode="cover"
                    />
                    {m.type === 'video' ? (
                      <View style={[styles.videoPlay, { borderRadius: radius.md }]}>
                        <Play size={18} color="#fff" fill="#fff" />
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      ) : null}

      {post.location ? (
        <HStack gap={1.5} align="center">
          <MapPin size={13} color={colors.surface.textSecondary} />
          <Text variant="caption" tone="secondary">{post.location.label}</Text>
        </HStack>
      ) : null}

      {post.tags.length > 0 ? (
        <HStack gap={2} wrap>
          {post.tags.map((t) => (
            <Text key={t} variant="caption" style={{ color: colors.brand[600] }}>
              #{t}
            </Text>
          ))}
        </HStack>
      ) : null}

      <View style={styles.postDivider} />

      <HStack gap={2} align="center">
        <Pressable
          onPress={() => onReact(reaction === 'like' ? 'like' : 'like')}
          style={styles.actionBtn}
          accessibilityRole="button"
        >
          <Heart
            size={18}
            color={reaction ? colors.semantic.danger : colors.surface.textSecondary}
            fill={reaction ? colors.semantic.danger : 'transparent'}
          />
          <Text
            variant="caption"
            style={{
              color: reaction ? colors.semantic.danger : colors.surface.textSecondary,
              fontWeight: '600',
            }}
          >
            {totalReactions + (reaction ? 1 : 0)}
          </Text>
        </Pressable>

        <Pressable
          onPress={() =>
            router.push({ pathname: '/(feed)/post/[id]', params: { id: post.id } })
          }
          style={styles.actionBtn}
          accessibilityRole="button"
          accessibilityLabel="Comment"
        >
          <MessageCircle size={18} color={colors.surface.textSecondary} />
          <Text variant="caption" tone="secondary" style={{ fontWeight: '600' }}>
            {post.commentCount}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            Share.share({
              message: `Check this out on Lokul: lokul://feed/post/${post.id}`,
            }).catch(() => {
              // user cancelled — no-op
            });
          }}
          style={styles.actionBtn}
          accessibilityRole="button"
          accessibilityLabel="Share"
        >
          <Send size={18} color={colors.surface.textSecondary} />
        </Pressable>

        <View style={{ flex: 1 }} />

        <Pressable
          onPress={onSave}
          style={styles.actionBtn}
          accessibilityRole="button"
          accessibilityLabel={saved ? 'Saved' : 'Save'}
        >
          <Bookmark
            size={18}
            color={saved ? colors.brand[600] : colors.surface.textSecondary}
            fill={saved ? colors.brand[600] : 'transparent'}
          />
        </Pressable>
      </HStack>

      {totalReactions > 0 ? (
        <HStack gap={1} align="center">
          {(Object.entries(post.reactions) as [ReactionKind, number][]).map(([k, n]) => {
            if (!n) return null;
            const RIcon = REACTION_ICONS[k];
            return (
              <HStack key={k} gap={0.5} align="center">
                <RIcon size={12} color={colors.surface.textSecondary} />
                <Text variant="caption" tone="secondary">{n}</Text>
              </HStack>
            );
          })}
          <Text variant="caption" tone="secondary">
            {'  · '}
            {post.viewCount} views
          </Text>
        </HStack>
      ) : null}
    </Card>
  );
}

function PromoCarousel() {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const isPaused = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (isPaused.current) return;
      const next = (active + 1) % PROMO_SLIDES.length;
      scrollRef.current?.scrollTo({ x: next * SCREEN_W, animated: true });
      setActive(next);
    }, 4000);
    return () => clearInterval(timer);
  }, [active]);

  function handlePress(slide: PromoSlide) {
    if (slide.ctaRoute) router.push(slide.ctaRoute as any);
  }

  return (
    <View style={styles.carouselWrap}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={() => { isPaused.current = true; }}
        onScrollEndDrag={() => { isPaused.current = false; }}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
          setActive(idx);
        }}
      >
        {PROMO_SLIDES.map((slide) => (
          <Pressable
            key={slide.id}
            style={[styles.slide, { backgroundColor: slide.bgColor, width: SCREEN_W }]}
            onPress={() => handlePress(slide)}
          >
            {slide.type === 'brand' ? (
              <Text style={styles.adTag}>#Ad</Text>
            ) : (
              <Text style={styles.newOnLokul}>*NewOnLokul</Text>
            )}
            <View style={styles.slideInner}>
              <Text style={styles.slideEmoji}>{slide.emoji}</Text>
              <View style={styles.slideTextCol}>
                <Text style={styles.slideTitle}>{slide.title}</Text>
                <Text style={styles.slideSub}>{slide.subtitle}</Text>
                <View style={styles.slideCta}>
                  <Text style={styles.slideCtaText}>{slide.ctaLabel} →</Text>
                </View>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.dotRow}>
        {PROMO_SLIDES.map((_, i) => (
          <View key={i} style={[styles.dotIndicator, i === active && styles.dotIndicatorActive]} />
        ))}
      </View>
    </View>
  );
}

function ApiPostCard({ post }: { post: ApiFeedPost }) {
  const userId = useWalletStore((s) => s.userId);
  const [liked,        setLiked]        = useState(false);
  const [reactionCount, setReactionCount] = useState(post.reactionCount);
  const [reportOpen,   setReportOpen]   = useState(false);

  async function handleLike() {
    if (!userId) return;
    const next = !liked;
    setLiked(next);
    setReactionCount((c) => c + (next ? 1 : -1));
    try {
      if (next) {
        await fetch(`${BASE}/api/mobile/posts/${post.id}/react`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ userId, kind: 'like' }),
        });
      } else {
        await fetch(`${BASE}/api/mobile/posts/${post.id}/react`, {
          method:  'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ userId }),
        });
      }
    } catch {
      // Revert optimistic update on failure
      setLiked(!next);
      setReactionCount((c) => c + (next ? -1 : 1));
    }
  }

  return (
    <Card padding={4} elevation="sm" style={{ gap: spacing[3] }}>
      {post.pinned && (
        <HStack gap={1.5} align="center">
          <Pin size={12} color={colors.brand[600]} />
          <Text variant="caption" style={{ color: colors.brand[700], fontWeight: '700', textTransform: 'uppercase' }}>Pinned</Text>
        </HStack>
      )}
      <HStack gap={3} align="center">
        <Avatar name={post.author.name} size="md" />
        <VStack gap={0.5} style={{ flex: 1 }}>
          <HStack gap={1.5} align="center">
            <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>{post.author.name}</Text>
            {post.author.kycTier !== 'bronze' && (
              <Badge label={post.author.kycTier === 'silver' ? 'S' : 'G'} tone={post.author.kycTier === 'silver' ? 'brand' : 'warning'} />
            )}
          </HStack>
          <Text variant="caption" tone="secondary">{relativeTime(new Date(post.createdAt).getTime())}</Text>
        </VStack>
        <Pressable onPress={() => setReportOpen(true)} accessibilityRole="button" accessibilityLabel="More options">
          <MoreHorizontal size={20} color={colors.surface.textSecondary} />
        </Pressable>
      </HStack>

      <ReportSheet visible={reportOpen} targetId={post.id} targetType="post" onClose={() => setReportOpen(false)} />

      <Text variant="body" style={{ color: colors.surface.heading, lineHeight: 22 }}>{post.body}</Text>

      {post.media && post.media.length > 0 ? (
        <View style={styles.mediaWrap}>
          {post.media.length === 1 ? (
            <Image source={{ uri: post.media[0].url }} style={styles.mediaSingle} resizeMode="cover" />
          ) : (
            <View style={{ flexDirection: 'row', gap: spacing[2] }}>
              <View style={{ flex: 2 }}>
                <Image source={{ uri: post.media[0].url }} style={styles.mediaThumbFirst} resizeMode="cover" />
              </View>
              <View style={{ flex: 1, gap: spacing[2] }}>
                {post.media.slice(1, 3).map((m, i) => (
                  <Image key={i} source={{ uri: m.url }} style={styles.mediaThumb} resizeMode="cover" />
                ))}
              </View>
            </View>
          )}
        </View>
      ) : null}

      {post.tags.length > 0 && (
        <HStack gap={2} wrap>
          {post.tags.map((t) => (
            <Text key={t} variant="caption" style={{ color: colors.brand[600] }}>#{t}</Text>
          ))}
        </HStack>
      )}

      <View style={styles.postDivider} />

      <HStack gap={2} align="center">
        <Pressable onPress={handleLike} style={styles.actionBtn} accessibilityRole="button">
          <Heart
            size={18}
            color={liked ? colors.semantic.danger : colors.surface.textSecondary}
            fill={liked ? colors.semantic.danger : 'transparent'}
          />
          <Text variant="caption" style={{ color: liked ? colors.semantic.danger : colors.surface.textSecondary, fontWeight: '600' }}>
            {reactionCount}
          </Text>
        </Pressable>
        <Text variant="caption" tone="secondary">· {post.commentCount} comments</Text>
        {post.tags.length > 0 && <Badge label={post.tags[0].toUpperCase()} tone="neutral" />}
      </HStack>
    </Card>
  );
}

function AdStripCard({ strip }: { strip: AdStrip }) {
  return (
    <View style={[styles.adStrip, { backgroundColor: strip.bgColor }]}>
      <View style={styles.adEmojiBox}>
        <Text style={{ fontSize: 22 }}>{strip.emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.adBrand}>{strip.brand}</Text>
        <Text style={styles.adTagline}>{strip.tagline}</Text>
      </View>
      <View style={styles.adRight}>
        <View style={styles.adCtaBtn}>
          <Text style={styles.adCtaText}>{strip.ctaLabel}</Text>
        </View>
        <Text style={styles.adLabel}>#Ad</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  header: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
    backgroundColor: colors.surface.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.semantic.danger,
    borderWidth: 1.5,
    borderColor: colors.surface.background,
  },
  filterWrap: {
    backgroundColor: colors.surface.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.border,
  },
  filterRow: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    gap: spacing[2.5],
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: radius.full,
    backgroundColor: colors.gray[100],
  },
  chipActive: {
    backgroundColor: colors.brand[600],
  },
  chipGhost: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing[1],
  },
  filterDot: {
    position: 'absolute',
    top: 4,
    right: 5,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.semantic.danger,
    borderWidth: 1.5,
    borderColor: colors.gray[100],
  },
  // ── Filter sheet ────────────────────────────────────────────────────────────
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '75%',
    backgroundColor: colors.surface.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[6],
    gap: spacing[3],
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
  },
  list: {
    paddingHorizontal: spacing[4],
    paddingTop: 0,
    paddingBottom: spacing[16],
  },
  postDivider: {
    height: 1,
    backgroundColor: colors.surface.border,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
  },
  digest: {
    backgroundColor: colors.brand[50],
    borderWidth: 1,
    borderColor: colors.brand[100],
  },
  digestIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.brand[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: spacing[6],
    right: spacing[5],
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand[600],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.brand[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  // ── Post Media ──────────────────────────────────────────────────────────────
  mediaWrap: { gap: spacing[1] },
  mediaSingle: { width: '100%', height: 200, borderRadius: radius.lg },
  mediaThumbFirst: { width: '100%', height: 164, borderRadius: radius.md },
  mediaThumb: { width: '100%', height: 78, borderRadius: radius.md },
  videoPlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: radius.lg,
  },
  // ── Poll ────────────────────────────────────────────────────────────────────
  pollOption: {
    borderRadius: radius.md, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.surface.border,
    position: 'relative',
  },
  pollBar: {
    position: 'absolute', top: 0, bottom: 0, left: 0,
    backgroundColor: colors.brand[50],
  },
  pollRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing[3], paddingVertical: spacing[2],
  },
  // ── Promo Carousel ──────────────────────────────────────────────────────────
  carouselWrap: { marginHorizontal: -spacing[4], marginBottom: spacing[2] },
  slide: {
    height: 152,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[4],
    justifyContent: 'space-between',
  },
  adTag: {
    alignSelf: 'flex-start',
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.5,
    marginBottom: spacing[1],
  },
  slideInner: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing[3] },
  slideEmoji: { fontSize: 40, lineHeight: 48 },
  slideTextCol: { flex: 1, gap: spacing[1] },
  newOnLokul: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.75)', letterSpacing: 0.4 },
  slideTitle: { fontSize: 15, fontWeight: '800', color: '#fff', lineHeight: 20 },
  slideSub: { fontSize: 11, color: 'rgba(255,255,255,0.85)', lineHeight: 16 },
  slideCta: {
    marginTop: spacing[1.5], alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing[2], paddingVertical: 4,
    borderRadius: radius.full, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  slideCtaText: { fontSize: 9, fontWeight: '700', color: '#fff' },
  dotRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 5,
    paddingVertical: spacing[2], backgroundColor: colors.surface.background,
  },
  dotIndicator: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.gray[300] },
  dotIndicatorActive: { width: 16, backgroundColor: colors.brand[500] },
  // ── Ad Strips ───────────────────────────────────────────────────────────────
  adStrip: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[3],
    borderRadius: radius.lg, padding: spacing[3],
    borderWidth: 1, borderColor: colors.surface.border,
  },
  adEmojiBox: {
    width: 44, height: 44, borderRadius: radius.md,
    backgroundColor: 'rgba(0,0,0,0.07)',
    alignItems: 'center', justifyContent: 'center',
  },
  adBrand: { fontSize: 13, fontWeight: '700', color: colors.surface.foreground },
  adTagline: { fontSize: 11, color: colors.surface.textSecondary, marginTop: 1 },
  adRight: { alignItems: 'flex-end', gap: 4 },
  adCtaBtn: {
    backgroundColor: colors.brand[600],
    paddingHorizontal: spacing[3], paddingVertical: spacing[1],
    borderRadius: radius.full,
  },
  adCtaText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  adLabel: { fontSize: 9, color: colors.surface.textSecondary },
});
