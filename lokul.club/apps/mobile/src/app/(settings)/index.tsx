import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  HelpCircle,
  Info,
  Languages,
  Lock,
  LogOut,
  Shield,
  User,
  Zap,
} from 'lucide-react-native';
import { Avatar, HStack, LanguagePicker, Text, VStack } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useProfileStore } from '@/store/profileStore';
import { useVerificationStore } from '@/store/verificationStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { usePeerStore, type PeerRole } from '@/store/peerRoleStore';
import { useBusinessStore } from '@/store/businessStore';
import { colors, spacing } from '@lokul/ui-tokens';

type SettingItem = {
  id: string;
  icon: React.FC<{ size: number; color: string }>;
  label: string;
  subtitle?: string;
  route?: string;
  destructive?: boolean;
};

export default function SettingsIndexScreen() {
  const { t } = useTranslation(['settings', 'common']);
  const router = useRouter();
  const [languageOpen, setLanguageOpen] = useState(false);
  const resetOnboarding = useOnboardingStore((s) => s.reset);
  const resetVerification = useVerificationStore((s) => s.resetVerification);
  const resetProfile = useProfileStore((s) => s.resetProfile);
  const syncFromOnboarding = useProfileStore((s) => s.syncFromOnboarding);
  const profile = useProfileStore((s) => s.profile);

  const handleDevUnlockAll = () => {
    const roles = Object.keys(usePeerStore.getState().roles) as PeerRole[];
    const activateRole = usePeerStore.getState().activate;
    roles.forEach((role) => activateRole(role));

    useVerificationStore.getState().approveGold();

    useSubscriptionStore.getState().activate('business', 12, 'dev-unlock', 0);

    if (!useBusinessStore.getState().myBusiness) {
      useBusinessStore.getState().registerBusiness({
        name: 'Test Business (Dev)',
        category: 'kirana',
        merchantType: 'retail',
        ownerName: profile.name || 'Dev Tester',
        phone: profile.phone || '+919876543210',
        address: profile.societyName || 'Dev Locality',
        hoursOpen: '09:00',
        hoursClose: '21:00',
        closedOn: [],
        bio: 'Dev-only test business for end-to-end testing.',
        paymentModes: ['upi', 'cash'],
      });
    }

    Alert.alert(
      'Dev unlock complete',
      `Activated ${roles.length} peer roles, gold KYC, Lokul Business subscription, and a test business profile.`,
    );
  };

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

  const settings: SettingItem[] = [
    { id: 'profile', icon: User, label: t('settings:edit_profile'), subtitle: t('settings:edit_profile_subtitle'), route: '/(settings)/edit-profile' },
    { id: 'privacy', icon: Shield, label: t('settings:privacy'), subtitle: t('settings:privacy_subtitle'), route: '/(settings)/privacy' },
    { id: 'notifications', icon: Bell, label: t('settings:notifications'), subtitle: t('settings:notifications_subtitle'), route: '/(settings)/notifications' },
    { id: 'security', icon: Lock, label: t('settings:security'), subtitle: t('settings:security_subtitle'), route: '/(settings)/security' },
    { id: 'language', icon: Languages, label: t('common:language'), subtitle: undefined },
    { id: 'help', icon: HelpCircle, label: t('settings:help_support'), route: '/(settings)/help-support' },
    { id: 'about', icon: Info, label: t('settings:about'), subtitle: t('settings:about_subtitle') },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack gap={3} align="center" style={styles.header}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')} hitSlop={10} accessibilityLabel="Go back">
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ color: colors.surface.heading, flex: 1 }}>{t('settings:title')}</Text>
      </HStack>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing[16] }}>
        {/* Profile card */}
        <View style={styles.profileCard}>
          <HStack gap={3} align="center">
            <Avatar name={profile.name || 'Arjun Kumar'} source={profile.photoUri ? { uri: profile.photoUri } : undefined} size="lg" />
            <VStack gap={0.5} style={{ flex: 1 }}>
              <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
                {profile.name || t('settings:profile_name')}
              </Text>
              <Text variant="caption" tone="secondary">
                {profile.societyName
                  ? `${profile.societyName}${profile.tower ? ` · ${profile.tower}` : ''}${profile.flat ? ` · ${profile.flat}` : ''}`
                  : t('settings:profile_meta')}
              </Text>
            </VStack>
            <ChevronRight size={18} color={colors.gray[400]} />
          </HStack>
        </View>

        {/* Settings list */}
        <VStack gap={0} style={styles.settingsList}>
          {settings.map((item, index) => {
            const Icon = item.icon;
            return (
              <Pressable
                key={item.id}
                onPress={() => {
                  if (item.id === 'language') {
                    setLanguageOpen(true);
                    return;
                  }
                  if (item.route) router.push(item.route as any);
                }}
                style={[
                  styles.settingRow,
                  index < settings.length - 1 && styles.settingRowBorder,
                ]}
                accessibilityRole="button"
              >
                <View style={[styles.iconWrap, item.destructive && { backgroundColor: '#FEF2F2' }]}>
                  <Icon size={18} color={item.destructive ? colors.semantic.danger : colors.brand[600]} />
                </View>
                <VStack gap={0} style={{ flex: 1 }}>
                  <Text
                    variant="body"
                    style={{
                      fontWeight: '600',
                      color: item.destructive ? colors.semantic.danger : colors.surface.heading,
                    }}
                  >
                    {item.label}
                  </Text>
                  {item.subtitle && (
                    <Text variant="caption" tone="secondary">{item.subtitle}</Text>
                  )}
                </VStack>
                <ChevronRight size={16} color={colors.gray[300]} />
              </Pressable>
            );
          })}
        </VStack>

        {/* Dev-only: unlock every feature for end-to-end testing */}
        {__DEV__ && (
          <Pressable onPress={handleDevUnlockAll} style={styles.devUnlockBtn} accessibilityRole="button">
            <Zap size={18} color={colors.brand[600]} fill={colors.brand[600]} />
            <VStack gap={0} style={{ flex: 1 }}>
              <Text style={{ color: colors.brand[700], fontWeight: '700', fontSize: 15 }}>
                Dev: Unlock all features
              </Text>
              <Text variant="caption" tone="secondary">
                All peer roles, gold KYC, Business subscription — for testing only
              </Text>
            </VStack>
          </Pressable>
        )}

        {/* Sign out */}
        <Pressable
          onPress={() => {
            resetVerification();
            resetOnboarding();
            resetProfile();
            router.replace('/(onboarding)/splash' as any);
          }}
          style={styles.signOutBtn}
          accessibilityRole="button"
        >
          <LogOut size={18} color={colors.semantic.danger} />
          <Text style={{ color: colors.semantic.danger, fontWeight: '700', fontSize: 15 }}>
            {t('settings:sign_out')}
          </Text>
        </Pressable>

        <LanguagePicker visible={languageOpen} onClose={() => setLanguageOpen(false)} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.background },
  header: {
    paddingHorizontal: spacing[5], paddingTop: spacing[5], paddingBottom: spacing[3],
  },
  profileCard: {
    marginHorizontal: spacing[4], marginBottom: spacing[3],
    backgroundColor: colors.surface.background, borderRadius: 14,
    padding: spacing[4],
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  settingsList: {
    marginHorizontal: spacing[4], backgroundColor: colors.surface.background,
    borderRadius: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[3],
    paddingHorizontal: spacing[4], paddingVertical: spacing[4],
  },
  settingRowBorder: {
    borderBottomWidth: 0.5, borderBottomColor: colors.surface.border,
  },
  iconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.brand[50], alignItems: 'center', justifyContent: 'center',
  },
  devUnlockBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[3],
    marginHorizontal: spacing[4], marginTop: spacing[4],
    padding: spacing[4], borderRadius: 14,
    backgroundColor: colors.brand[50], borderWidth: 1.5, borderColor: colors.brand[200],
  },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing[2], marginHorizontal: spacing[4], marginTop: spacing[4],
    paddingVertical: spacing[4], borderRadius: 14,
    backgroundColor: '#FEF2F2', borderWidth: 1.5, borderColor: '#FCA5A5',
  },
});
