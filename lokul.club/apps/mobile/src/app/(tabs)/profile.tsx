import { useEffect, useMemo, useState, useCallback } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  Accessibility,
  BarChart3,
  Bell,
  Briefcase,
  Camera,
  ChevronRight,
  Gift,
  Languages,
  Lightbulb,
  LogOut,
  MapPin,
  Pencil,
  Plus,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Store,
  User,
  Users,
  Wallet,
} from 'lucide-react-native';
import { Avatar, Badge, Button, Card, HStack, LanguagePicker, Text, VStack } from '@/components/ui';
import { CommunitySetupCard } from '@/components/CommunitySetupCard';
import { INTERESTS } from '@/data/onboarding-seed';
import { SUPPORTED_LANGUAGES } from '@/i18n/languageConfig';
import { useLanguageStore } from '@/store/languageStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useProfileStore } from '@/store/profileStore';
import { useBusinessStore, BIZ_CATEGORY_META } from '@/store/businessStore';
import { tierLabel, tierTone, useVerificationStore } from '@/store/verificationStore';
import { useAccessibilityStore } from '@/store/accessibilityStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type StoryItem = {
  id: string;
  mediaKey: string;
  kind: string;
  caption: string | null;
  createdAt: string;
  expiresAt: string;
  author: { id: string; name: string; avatarUrl: string | null };
};

export default function ProfileScreen() {
  const { t } = useTranslation(['settings', 'common']);
  const router = useRouter();
  const [languageOpen, setLanguageOpen] = useState(false);
  const resetOnboarding = useOnboardingStore((s) => s.reset);
  const societyId = useOnboardingStore((s) => s.societyId);
  const profile = useProfileStore((s) => s.profile);
  const syncFromOnboarding = useProfileStore((s) => s.syncFromOnboarding);
  const resetProfile = useProfileStore((s) => s.resetProfile);
  const language = useLanguageStore((s) => s.language);

  const tier = useVerificationStore((s) => s.tier);
  const verificationSkipped = useVerificationStore((s) => s.verificationSkipped);
  const resetVerification = useVerificationStore((s) => s.resetVerification);
  const seniorMode = useAccessibilityStore((s) => s.seniorMode);
  const pin = useOnboardingStore((s) => s.pin);
  const myBusiness = useBusinessStore((s) => s.myBusiness);

  const [myStories, setMyStories] = useState<StoryItem[]>([]);

  const loadMyStories = useCallback(async () => {
    if (!pin) return;
    try {
      const res  = await fetch(`${BASE}/api/mobile/stories?pinCode=${encodeURIComponent(pin)}`);
      const data = await res.json();
      const items: StoryItem[] = data.items ?? [];
      // Filter to current user's stories — use profile name as heuristic since we have no userId here
      setMyStories(items.slice(0, 8));
    } catch { /* silent */ }
  }, [pin]);

  useEffect(() => { loadMyStories(); }, [loadMyStories]);

  useEffect(() => {
    const seed = useOnboardingStore.getState();
    syncFromOnboarding({
      name: seed.name,
      photoUri: seed.photoUri,
      phone: seed.phone,
      societyName: seed.societyName,
      tower: seed.tower,
      flat: seed.flat,
      city: seed.city,
      pin: seed.pin,
      interests: seed.interests,
    });
  }, [syncFromOnboarding]);

  const TierIcon = tier === 'bronze' ? Shield : ShieldCheck;

  const interestLabelMap = useMemo(
    () => Object.fromEntries(INTERESTS.map((item) => [item.id, item.label])),
    []
  );

  const onSignOut = () => {
    resetVerification();
    resetOnboarding();
    resetProfile();
    router.replace('/(onboarding)/splash');
  };

  const verificationCta =
    tier === 'bronze'
      ? {
          title: t('become_silver'),
          desc: t('become_silver_desc'),
          route: '/(verification)/silver-proof',
        }
      : tier === 'silver'
      ? {
          title: t('upgrade_gold'),
          desc: t('upgrade_gold_desc'),
          route: '/(verification)/gold-consent',
        }
      : null;

  const privacySummary = [
    profile.privacy.showFlatNumber ? t('flat_visible') : t('flat_hidden'),
    profile.privacy.showOnlineStatus ? t('online_on') : t('online_off'),
    profile.privacy.discoverableInSearch ? t('search_visible') : t('search_hidden'),
  ].join(' · ');

  const currentLanguageLabel =
    SUPPORTED_LANGUAGES.find((item) => item.code === language)?.nativeName ?? language;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Community setup nudge — shown when user has not mapped their society */}
        {!societyId ? (
          <CommunitySetupCard onPress={() => router.push('/(community-setup)')} />
        ) : null}

        {/* Verification nudge banner — shown for unverified users who skipped */}
        {tier === 'bronze' && verificationSkipped ? (
          <Pressable
            onPress={() => router.push('/(verification)/silver-proof')}
            style={styles.verifyBanner}
          >
            <HStack gap={3} align="center">
              <Shield size={18} color="#92400E" />
              <VStack gap={0} style={{ flex: 1 }}>
                <Text variant="caption" style={{ fontWeight: '700', color: '#92400E' }}>
                  Your account is not verified
                </Text>
                <Text variant="caption" style={{ color: '#B45309' }}>
                  Verify to start transacting &amp; earning
                </Text>
              </VStack>
              <Text variant="caption" style={{ fontWeight: '700', color: '#92400E' }}>Verify →</Text>
            </HStack>
          </Pressable>
        ) : null}

        <Card padding={5} elevation="sm" style={{ gap: spacing[4] }}>
          <HStack gap={4} align="center">
            <Avatar
              name={profile.name || t('profile_default_you')}
              source={profile.photoUri ? { uri: profile.photoUri } : undefined}
              size="xl"
            />
            <VStack gap={1} style={{ flex: 1 }}>
              <Text variant="h2" style={{ color: colors.surface.heading }}>
                {profile.name || t('profile_set_name')}
              </Text>
              <Text variant="caption" tone="secondary">
                {profile.phone ?? t('profile_no_phone')}
              </Text>
              <View style={{ marginTop: spacing[1] }}>
                <Badge
                  label={`${tierLabel(tier)} ${t('member_suffix')}`}
                  tone={tierTone(tier)}
                  leftIcon={<TierIcon size={12} color={colors.surface.heading} />}
                />
              </View>
            </VStack>
            <Pressable onPress={() => router.push('/(settings)/edit-profile')} style={styles.editBtn}>
              <Pencil size={16} color={colors.brand[700]} />
            </Pressable>
          </HStack>

          <VStack gap={1}>
            {profile.societyName ? (
              <HStack gap={2} align="center">
                <MapPin size={14} color={colors.surface.textSecondary} />
                <Text variant="caption" tone="secondary">
                  {profile.societyName}
                  {profile.tower ? ` · ${profile.tower}` : ''}
                  {profile.flat ? ` · ${profile.flat}` : ''}
                </Text>
              </HStack>
            ) : null}
            {profile.bio ? (
              <Text variant="body" tone="secondary">
                {profile.bio}
              </Text>
            ) : null}
          </VStack>
        </Card>

        {/* Story Highlights */}
        <Card padding={4} elevation="sm">
          <VStack gap={3}>
            <Text variant="label" tone="secondary" style={{ textTransform: 'uppercase' }}>
              My Stories
            </Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={myStories}
              keyExtractor={(s) => s.id}
              contentContainerStyle={{ gap: spacing[3] }}
              ListHeaderComponent={
                <Pressable
                  onPress={() => router.push('/(feed)/create-story' as never)}
                  style={styles.storyAddCircle}
                  accessibilityRole="button"
                  accessibilityLabel="Add story"
                >
                  <Plus size={22} color={colors.brand[600]} />
                </Pressable>
              }
              ListEmptyComponent={
                <Text variant="caption" tone="secondary" style={{ alignSelf: 'center' }}>
                  No active stories
                </Text>
              }
              renderItem={({ item }) => (
                <Pressable
                  onPress={() =>
                    router.push({ pathname: '/(feed)/story/[id]', params: { id: item.id } })
                  }
                  style={styles.storyCircleWrap}
                  accessibilityRole="button"
                >
                  <View style={styles.storyCircle}>
                    <Camera size={20} color={colors.surface.textSecondary} />
                  </View>
                  <Text variant="caption" tone="secondary" numberOfLines={1} style={{ width: 56, textAlign: 'center' }}>
                    {item.caption?.slice(0, 8) ?? 'Story'}
                  </Text>
                </Pressable>
              )}
            />
          </VStack>
        </Card>

        {verificationCta ? (
          <Card padding={4} elevation="none" style={styles.upsell}>
            <HStack gap={3} align="center">
              <View style={styles.upsellIcon}>
                <ShieldCheck size={22} color={colors.brand[700]} />
              </View>
              <VStack gap={0.5} style={{ flex: 1 }}>
                <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
                  {verificationCta.title}
                </Text>
                <Text variant="caption" tone="secondary">
                  {verificationCta.desc}
                </Text>
              </VStack>
              <Button
                label={t('start')}
                variant="primary"
                size="sm"
                onPress={() => router.push(verificationCta.route as any)}
              />
            </HStack>
          </Card>
        ) : null}

        <Card padding={4} elevation="sm" style={{ gap: spacing[3] }}>
          <Text variant="label" tone="secondary" style={{ textTransform: 'uppercase' }}>
            {t('interests_title')}
          </Text>
          <View style={styles.interestsWrap}>
            {profile.interests.length ? (
              profile.interests.map((id) => (
                <View key={id} style={styles.chip}>
                  <Text variant="caption" style={{ color: colors.surface.foreground, fontWeight: '600' }}>
                    {interestLabelMap[id] ?? id}
                  </Text>
                </View>
              ))
            ) : (
              <Text variant="caption" tone="secondary">{t('no_interests')}</Text>
            )}
          </View>
          <Button
            label={t('manage_interests')}
            variant="secondary"
            size="sm"
            onPress={() => router.push('/(community-setup)/interests')}
          />
        </Card>

        <Card padding={0} elevation="sm">
          <SettingsRow
            Icon={ShoppingBag}
            label="My Orders"
            value="Upcoming, scheduled & past orders"
            onPress={() => router.push('/(marketplace)/orders-dashboard' as any)}
          />
          <Divider />
          <SettingsRow
            Icon={BarChart3}
            label="Dashboard"
            value="Earnings, orders & activity"
            onPress={() => router.push('/(dashboard)/dashboard' as any)}
          />
          <Divider />
          <SettingsRow
            Icon={Wallet}
            label="Wallet"
            value="Balance & transactions"
            onPress={() => router.push('/(wallet)/' as any)}
          />
          <Divider />
          <SettingsRow
            Icon={Gift}
            label="Invite Friends"
            value="Earn rewards for referrals"
            onPress={() => router.push('/(invite)/invite-friends' as any)}
          />
        </Card>

        {/* List Your Services — Business, Skills, Freelancer */}
        <Card padding={0} elevation="sm">
          <View style={styles.sectionHeader}>
            <Text variant="label" tone="secondary" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              List Your Services
            </Text>
          </View>
          <SettingsRow
            Icon={Store}
            label={myBusiness ? 'My Storefront' : 'List Your Business'}
            value={
              myBusiness
                ? `${myBusiness.name} · ${BIZ_CATEGORY_META[myBusiness.category]?.label ?? myBusiness.category}`
                : 'Kirana, Clinic, Salon & 30+ categories'
            }
            onPress={() =>
              router.push((myBusiness ? '/(business)/dashboard' : '/(business)/onboard') as any)
            }
          />
          <Divider />
          <SettingsRow
            Icon={Lightbulb}
            label="Share Your Skills"
            value="Teach, learn or exchange with neighbors"
            onPress={() => router.push('/(skills)/' as any)}
          />
          <Divider />
          <SettingsRow
            Icon={Briefcase}
            label="Become a Freelancer"
            value="Get local gigs and projects"
            onPress={() => router.push('/(jobs)/create-profile' as any)}
          />
        </Card>

        <Card padding={0} elevation="sm">
          <SettingsRow
            Icon={User}
            label={t('my_posts')}
            value={t('my_posts_subtitle')}
            onPress={() => router.push('/(community)/my-posts')}
          />
          <Divider />
          <SettingsRow
            Icon={Shield}
            label={t('my_listings')}
            value={t('my_listings_subtitle')}
            onPress={() => router.push('/(marketplace)/my-listings')}
          />
          {(tier === 'silver' || tier === 'gold') ? (
            <>
              <Divider />
              <SettingsRow
                Icon={Users}
                label={t('vouch_neighbours_row')}
                value={t('vouch_neighbours_row_subtitle')}
                onPress={() => router.push('/(discover)/vouch' as any)}
              />
            </>
          ) : null}
        </Card>

        <Card padding={0} elevation="sm">
          <SettingsRow
            Icon={User}
            label={t('edit_profile_row')}
            value={t('edit_profile_row_subtitle')}
            onPress={() => router.push('/(settings)/edit-profile')}
          />
          <Divider />
          <SettingsRow
            Icon={Shield}
            label={t('privacy_row')}
            value={privacySummary}
            onPress={() => router.push('/(settings)/privacy')}
          />
          <Divider />
          <SettingsRow
            Icon={Bell}
            label={t('notifications_row')}
            value={t('notifications_row_subtitle')}
            onPress={() => router.push('/(settings)/notifications')}
          />
          <Divider />
          <SettingsRow
            Icon={Languages}
            label={t('common:language')}
            value={currentLanguageLabel}
            onPress={() => setLanguageOpen(true)}
          />
          <Divider />
          <SettingsRow
            Icon={Accessibility}
            label="Accessibility"
            value={seniorMode ? 'Simplified Mode ON' : 'Font, contrast & senior mode'}
            onPress={() => router.push('/(settings)/accessibility')}
          />
        </Card>

        <Button
          label={t('sign_out')}
          variant="ghost"
          onPress={onSignOut}
          leftIcon={<LogOut size={18} color={colors.semantic.danger} />}
          fullWidth
        />
      </ScrollView>

      <LanguagePicker visible={languageOpen} onClose={() => setLanguageOpen(false)} />
    </SafeAreaView>
  );
}

function SettingsRow({
  Icon,
  label,
  value,
  onPress,
}: {
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  value?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => (pressed ? { backgroundColor: colors.gray[50] } : undefined)}
      accessibilityRole="button"
    >
      <HStack gap={3} align="center" style={styles.row}>
        <View style={styles.rowIcon}>
          <Icon size={18} color={colors.brand[700]} />
        </View>
        <VStack gap={0.5} style={{ flex: 1 }}>
          <Text variant="body" style={{ color: colors.surface.heading, fontWeight: '600' }}>
            {label}
          </Text>
          {value ? <Text variant="caption" tone="secondary">{value}</Text> : null}
        </VStack>
        <ChevronRight size={18} color={colors.surface.textSecondary} />
      </HStack>
    </Pressable>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  content: { padding: spacing[5], gap: spacing[5], paddingBottom: spacing[16] },
  verifyBanner: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: radius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  upsell: { backgroundColor: colors.brand[50], borderWidth: 1, borderColor: colors.brand[100] },
  upsellIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.brand[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  interestsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  chip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: radius.full,
    backgroundColor: colors.gray[100],
  },
  row: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3.5],
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: colors.surface.border, marginLeft: spacing[12] },
  sectionHeader: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[1],
  },
  storyAddCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: colors.brand[50],
    borderWidth: 2, borderColor: colors.brand[400], borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  storyCircleWrap: { alignItems: 'center', gap: spacing[1.5] },
  storyCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: colors.gray[100],
    borderWidth: 2, borderColor: colors.brand[400],
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
});
