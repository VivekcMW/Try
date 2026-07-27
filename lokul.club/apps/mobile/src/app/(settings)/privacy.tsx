import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { HStack, Text, VStack } from '@/components/ui';
import { useProfileStore } from '@/store/profileStore';
import { type ProfilePrivacy } from '@/types/profile';
import { colors, radius, spacing } from '@lokul/ui-tokens';

type SettingItem = {
  key: keyof ProfilePrivacy;
  label: string;
  subtitle: string;
};

type Section = {
  title: string;
  items: SettingItem[];
};

const SECTIONS: Section[] = [
  {
    title: 'Profile Visibility',
    items: [
      { key: 'showFlatNumber',   label: 'Show Flat Number',           subtitle: 'Let other residents see your flat details' },
      { key: 'showPhoneNumber',  label: 'Show Phone Number',          subtitle: 'Let residents see your contact number' },
      { key: 'showInDirectory',  label: 'Show in Resident Directory', subtitle: 'Appear in the society member list' },
      { key: 'showReviews',      label: 'Show Reviews & Ratings',     subtitle: 'Others can see ratings you have given or received' },
    ],
  },
  {
    title: 'Activity & Chat',
    items: [
      { key: 'showOnlineStatus',      label: 'Online Status',       subtitle: 'Show when you were last active in chat' },
      { key: 'readReceipts',          label: 'Read Receipts',       subtitle: 'Show others when you have read their messages' },
      { key: 'typingIndicator',       label: 'Typing Indicator',    subtitle: 'Show typing... to people you chat with' },
      { key: 'activityStatusOnPosts', label: 'Activity on Posts',   subtitle: 'Show when you react or comment on a post' },
    ],
  },
  {
    title: 'Search & Discovery',
    items: [
      { key: 'discoverableInSearch', label: 'Discoverable in Search', subtitle: 'Others can find your profile by name' },
      { key: 'anonymousPosting',     label: 'Anonymous Posting',      subtitle: 'Post to feed without showing your name' },
    ],
  },
  {
    title: 'Data & Location',
    items: [
      { key: 'preciseLocation', label: 'Precise Location Sharing', subtitle: 'Share exact location vs. only neighbourhood' },
      { key: 'usageAnalytics',  label: 'Usage Analytics',          subtitle: 'Help improve Lokul by sharing anonymised data' },
      { key: 'personalizedAds', label: 'Personalised Ads',         subtitle: 'See ads relevant to your interests' },
    ],
  },
];

export default function PrivacyScreen() {
  const router = useRouter();
  const privacy = useProfileStore((s) => s.profile.privacy);
  const updatePrivacy = useProfileStore((s) => s.updatePrivacy);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack gap={3} align="center" style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Privacy</Text>
      </HStack>

      <ScrollView contentContainerStyle={styles.scroll}>
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text variant="caption" style={styles.sectionHeader}>{section.title.toUpperCase()}</Text>
            <View style={styles.card}>
              {section.items.map((item, i) => (
                <HStack
                  key={item.key}
                  gap={3}
                  align="center"
                  style={StyleSheet.flatten([
                    styles.row,
                    i < section.items.length - 1 ? styles.rowBorder : undefined,
                  ])}
                >
                  <VStack gap={0.5} style={{ flex: 1 }}>
                    <Text variant="body" style={{ fontWeight: '600', color: colors.surface.heading }}>
                      {item.label}
                    </Text>
                    <Text variant="caption" tone="secondary">{item.subtitle}</Text>
                  </VStack>
                  <View style={styles.switchWrap}>
                    <Switch
                      value={privacy[item.key]}
                      onValueChange={(value) => updatePrivacy({ [item.key]: value })}
                      trackColor={{ false: colors.gray[200], true: '#16A34A' }}
                      thumbColor="#fff"
                      ios_backgroundColor={colors.gray[200]}
                    />
                  </View>
                </HStack>
              ))}
            </View>
          </View>
        ))}

        <Text variant="caption" tone="secondary" style={styles.footer}>
          Your data is never sold. For questions, contact privacy@lokul.club
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.gray[50] },
  topBar: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.surface.background,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.surface.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center',
  },
  scroll: { paddingBottom: spacing[16] },
  section: { marginTop: spacing[5], paddingHorizontal: spacing[4] },
  sectionHeader: {
    color: colors.gray[500],
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: spacing[2],
    marginLeft: spacing[1],
  },
  card: {
    backgroundColor: colors.surface.background,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: colors.surface.border,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  row: { paddingHorizontal: spacing[4], paddingVertical: spacing[4] },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: colors.surface.border },
  switchWrap: { transform: [{ scale: 0.78 }], marginRight: -4 },
  footer: { paddingHorizontal: spacing[5], paddingTop: spacing[3] },
});
