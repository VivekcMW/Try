import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Search,
  Plus,
  Star,
  Users,
  Clock,
  ChevronRight,
  Palette,
  Music,
  Code,
  Camera,
  BookOpen,
  Utensils,
  Dumbbell,
  Languages,
  Briefcase,
  Scissors,
} from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { useWalletStore } from '@/store/walletStore';
import { useOnboardingStore } from '@/store/onboardingStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const MODE_META = {
  teach: { label: 'Teaching' },
  learn: { label: 'Learning' },
  exchange: { label: 'Exchange' },
};
type SkillMode = keyof typeof MODE_META;

type ApiSkillOffer = {
  id: string;
  skill: string;
  category: string;
  description: string;
  experience: string;
  mode: SkillMode;
  availability: string;
  pricePaise: number | null;
  featured: boolean;
  responseCount: number;
  ratingAvg: number | null;
  ratingCount: number;
  sessionsCompleted: number;
  connected?: boolean;
  owner: { id: string; name: string };
};

/* ════════════════════════════════════════════════════════════════════════
   CATEGORIES
   ═══════════════════════════════════════════════════════════════════════ */

type SkillCategoryMeta = {
  id: string;
  name: string;
  icon: typeof Palette;
  color: string;
};

const CATEGORIES: SkillCategoryMeta[] = [
  { id: 'art', name: 'Art & Craft', icon: Palette, color: '#EC4899' },
  { id: 'music', name: 'Music', icon: Music, color: '#8B5CF6' },
  { id: 'tech', name: 'Tech & Coding', icon: Code, color: '#3B82F6' },
  { id: 'photo', name: 'Photography', icon: Camera, color: '#F59E0B' },
  { id: 'academic', name: 'Academic', icon: BookOpen, color: '#10B981' },
  { id: 'cooking', name: 'Cooking', icon: Utensils, color: '#EF4444' },
  { id: 'fitness', name: 'Fitness & Yoga', icon: Dumbbell, color: '#06B6D4' },
  { id: 'language', name: 'Languages', icon: Languages, color: '#6366F1' },
  { id: 'business', name: 'Business', icon: Briefcase, color: '#14B8A6' },
  { id: 'lifestyle', name: 'Lifestyle', icon: Scissors, color: '#F472B6' },
];

export const SKILL_CATEGORIES = CATEGORIES;

/* ════════════════════════════════════════════════════════════════════════ */

const MODE_CONFIG = {
  teach: { label: MODE_META.teach.label, color: colors.semantic.success, bg: colors.semantic.successBg },
  learn: { label: MODE_META.learn.label, color: colors.brand[600], bg: colors.brand[50] },
  exchange: { label: MODE_META.exchange.label, color: '#8B5CF6', bg: '#EDE9FE' },
};

function CategoryChip({ category, selected, onPress }: { category: SkillCategoryMeta; selected: boolean; onPress: () => void }) {
  const Icon = category.icon;

  return (
    <Pressable
      style={[styles.categoryChip, selected && { backgroundColor: category.color, borderColor: category.color }]}
      onPress={onPress}
    >
      <Icon size={16} color={selected ? colors.background : category.color} />
      <Text
        variant="caption"
        style={{ fontWeight: selected ? '600' : '400', color: selected ? colors.background : colors.foreground }}
      >
        {category.name}
      </Text>
    </Pressable>
  );
}

function SkillCard({
  offer,
  onPress,
  onConnect,
}: {
  offer: ApiSkillOffer;
  onPress: () => void;
  onConnect: () => void;
}) {
  const mode = MODE_CONFIG[offer.mode];
  const alreadyConnected = !!offer.connected;

  return (
    <Pressable onPress={onPress}>
      <Card style={StyleSheet.flatten([styles.skillCard, offer.featured && styles.skillCardFeatured])}>
        {offer.featured && (
          <View style={styles.featuredBadge}>
            <Star size={10} color={colors.background} fill={colors.background} />
            <Text variant="caption" style={{ fontWeight: '700', color: colors.background }}>Featured</Text>
          </View>
        )}

        <HStack gap="md" style={styles.skillHeader}>
          <View style={styles.avatar}>
            <Text variant="body" style={{ fontWeight: '700', color: colors.brand[600] }}>
              {offer.owner.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </Text>
          </View>
          <VStack style={{ flex: 1 }}>
            <HStack gap="sm">
              <Text variant="body" style={{ fontWeight: '600' }}>{offer.owner.name}</Text>
              <View style={[styles.modeBadge, { backgroundColor: mode.bg }]}>
                <Text variant="caption" style={{ color: mode.color }}>{mode.label}</Text>
              </View>
            </HStack>
            <Text variant="caption" tone="secondary">
              {offer.experience}
            </Text>
          </VStack>
        </HStack>

        <Text variant="bodyLg" style={[{ fontWeight: '600' }, styles.skillName]}>{offer.skill}</Text>
        <Text variant="caption" tone="secondary" numberOfLines={2}>{offer.description}</Text>

        <HStack style={styles.skillMeta}>
          <HStack gap="xs">
            <Star size={12} color={colors.semantic.warning} fill={colors.semantic.warning} />
            <Text variant="caption" style={{ fontWeight: '500' }}>{offer.ratingAvg?.toFixed(1) ?? 'New'}</Text>
            {offer.ratingCount > 0 && <Text variant="caption" tone="secondary">({offer.ratingCount})</Text>}
          </HStack>
          <HStack gap="xs">
            <Users size={12} color={colors.textSecondary} />
            <Text variant="caption" tone="secondary">{offer.sessionsCompleted} sessions</Text>
          </HStack>
          <HStack gap="xs">
            <Clock size={12} color={colors.textSecondary} />
            <Text variant="caption" tone="secondary">{offer.availability}</Text>
          </HStack>
        </HStack>

        <HStack style={styles.skillFooter}>
          {offer.pricePaise ? (
            <Text variant="body" style={{ fontWeight: '700', color: colors.brand[600] }}>₹{Math.round(offer.pricePaise / 100)}/session</Text>
          ) : (
            <Text variant="body" style={{ fontWeight: '500', color: '#8B5CF6' }}>Free / Exchange</Text>
          )}
          <Button
            label={alreadyConnected ? 'Requested' : 'Connect'}
            size="sm"
            variant={alreadyConnected ? 'secondary' : 'primary'}
            disabled={alreadyConnected}
            onPress={onConnect}
          />
        </HStack>
      </Card>
    </Pressable>
  );
}

export default function SkillExchangeScreen() {
  const router = useRouter();
  const userId = useWalletStore((s) => s.userId);
  const pinCode = useOnboardingStore((s) => s.pin);
  const [activeTab, setActiveTab] = useState<'browse' | 'my'>('browse');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<'all' | SkillMode>('all');
  const [offers, setOffers] = useState<ApiSkillOffer[]>([]);
  const [myPosts, setMyPosts] = useState<ApiSkillOffer[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!pinCode) { setLoading(false); return; }
    setLoading(true);
    try {
      const requesterQuery = userId ? `&requesterId=${userId}` : '';
      const [browseRes, mineRes] = await Promise.all([
        fetch(`${BASE}/api/mobile/skills?pinCode=${pinCode}${requesterQuery}`),
        userId ? fetch(`${BASE}/api/mobile/skills?ownerId=${userId}`) : Promise.resolve(null),
      ]);
      const browseData = await browseRes.json();
      const mineData = mineRes ? await mineRes.json() : { offers: [] };
      setOffers(browseData.offers ?? []);
      setMyPosts(mineData.offers ?? []);
    } catch {
      setOffers([]);
      setMyPosts([]);
    } finally {
      setLoading(false);
    }
  }, [pinCode, userId]);

  useEffect(() => { load(); }, [load]);

  const browseOffers = offers.filter((o) => o.owner.id !== userId);

  const filteredOffers = browseOffers.filter((offer) => {
    if (selectedCategory && offer.category !== selectedCategory) return false;
    if (selectedMode !== 'all' && offer.mode !== selectedMode) return false;
    return true;
  });

  const handleConnect = async (offer: ApiSkillOffer) => {
    if (!userId) return;
    if (offer.connected) {
      Alert.alert('Already requested', `You've already sent a connection request for "${offer.skill}".`);
      return;
    }
    try {
      await fetch(`${BASE}/api/mobile/skills/${offer.id}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requesterId: userId }),
      });
      setOffers((prev) => prev.map((o) => (o.id === offer.id ? { ...o, connected: true } : o)));
      Alert.alert('Request sent', `${offer.owner.name} will see your interest in "${offer.skill}".`);
    } catch {
      Alert.alert('Failed', 'Could not send the request. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <HStack style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <VStack style={styles.headerTitle}>
          <Text variant="h3" style={{ fontWeight: '700' }}>Skill Exchange</Text>
          <Text variant="caption" tone="secondary">Learn & teach with neighbors</Text>
        </VStack>
        <Pressable onPress={() => router.push('/(skills)/add')} hitSlop={8}>
          <Plus size={24} color={colors.brand[600]} />
        </Pressable>
      </HStack>

      {/* Tabs */}
      <HStack style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === 'browse' && styles.tabActive]}
          onPress={() => setActiveTab('browse')}
        >
          <Text
            variant="body"
            style={{ fontWeight: activeTab === 'browse' ? '600' : '400', color: activeTab === 'browse' ? colors.brand[600] : colors.textSecondary }}
          >
            Browse Skills
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'my' && styles.tabActive]}
          onPress={() => setActiveTab('my')}
        >
          <Text
            variant="body"
            style={{ fontWeight: activeTab === 'my' ? '600' : '400', color: activeTab === 'my' ? colors.brand[600] : colors.textSecondary }}
          >
            My Posts
          </Text>
        </Pressable>
      </HStack>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      ) : activeTab === 'browse' ? (
        <>
          {/* Mode Filter */}
          <HStack style={styles.modeFilter}>
            {(['all', 'teach', 'learn', 'exchange'] as const).map((mode) => (
              <Pressable
                key={mode}
                style={[styles.modeChip, selectedMode === mode && styles.modeChipActive]}
                onPress={() => setSelectedMode(mode)}
              >
                <Text
                  variant="caption"
                  style={{ fontWeight: selectedMode === mode ? '600' : '400', color: selectedMode === mode ? colors.background : colors.foreground }}
                >
                  {mode === 'all' ? 'All' : MODE_CONFIG[mode].label}
                </Text>
              </Pressable>
            ))}
          </HStack>

          {/* Categories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesRow}
          >
            {CATEGORIES.map((cat) => (
              <CategoryChip
                key={cat.id}
                category={cat}
                selected={selectedCategory === cat.id}
                onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              />
            ))}
          </ScrollView>

          {/* Skills List */}
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <VStack gap="md" style={styles.section}>
              {filteredOffers.map((offer) => (
                <SkillCard
                  key={offer.id}
                  offer={offer}
                  onPress={() => router.push(`/(skills)/${offer.id}`)}
                  onConnect={() => handleConnect(offer)}
                />
              ))}

              {filteredOffers.length === 0 && (
                <Card style={styles.emptyCard}>
                  <Search size={48} color={colors.textSecondary} />
                  <Text variant="bodyLg" style={[{ fontWeight: '500' }, styles.emptyText]}>
                    No skills found
                  </Text>
                  <Text variant="caption" tone="secondary">
                    Try adjusting your filters
                  </Text>
                </Card>
              )}
            </VStack>
            <View style={styles.bottomPadding} />
          </ScrollView>
        </>
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <VStack gap="md" style={styles.section}>
            {myPosts.length > 0 ? (
              <>
                {myPosts.map((post) => (
                  <Pressable key={post.id} onPress={() => router.push(`/(skills)/${post.id}`)}>
                    <Card style={styles.myPostCard}>
                      <HStack>
                        <VStack style={{ flex: 1 }}>
                          <Text variant="body" style={{ fontWeight: '600' }}>{post.skill}</Text>
                          <HStack gap="sm">
                            <View style={[styles.modeBadge, { backgroundColor: MODE_CONFIG[post.mode].bg }]}>
                              <Text variant="caption" style={{ color: MODE_CONFIG[post.mode].color }}>
                                {MODE_CONFIG[post.mode].label}
                              </Text>
                            </View>
                            <Text variant="caption" tone="secondary">
                              {post.responseCount} responses
                            </Text>
                          </HStack>
                        </VStack>
                        <HStack gap="sm">
                          <Button
                            label="View"
                            size="sm"
                            variant="secondary"
                            onPress={() => router.push(`/(skills)/${post.id}`)}
                          />
                          <ChevronRight size={20} color={colors.textSecondary} />
                        </HStack>
                      </HStack>
                    </Card>
                  </Pressable>
                ))}

                <View style={{ marginTop: spacing.md }}>
                  <Button
                    label="Add New Skill"
                    variant="secondary"
                    onPress={() => router.push('/(skills)/add')}
                  />
                </View>
              </>
            ) : (
              <Card style={styles.emptyCard}>
                <BookOpen size={48} color={colors.textSecondary} />
                <Text variant="bodyLg" style={[{ fontWeight: '500' }, styles.emptyText]}>
                  No skill posts yet
                </Text>
                <Text variant="caption" tone="secondary" style={styles.emptySubtext}>
                  Share what you can teach or what you want to learn
                </Text>
                <View style={styles.emptyButton}>
                  <Button
                    label="Post Your First Skill"
                    onPress={() => router.push('/(skills)/add')}
                  />
                </View>
              </Card>
            )}
          </VStack>
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { flex: 1 },
  tabs: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.brand[600],
  },
  modeFilter: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  modeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeChipActive: {
    backgroundColor: colors.brand[600],
    borderColor: colors.brand[600],
  },
  categoriesScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  categoriesRow: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scroll: { flex: 1 },
  section: {
    padding: spacing.lg,
  },
  skillCard: {
    padding: spacing.md,
    position: 'relative',
  },
  skillCardFeatured: {
    borderColor: colors.semantic.warning,
    borderWidth: 1,
  },
  featuredBadge: {
    position: 'absolute',
    top: 0,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.semantic.warning,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderBottomLeftRadius: radius.sm,
    borderBottomRightRadius: radius.sm,
  },
  skillHeader: {
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  skillName: {
    marginBottom: spacing.xs,
  },
  skillMeta: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.lg,
    flexWrap: 'wrap',
  },
  skillFooter: {
    marginTop: spacing.md,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  myPostCard: {
    padding: spacing.md,
  },
  emptyCard: {
    padding: spacing[6],
    alignItems: 'center',
  },
  emptyText: { marginTop: spacing.md },
  emptySubtext: { textAlign: 'center', marginTop: spacing.xs },
  emptyButton: { marginTop: spacing.md },
  bottomPadding: { height: 100 },
});
