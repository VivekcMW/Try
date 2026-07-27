import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BadgeCheck, ChevronRight, MapPin, PartyPopper, Sparkles } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import {
  Avatar,
  Badge,
  Button,
  Card,
  HStack,
  Screen,
  Text,
  VStack,
} from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useVerificationStore } from '@/store/verificationStore';
import { useWalletStore } from '@/store/walletStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

export default function WelcomeFeedScreen() {
  const { t } = useTranslation('onboarding');
  const router = useRouter();
  const { phone, name, photoUri, city, pin } = useOnboardingStore();
  const setWalletUserId = useWalletStore((s) => s.setUserId);
  const setWalletToken = useWalletStore((s) => s.setToken);
  const skipVerification = useVerificationStore((s) => s.skipVerification);

  const enterFeed = () => {
    // Navigate immediately — user creation runs in background
    router.replace('/(tabs)');
    const base = process.env.EXPO_PUBLIC_API_BASE ?? '';
    fetch(`${base}/api/mobile/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, name, avatarUrl: photoUri, pin, city }),
    }).then(async (res) => {
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.id) setWalletUserId(data.id);
        if (data.token) setWalletToken(data.token);
      }
    }).catch(() => { /* offline — continue anyway */ });
  };

  return (
    <Screen padded={false} scroll>
      <View style={styles.body}>
        <VStack gap={6} align="center">
          <View style={styles.celebrate}>
            <PartyPopper size={48} color={colors.accent[500]} strokeWidth={1.5} />
            <View style={[styles.sparkle, { top: 8, right: 12 }]}>
              <Sparkles size={20} color={colors.accent[500]} />
            </View>
            <View style={[styles.sparkle, { bottom: 18, left: 6 }]}>
              <Sparkles size={14} color={colors.brand[500]} />
            </View>
          </View>

          <VStack gap={2} align="center">
            <Text variant="h1" style={{ textAlign: 'center' }}>
              {t('welcome_title', { name: name || t('welcome_fallback_name') })}
            </Text>
            <Text variant="bodyLg" tone="secondary" style={{ textAlign: 'center' }}>
              {t('welcome_subtitle')}
            </Text>
          </VStack>

          <Badge label={t('bronze_verified')} tone="brand" size="md" />
        </VStack>

        <Card padding={4} elevation="sm" style={styles.summary}>
          <HStack gap={3} align="center">
            <Avatar source={photoUri ? { uri: photoUri } : undefined} name={name} size="lg" />
            <VStack gap={0.5} style={{ flex: 1 }}>
              <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
                {name || t('your_name_fallback')}
              </Text>
              <HStack gap={1.5} align="center">
                <MapPin size={12} color={colors.surface.textSecondary} />
                <Text variant="caption" tone="secondary">
                  {city ?? pin}
                </Text>
              </HStack>
            </VStack>
          </HStack>

          <View style={styles.divider} />

          <HStack gap={2} wrap>
            <View style={[styles.chip, { backgroundColor: colors.brand[50] }]}>
              <Text variant="caption" style={{ color: colors.brand[700], fontWeight: '600' }}>
                {city ?? pin}
              </Text>
            </View>
          </HStack>
        </Card>

        <VStack gap={3}>
          <Text variant="label" tone="secondary" style={{ textTransform: 'uppercase' }}>
            {t('next_steps')}
          </Text>
          <NextStep
            title={t('verify_address_title')}
            description={t('verify_address_description')}
            badgeLabel="Silver"
            badgeTone="warning"
            onPress={() => router.push('/(verification)/silver-proof')}
          />
          <NextStep
            title={t('verify_identity_title')}
            description={t('verify_identity_description')}
            badgeLabel="Gold"
            badgeTone="success"
            onPress={() => router.push('/(verification)/gold-consent')}
          />
        </VStack>
      </View>

      <View style={styles.footer}>
        <Button
          label={t('take_to_feed')}
          onPress={enterFeed}
          rightIcon={<ChevronRight size={20} color="#fff" />}
          fullWidth
          size="lg"
        />
        <View style={{ height: spacing[2] }} />
        <Button
          label={t('skip_verification')}
          variant="ghost"
          onPress={() => { skipVerification(); enterFeed(); }}
          fullWidth
        />
      </View>
    </Screen>
  );
}

function NextStep({
  title,
  description,
  badgeLabel,
  badgeTone,
  onPress,
}: {
  title: string;
  description: string;
  badgeLabel: string;
  badgeTone: 'warning' | 'success' | 'brand';
  onPress?: () => void;
}) {
  return (
    <Card padding={4} elevation="none" bordered onPress={onPress}>
      <HStack gap={3} align="center">
        <View style={styles.nextIcon}>
          <BadgeCheck size={22} color={colors.brand[600]} />
        </View>
        <VStack gap={1} style={{ flex: 1 }}>
          <HStack gap={2} align="center">
            <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
              {title}
            </Text>
            <Badge label={badgeLabel} tone={badgeTone} />
          </HStack>
          <Text variant="caption" tone="secondary">
            {description}
          </Text>
        </VStack>
        <ChevronRight size={18} color={colors.surface.textSecondary} />
      </HStack>
    </Card>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[8],
    gap: spacing[6],
  },
  celebrate: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.accent[50],
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  sparkle: {
    position: 'absolute',
  },
  summary: {
    gap: spacing[3],
  },
  divider: {
    height: 1,
    backgroundColor: colors.surface.border,
    marginVertical: spacing[1],
  },
  chip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    backgroundColor: colors.gray[100],
    borderRadius: radius.full,
  },
  nextIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[6],
    paddingTop: spacing[3],
  },
});
